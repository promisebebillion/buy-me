import { useMemo, useState } from 'react'
import { ProtocolScene } from '../components/ProtocolScene'
import { InlineSelect, SettingsControl, TokenDropdown } from '../components/InteractiveControls'

interface StakingPageProps {
  wallet: {
    address: string | null
    status: 'idle' | 'connecting' | 'connected' | 'error'
    connect: () => void
  }
}

type StakeMode = 'stake' | 'unstake' | 'claim'

export function StakingPage({ wallet }: StakingPageProps) {
  const [mode, setMode] = useState<StakeMode>('stake')
  const [amount, setAmount] = useState('')
  const [token, setToken] = useState('$BUY')
  const [pool, setPool] = useState('$BUY CORE POOL')
  const [notice, setNotice] = useState<string | null>(null)
  const numericAmount = Number.parseFloat(amount || '0')
  const amountIsValid = Number.isFinite(numericAmount) && numericAmount > 0

  const actionLabel = useMemo(() => {
    if (wallet.status === 'connecting') return 'CONNECTING…'
    if (!wallet.address) return `CONNECT WALLET TO ${mode.toUpperCase()}`
    if (mode === 'claim') return 'CLAIM AVAILABLE REWARDS'
    if (!amountIsValid) return 'ENTER AMOUNT'
    return `${mode.toUpperCase()} ${numericAmount.toFixed(2)} ${token}`
  }, [amountIsValid, mode, numericAmount, token, wallet.address, wallet.status])

  const submit = () => {
    if (!wallet.address) {
      wallet.connect()
      return
    }
    if (mode !== 'claim' && !amountIsValid) return
    setNotice('Staking program and reward pool are not configured yet.')
  }

  return (
    <section className="feature-page staking-page page-enter">
      <div className="feature-heading">
        <h1>Staking</h1>
      </div>

      <div className="feature-stats">
        <article><span>TOTAL STAKED</span><strong>—</strong></article>
        <article><span>ACTIVE STAKERS</span><strong>—</strong></article>
        <article><span>REWARDS POOL</span><strong>—</strong></article>
      </div>

      <div className="feature-terminal staking-terminal">
        <div className="terminal-topline">
          <div className="terminal-tabs terminal-tabs--three" role="tablist">
            {(['stake', 'unstake', 'claim'] as StakeMode[]).map((item) => (
              <button className={mode === item ? 'is-active' : ''} key={item} onClick={() => setMode(item)}>{item.toUpperCase()}</button>
            ))}
          </div>
        </div>

        <div className="amount-panel staking-amount-panel">
          <label htmlFor="staking-amount">YOU {mode.toUpperCase()}</label>
          <div className="amount-row">
            <div className="token-badge">{token}</div>
            <TokenDropdown onChange={setToken} />
            <input
              id="staking-amount"
              type="number"
              inputMode="decimal"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              disabled={mode === 'claim'}
            />
            <button className="max-button" onClick={() => setAmount('0')} disabled={mode === 'claim'}>MAX</button>
          </div>
          <div className="balance">Balance&nbsp; — {token}</div>
          <div className="percentages">
            {[25, 50, 75, 100].map((percent) => <button key={percent} onClick={() => setAmount('0')}>{percent}%</button>)}
          </div>
        </div>

        <div className="staking-pool-panel">
          <label>STAKING POOL</label>
          <button className="pool-selector" onClick={() => setPool(pool === '$BUY CORE POOL' ? '$BUY FLEX POOL' : '$BUY CORE POOL')}><span>{pool}</span><i>⌄</i><strong>ACTIVE</strong></button>
          <small>Mode&nbsp; FLEXIBLE</small>
        </div>

        <div className="terminal-metrics staking-metrics">
          <div><span>STAKED AFTER</span><strong>— &nbsp;{token}</strong></div>
          <div><span>POOL SHARE</span><strong>—</strong></div>
          <div><span>EST. REWARDS</span><strong>—</strong></div>
        </div>

        <button className="burn-action" onClick={submit} disabled={wallet.status === 'connecting' || (mode !== 'claim' && !!wallet.address && !amountIsValid)}>{actionLabel}</button>
        {notice && <button className="terminal-notice" onClick={() => setNotice(null)}>{notice} ×</button>}
      </div>

      <div className="feature-transaction-bar">
        <InlineSelect label="NETWORK" defaultValue="SOLANA" options={['SOLANA', 'ETHEREUM', 'BASE', 'ARBITRUM']} />
        <InlineSelect label="MODE" defaultValue="FLEXIBLE" options={['FLEXIBLE', 'FIXED 30D', 'FIXED 90D']} />
        <div><span>TX PREVIEW</span><strong>—</strong></div>
        <SettingsControl />
      </div>

      <div className="feature-visual"><ProtocolScene variant="staking" /></div>

      <div className="feature-history staking-positions">
        <h2>YOUR POSITIONS</h2>
        <div className="burn-table">
          <div className="table-row table-head table-row--four"><span>STAKED</span><span>REWARDS</span><span>STATUS</span><span>ACTION</span></div>
          {[0, 1, 2].map((row) => (
            <div className="table-row table-row--four" key={row}><span>—</span><span>—</span><span>—</span><span>—</span></div>
          ))}
        </div>
      </div>
    </section>
  )
}
