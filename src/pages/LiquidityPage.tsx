import { useMemo, useState } from 'react'
import { ProtocolScene } from '../components/ProtocolScene'
import { InlineSelect, SettingsControl, TokenDropdown } from '../components/InteractiveControls'

interface LiquidityPageProps {
  wallet: {
    address: string | null
    status: 'idle' | 'connecting' | 'connected' | 'error'
    connect: () => void
  }
}

type LiquidityMode = 'add' | 'remove' | 'positions'

export function LiquidityPage({ wallet }: LiquidityPageProps) {
  const [mode, setMode] = useState<LiquidityMode>('add')
  const [buyAmount, setBuyAmount] = useState('')
  const [solAmount, setSolAmount] = useState('')
  const [pool, setPool] = useState('$BUY / SOL')
  const [notice, setNotice] = useState<string | null>(null)
  const buy = Number.parseFloat(buyAmount || '0')
  const sol = Number.parseFloat(solAmount || '0')
  const pairIsValid = Number.isFinite(buy) && buy > 0 && Number.isFinite(sol) && sol > 0

  const actionLabel = useMemo(() => {
    if (wallet.status === 'connecting') return 'CONNECTING…'
    if (!wallet.address) return `CONNECT WALLET TO ${mode === 'positions' ? 'VIEW POSITIONS' : `${mode.toUpperCase()} LIQUIDITY`}`
    if (mode === 'positions') return 'REFRESH LP POSITIONS'
    if (!pairIsValid) return 'ENTER BOTH TOKEN AMOUNTS'
    return `${mode.toUpperCase()} LIQUIDITY`
  }, [mode, pairIsValid, wallet.address, wallet.status])

  const submit = () => {
    if (!wallet.address) {
      wallet.connect()
      return
    }
    if (mode !== 'positions' && !pairIsValid) return
    setNotice('Liquidity pool address and router are not configured yet.')
  }

  return (
    <section className="feature-page liquidity-page page-enter">
      <div className="feature-heading">
        <h1>Liquidity</h1>
      </div>

      <div className="feature-stats">
        <article><span>POOL LIQUIDITY</span><strong>—</strong></article>
        <article><span>24H VOLUME</span><strong>—</strong></article>
        <article><span>LP POSITIONS</span><strong>—</strong></article>
      </div>

      <div className="feature-terminal liquidity-terminal">
        <div className="terminal-topline">
          <div className="terminal-tabs terminal-tabs--three" role="tablist">
            {(['add', 'remove', 'positions'] as LiquidityMode[]).map((item) => <button className={mode === item ? 'is-active' : ''} key={item} onClick={() => setMode(item)}>{item.toUpperCase()}</button>)}
          </div>
        </div>

        <div className="pool-row">
          <div><span>POOL</span><strong>{pool}</strong></div>
          <div className="pool-token-pair"><i>$BUY</i><i>SOL</i></div>
          <b>ACTIVE</b><button aria-label="Choose pool" onClick={() => setPool(pool === '$BUY / SOL' ? '$BUY / USDC' : '$BUY / SOL')}>⌄</button>
        </div>

        <TokenAmountPanel label="YOU SUPPLY" symbol="$BUY" value={buyAmount} onChange={setBuyAmount} disabled={mode === 'positions'} />
        <TokenAmountPanel label="PAIR WITH" symbol="SOL" value={solAmount} onChange={setSolAmount} disabled={mode === 'positions'} secondary />

        <div className="terminal-metrics liquidity-metrics">
          <div><span>POOL RATIO</span><strong>—</strong></div>
          <div><span>YOUR SHARE</span><strong>—</strong></div>
          <div><span>LP POSITION</span><strong>—</strong></div>
        </div>

        <button className="burn-action" onClick={submit} disabled={wallet.status === 'connecting' || (mode !== 'positions' && !!wallet.address && !pairIsValid)}>{actionLabel}</button>
        {notice && <button className="terminal-notice" onClick={() => setNotice(null)}>{notice} ×</button>}
      </div>

      <div className="feature-transaction-bar">
        <InlineSelect label="NETWORK" defaultValue="SOLANA" options={['SOLANA', 'ETHEREUM', 'BASE', 'ARBITRUM']} />
        <InlineSelect label="ROUTER" defaultValue="AUTO" options={['AUTO', 'JUPITER', 'DIRECT']} />
        <div><span>TX PREVIEW</span><strong>—</strong></div>
        <SettingsControl />
      </div>

      <div className="feature-visual"><ProtocolScene variant="liquidity" /></div>

      <div className="feature-history">
        <h2>YOUR LP POSITIONS</h2>
        <div className="burn-table">
          <div className="table-row table-head table-row--four"><span>PAIR</span><span>LIQUIDITY</span><span>SHARE</span><span>STATUS</span></div>
          {[0, 1, 2].map((row) => <div className="table-row table-row--four" key={row}><span>—</span><span>—</span><span>—</span><span>—</span></div>)}
        </div>
      </div>
    </section>
  )
}

interface TokenAmountPanelProps {
  label: string
  symbol: string
  value: string
  onChange: (value: string) => void
  disabled: boolean
  secondary?: boolean
}

function TokenAmountPanel({ label, symbol, value, onChange, disabled, secondary }: TokenAmountPanelProps) {
  const [selectedToken, setSelectedToken] = useState(symbol)

  return (
    <div className={`liquidity-amount-panel${secondary ? ' is-secondary' : ''}`}>
      <label>{label}</label>
      <div className="liquidity-amount-row">
        <div className="token-badge">{selectedToken}</div>
        <TokenDropdown defaultToken={symbol} onChange={setSelectedToken} />
        <input type="number" inputMode="decimal" min="0" placeholder="0.00" value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} aria-label={`${selectedToken} amount`} />
        <button className="max-button" onClick={() => onChange('0')} disabled={disabled}>MAX</button>
      </div>
      <div className="balance">Balance&nbsp; — {selectedToken}</div>
      {!secondary && <div className="percentages">{[25, 50, 75, 100].map((percent) => <button key={percent} onClick={() => onChange('0')}>{percent}%</button>)}</div>}
    </div>
  )
}
