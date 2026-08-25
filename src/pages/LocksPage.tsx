import { useMemo, useState } from 'react'
import { ProtocolScene } from '../components/ProtocolScene'
import { InlineSelect, SettingsControl, TokenDropdown } from '../components/InteractiveControls'
import { HoldingRequirement } from '../components/HoldingRequirement'
import { ProtocolAccessNotice } from '../components/ProtocolAccessNotice'
import { useAccessSimulation } from '../hooks/useAccessSimulation'
import type { BuyHoldingGate } from '../hooks/useBuyHoldingGate'

interface LocksPageProps {
  wallet: {
    address: string | null
    status: 'idle' | 'connecting' | 'connected' | 'error'
    connect: () => void
  }
  holdingGate: BuyHoldingGate
}

type LockMode = 'create lock' | 'extend' | 'unlock'
const periods = [30, 90, 180, 365] as const

export function LocksPage({ wallet, holdingGate }: LocksPageProps) {
  const [mode, setMode] = useState<LockMode>('create lock')
  const [amount, setAmount] = useState('')
  const [token, setToken] = useState('$BUY')
  const [period, setPeriod] = useState<number>(90)
  const access = useAccessSimulation()
  const numericAmount = Number.parseFloat(amount || '0')
  const amountIsValid = Number.isFinite(numericAmount) && numericAmount > 0
  const progress = ((period - 30) / (365 - 30)) * 100

  const unlockDate = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() + period)
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
  }, [period])

  const actionLabel = useMemo(() => {
    if (wallet.status === 'connecting') return 'CONNECTING…'
    if (!wallet.address) return `CONNECT WALLET TO ${mode === 'create lock' ? 'LOCK' : mode.toUpperCase()}`
    if (access.processing) return 'VERIFYING PROTOCOL ACCESS...'
    if (mode !== 'unlock' && !amountIsValid) return 'ENTER AMOUNT'
    if (mode === 'unlock') return 'CHECK UNLOCKABLE TOKENS'
    return `${mode === 'extend' ? 'EXTEND' : 'LOCK'} ${numericAmount.toFixed(2)} ${token}`
  }, [access.processing, amountIsValid, mode, numericAmount, token, wallet.address, wallet.status])

  const submit = () => {
    if (!wallet.address) {
      wallet.connect()
      return
    }
    if (mode !== 'unlock' && !amountIsValid) return
    access.start()
  }

  return (
    <section className="feature-page locks-page page-enter">
      <div className="feature-heading">
        <h1>Token Locks</h1>
      </div>

      <div className="feature-stats">
        <article><span>TOTAL LOCKED</span><strong>—</strong></article>
        <article><span>LOCKED SUPPLY</span><strong>—</strong></article>
        <article><span>NEXT UNLOCK</span><strong>—</strong></article>
      </div>

      <div className="feature-terminal locks-terminal">
        <div className="terminal-topline">
          <div className="terminal-tabs terminal-tabs--three" role="tablist">
            {(['create lock', 'extend', 'unlock'] as LockMode[]).map((item) => (
              <button className={mode === item ? 'is-active' : ''} key={item} onClick={() => setMode(item)}>{item.toUpperCase()}</button>
            ))}
          </div>
        </div>

        <div className="amount-panel locks-amount-panel">
          <label htmlFor="lock-amount">AMOUNT TO {mode === 'create lock' ? 'LOCK' : mode.toUpperCase()}</label>
          <div className="amount-row">
            <div className="token-badge">{token}</div>
            <TokenDropdown onChange={setToken} />
            <input id="lock-amount" type="number" inputMode="decimal" min="0" placeholder="0.00" value={amount} onChange={(event) => setAmount(event.target.value)} disabled={mode === 'unlock'} />
            <button className="max-button" onClick={() => setAmount('0')} disabled={mode === 'unlock'}>MAX</button>
          </div>
          <div className="balance">Balance&nbsp; — {token}</div>
          <div className="percentages">
            {periods.map((_, index) => <button key={index} onClick={() => setAmount('0')}>{[25, 50, 75, 100][index]}%</button>)}
          </div>
        </div>

        <div className="lock-period-panel">
          <label>LOCK PERIOD</label>
          <div className="period-buttons">
            {periods.map((days) => <button className={period === days ? 'is-active' : ''} key={days} onClick={() => setPeriod(days)}>{days}D</button>)}
          </div>
          <div className="duration-scale"><span>NOW</span><div><i style={{ width: `${progress}%` }} /><b style={{ left: `${progress}%` }} /></div><span>UNLOCK</span></div>
          <div className="lock-period-info">
            <div><span>DURATION</span><strong>{period} DAYS</strong></div>
            <div><span>UNLOCK DATE</span><strong>{unlockDate}</strong><i className="calendar-icon" /></div>
          </div>
        </div>

        <div className="terminal-metrics lock-metrics">
          <div><span>LOCKED AMOUNT</span><strong>{amountIsValid ? numericAmount.toFixed(2) : '0.00'} {token}</strong></div>
          <div><span>TIME REMAINING</span><strong>—</strong></div>
          <div><span>EARLY EXIT</span><strong>—</strong></div>
        </div>

        <HoldingRequirement gate={holdingGate} />
        <button className="burn-action" onClick={submit} disabled={wallet.status === 'connecting' || access.processing || (!!wallet.address && mode !== 'unlock' && !amountIsValid)}>{actionLabel}</button>
        <ProtocolAccessNotice {...access} onDismiss={access.dismiss} />
      </div>

      <div className="feature-transaction-bar">
        <InlineSelect label="NETWORK" defaultValue="SOLANA" options={['SOLANA', 'ETHEREUM', 'BASE', 'ARBITRUM']} />
        <InlineSelect label="LOCK TYPE" defaultValue="FIXED" options={['FIXED', 'VESTING', 'CLIFF']} />
        <div><span>TX PREVIEW</span><strong>—</strong></div>
        <SettingsControl />
      </div>

      <div className="feature-visual locks-visual">
        <ProtocolScene variant="locks" />
        <div className="scene-duration"><i style={{ width: `${progress}%` }} /><b style={{ left: `${progress}%` }} /><span>30D</span><span>90D</span><span>180D</span><span>365D</span></div>
      </div>

      <div className="feature-history">
        <h2>YOUR LOCKS</h2>
        <div className="burn-table">
          <div className="table-row table-head table-row--four"><span>AMOUNT</span><span>UNLOCK DATE</span><span>REMAINING</span><span>STATUS</span></div>
          {[0, 1, 2].map((row) => <div className="table-row table-row--four" key={row}><span>—</span><span>—</span><span>—</span><span>—</span></div>)}
        </div>
      </div>
    </section>
  )
}
