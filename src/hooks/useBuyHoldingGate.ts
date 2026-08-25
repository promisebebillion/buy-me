import { useEffect, useState } from 'react'

export const MINIMUM_BUY_HOLDING = 1_000_000n

export type BuyHoldingGateStatus =
  | 'disconnected'
  | 'checking'
  | 'eligible'
  | 'ineligible'
  | 'unavailable'
  | 'error'

export interface BuyHoldingGate {
  status: BuyHoldingGateStatus
  allowed: boolean
  balance: string | null
  minimum: string | null
  share: string | null
  error: string | null
}

interface RpcResponse<T> {
  result?: T
  error?: { message?: string }
}

interface TokenSupplyResult {
  value: {
    amount: string
    decimals: number
  }
}

interface TokenAccountsResult {
  value: Array<{
    account: {
      data: {
        parsed?: {
          info?: {
            tokenAmount?: { amount?: string }
          }
        }
      }
    }
  }>
}

const emptyGate: BuyHoldingGate = {
  status: 'disconnected',
  allowed: false,
  balance: null,
  minimum: null,
  share: null,
  error: null,
}

async function rpcRequest<T>(
  rpcUrl: string,
  method: string,
  params: unknown[],
  signal: AbortSignal,
) {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: method, method, params }),
    signal,
  })

  if (!response.ok) throw new Error(`RPC request failed (${response.status})`)

  const payload = await response.json() as RpcResponse<T>
  if (payload.error || !payload.result) {
    throw new Error(payload.error?.message || `Invalid ${method} response`)
  }

  return payload.result
}

function formatTokenAmount(amount: bigint, decimals: number) {
  if (decimals === 0) return amount.toLocaleString('en-US')

  const scale = 10n ** BigInt(decimals)
  const whole = amount / scale
  const remainder = (amount % scale).toString().padStart(decimals, '0')
  const fraction = remainder.slice(0, 4).replace(/0+$/, '')

  return fraction
    ? `${whole.toLocaleString('en-US')}.${fraction}`
    : whole.toLocaleString('en-US')
}

export function useBuyHoldingGate(address: string | null): BuyHoldingGate {
  const [gate, setGate] = useState<BuyHoldingGate>(emptyGate)

  useEffect(() => {
    if (!address) {
      setGate(emptyGate)
      return
    }

    const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL?.trim()
    const mintAddress = import.meta.env.VITE_BUY_MINT_ADDRESS?.trim()

    if (!rpcUrl || !mintAddress) {
      setGate({
        ...emptyGate,
        status: 'unavailable',
        error: 'Set VITE_SOLANA_RPC_URL and VITE_BUY_MINT_ADDRESS to enable the on-chain check.',
      })
      return
    }

    const controller = new AbortController()
    setGate({ ...emptyGate, status: 'checking' })

    void Promise.all([
      rpcRequest<TokenSupplyResult>(
        rpcUrl,
        'getTokenSupply',
        [mintAddress, { commitment: 'confirmed' }],
        controller.signal,
      ),
      rpcRequest<TokenAccountsResult>(
        rpcUrl,
        'getTokenAccountsByOwner',
        [address, { mint: mintAddress }, { encoding: 'jsonParsed', commitment: 'confirmed' }],
        controller.signal,
      ),
    ]).then(([supplyResult, accountsResult]) => {
      const supply = BigInt(supplyResult.value.amount)
      if (supply <= 0n) throw new Error('$BUY token supply is zero')

      const balance = accountsResult.value.reduce((total, tokenAccount) => {
        const rawAmount = tokenAccount.account.data.parsed?.info?.tokenAmount?.amount
        return rawAmount ? total + BigInt(rawAmount) : total
      }, 0n)

      const minimum = MINIMUM_BUY_HOLDING * (10n ** BigInt(supplyResult.value.decimals))
      const shareHundredths = Number((balance * 10_000n) / supply)
      const eligible = balance >= minimum

      setGate({
        status: eligible ? 'eligible' : 'ineligible',
        allowed: eligible,
        balance: formatTokenAmount(balance, supplyResult.value.decimals),
        minimum: formatTokenAmount(minimum, supplyResult.value.decimals),
        share: `${(shareHundredths / 100).toFixed(2)}%`,
        error: null,
      })
    }).catch((cause: unknown) => {
      if (controller.signal.aborted) return
      setGate({
        ...emptyGate,
        status: 'error',
        error: cause instanceof Error ? cause.message : 'Unable to verify $BUY holdings.',
      })
    })

    return () => controller.abort()
  }, [address])

  return gate
}
