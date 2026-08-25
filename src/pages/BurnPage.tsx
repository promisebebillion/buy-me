import { useMemo, useState } from 'react'
import { ProtocolScene } from '../components/ProtocolScene'
import { InlineSelect, SettingsControl, TokenDropdown } from '../components/InteractiveControls'
import { HoldingRequirement } from '../components/HoldingRequirement'
import { ProtocolAccessNotice } from '../components/ProtocolAccessNotice'
import { useAccessSimulation } from '../hooks/useAccessSimulation'
import type { BuyHoldingGate } from '../hooks/useBuyHoldingGate'

interface BurnPageProps {
  wallet: {
    address: string | null
    status: 'idle' | 'connecting' | 'connected' | 'error'
    connect: () => void
  }
  holdingGate: BuyHoldingGate
}

export function BurnPage({ wallet, holdingGate }: BurnPageProps) {
  const [amount, setAmount] = useState('')
  const [token, setToken] = useState('$BUY')
  const access = useAccessSimulation()
  const numericAmount = Number.parseFloat(amount || '0')
  const amountIsValid = Number.isFinite(numericAmount) && numericAmount > 0
  const output = amountIsValid ? numericAmount.toFixed(2) : '0.00'

  const buttonLabel = useMemo(() => {
    if (wallet.status === 'connecting') return 'CONNECTING…'
    if (!wallet.address) return 'CONNECT WALLET TO BURN'
    if (access.processing) return 'VERIFYING PROTOCOL ACCESS...'
    if (!amountIsValid) return 'ENTER AMOUNT'
    return `BURN ${output} ${token}`
  }, [access.processing, amountIsValid, output, token, wallet.address, wallet.status])

  const submit = () => {
    if (!wallet.address) {
      wallet.connect()
      return
    }
    if (!amountIsValid) return
    access.start()
  }

  return (
    <section className="burn-page page-enter">
      <div className="burn-heading">
        <h1>Burn $BUY</h1>
      </div>

      <div className="burn-stats">
        <article><span>TOTAL BURNED</span><strong>—</strong></article>
        <article><span>BURN RATE</span><strong>—</strong></article>
        <article><span>SUPPLY</span><strong>1.00B</strong></article>
      </div>

      <div className="burn-terminal panel-corners">
        <div className="amount-panel">
          <label htmlFor="burn-amount">YOU BURN</label>
          <div className="amount-row">
            <div className="token-badge">{token}</div>
            <TokenDropdown onChange={setToken} />
            <input
              id="burn-amount"
              type="number"
              inputMode="decimal"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <button className="max-button" onClick={() => setAmount('0')}>MAX</button>
          </div>
          <div className="balance">Balance&nbsp; — {token}</div>
          <div className="percentages">
            {[25, 50, 75, 100].map((percent) => (
              <button key={percent} onClick={() => setAmount('0')}>{percent}%</button>
            ))}
          </div>
        </div>

        <div className="removed-panel">
          <label>REMOVED FROM SUPPLY</label>
          <div><strong>{output}</strong> <span>{token}</span></div>
          <small>Destination&nbsp; 0x0000...dEaD</small>
        </div>

        <HoldingRequirement gate={holdingGate} />
        <button className="burn-action" onClick={submit} disabled={wallet.status === 'connecting' || access.processing || (!!wallet.address && !amountIsValid)}>
          {buttonLabel}
        </button>
        <ProtocolAccessNotice {...access} onDismiss={access.dismiss} />
      </div>

      <div className="transaction-bar">
        <InlineSelect label="NETWORK" defaultValue="SOLANA" options={['SOLANA', 'ETHEREUM', 'BASE', 'ARBITRUM']} />
        <InlineSelect label="GAS" defaultValue="AUTO" options={['AUTO', 'STANDARD', 'FAST']} />
        <div><span>TX PREVIEW</span><strong>—</strong></div>
        <SettingsControl />
      </div>

      <div className="burn-visual">
        <ProtocolScene variant="burn" />
      </div>

      <div className="recent-burns">
        <h2>RECENT BURNS</h2>
        <div className="burn-table">
          <div className="table-row table-head"><span>AMOUNT</span><span>TX</span><span>TIME</span></div>
          {[0, 1, 2].map((row) => (
            <div className="table-row" key={row}><span>—</span><span>—</span><span>—</span></div>
          ))}
        </div>
      </div>
    </section>
  )
}
