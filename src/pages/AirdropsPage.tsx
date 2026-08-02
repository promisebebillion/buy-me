import { useMemo, useState } from 'react'
import { ProtocolScene } from '../components/ProtocolScene'
import { InlineSelect, SettingsControl, TokenDropdown } from '../components/InteractiveControls'

interface AirdropsPageProps {
  wallet: {
    address: string | null
    status: 'idle' | 'connecting' | 'connected' | 'error'
    connect: () => void
  }
}

type AirdropMode = 'distribute' | 'claim'
type RecipientGroup = 'holders' | 'stakers' | 'locked'

export function AirdropsPage({ wallet }: AirdropsPageProps) {
  const [mode, setMode] = useState<AirdropMode>('distribute')
  const [group, setGroup] = useState<RecipientGroup>('holders')
  const [amount, setAmount] = useState('')
  const [token, setToken] = useState('$BUY')
  const [minimum, setMinimum] = useState('')
  const [snapshot, setSnapshot] = useState('LATEST')
  const [notice, setNotice] = useState<string | null>(null)
  const numericAmount = Number.parseFloat(amount || '0')
  const amountIsValid = Number.isFinite(numericAmount) && numericAmount > 0

  const actionLabel = useMemo(() => {
    if (wallet.status === 'connecting') return 'CONNECTING…'
    if (!wallet.address) return mode === 'claim' ? 'CONNECT WALLET TO CLAIM' : 'CONNECT WALLET TO DISTRIBUTE'
    if (mode === 'claim') return 'CHECK AVAILABLE AIRDROPS'
    if (!amountIsValid) return 'ENTER DISTRIBUTION AMOUNT'
    return `DISTRIBUTE ${numericAmount.toFixed(2)} ${token}`
  }, [amountIsValid, mode, numericAmount, token, wallet.address, wallet.status])

  const submit = () => {
    if (!wallet.address) {
      wallet.connect()
      return
    }
    if (mode === 'distribute' && !amountIsValid) return
    setNotice('Airdrop program and eligibility indexer are not configured yet.')
  }

  return (
    <section className="feature-page airdrops-page page-enter">
      <div className="feature-heading">
        <h1>Airdrops</h1>
      </div>

      <div className="feature-stats">
        <article><span>TOTAL DISTRIBUTED</span><strong>—</strong></article>
        <article><span>ACTIVE DROPS</span><strong>—</strong></article>
        <article><span>RECIPIENTS</span><strong>—</strong></article>
      </div>

      <div className="feature-terminal airdrop-terminal">
        <div className="terminal-topline">
          <div className="terminal-tabs" role="tablist">
            <button className={mode === 'distribute' ? 'is-active' : ''} onClick={() => setMode('distribute')}>DISTRIBUTE</button>
            <button className={mode === 'claim' ? 'is-active' : ''} onClick={() => setMode('claim')}>CLAIM</button>
          </div>
        </div>

        <div className="amount-panel compact-amount-panel">
          <label htmlFor="airdrop-amount">TOKEN &amp; AMOUNT</label>
          <div className="amount-row">
            <div className="token-badge">{token}</div>
            <TokenDropdown onChange={setToken} />
            <input
              id="airdrop-amount"
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
        </div>

        <div className="recipient-panel">
          <label>RECIPIENTS</label>
          <button className="select-field" onClick={() => setGroup(group === 'holders' ? 'stakers' : group === 'stakers' ? 'locked' : 'holders')}>{group === 'holders' ? 'ALL HOLDERS' : group.toUpperCase()} <span>⌄</span></button>
          <div className="segmented-control">
            {(['holders', 'stakers', 'locked'] as RecipientGroup[]).map((item) => (
              <button className={group === item ? 'is-active' : ''} key={item} onClick={() => setGroup(item)}>{item.toUpperCase()}</button>
            ))}
          </div>
          <div className="recipient-options">
            <label>
              <span>MIN. HOLDING</span>
              <span><input value={minimum} onChange={(event) => setMinimum(event.target.value)} inputMode="decimal" placeholder="0.00" /> {token}</span>
            </label>
            <button onClick={() => setSnapshot(snapshot === 'LATEST' ? 'FINALIZED' : 'LATEST')}><span>SNAPSHOT</span><strong>{snapshot}</strong><i>⌄</i></button>
          </div>
        </div>

        <div className="terminal-metrics">
          <div><span>ESTIMATED RECIPIENTS</span><strong>—</strong></div>
          <div><span>PER WALLET</span><strong>— &nbsp;{token}</strong></div>
          <div><span>NETWORK FEE</span><strong>—</strong></div>
        </div>

        <button className="burn-action" onClick={submit} disabled={wallet.status === 'connecting' || (mode === 'distribute' && !!wallet.address && !amountIsValid)}>{actionLabel}</button>
        {notice && <button className="terminal-notice" onClick={() => setNotice(null)}>{notice} ×</button>}
      </div>

      <div className="feature-transaction-bar">
        <InlineSelect label="NETWORK" defaultValue="SOLANA" options={['SOLANA', 'ETHEREUM', 'BASE', 'ARBITRUM']} />
        <InlineSelect label="SNAPSHOT" defaultValue="LATEST" options={['LATEST', 'FINALIZED', 'CUSTOM']} />
        <div><span>TX PREVIEW</span><strong>—</strong></div>
        <SettingsControl />
      </div>

      <div className="feature-visual"><ProtocolScene variant="airdrops" /></div>

      <div className="feature-history">
        <h2>RECENT AIRDROPS</h2>
        <div className="burn-table">
          <div className="table-row table-head table-row--four"><span>AMOUNT</span><span>WALLETS</span><span>TX</span><span>TIME</span></div>
          {[0, 1, 2].map((row) => (
            <div className="table-row table-row--four" key={row}><span>—</span><span>—</span><span>—</span><span>—</span></div>
          ))}
        </div>
      </div>
    </section>
  )
}
