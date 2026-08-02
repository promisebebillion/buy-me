import { useState } from 'react'

const defaultTokens = [
  { symbol: '$BUY', name: 'BUY Protocol' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'USDC', name: 'USD Coin' },
  { symbol: 'USDT', name: 'Tether' },
  { symbol: 'BONK', name: 'Bonk' },
]

interface TokenDropdownProps {
  defaultToken?: string
  tokens?: Array<{ symbol: string; name: string }>
  onChange?: (token: string) => void
}

export function TokenDropdown({ defaultToken = '$BUY', tokens = defaultTokens, onChange }: TokenDropdownProps) {
  const [selected, setSelected] = useState(defaultToken)
  const [open, setOpen] = useState(false)

  return (
    <div className="token-dropdown" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
    }}>
      <button className="token-select" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-haspopup="listbox">
        {selected} <span>{open ? '⌃' : '⌄'}</span>
      </button>
      {open && (
        <div className="token-menu" role="listbox">
          {tokens.map((token) => (
            <button
              className={selected === token.symbol ? 'is-selected' : ''}
              key={token.symbol}
              onClick={() => { setSelected(token.symbol); onChange?.(token.symbol); setOpen(false) }}
              role="option"
              aria-selected={selected === token.symbol}
            >
              <strong>{token.symbol}</strong><span>{token.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface InlineSelectProps {
  label: string
  defaultValue: string
  options: string[]
}

export function InlineSelect({ label, defaultValue, options }: InlineSelectProps) {
  const [selected, setSelected] = useState(defaultValue)
  const [open, setOpen] = useState(false)

  return (
    <div className="inline-select-shell" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
    }}>
      <button className="inline-select-button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span>{label}</span><strong>{selected}</strong><i>{open ? '⌃' : '⌄'}</i>
      </button>
      {open && (
        <div className="inline-select-menu">
          {options.map((option) => (
            <button className={selected === option ? 'is-selected' : ''} key={option} onClick={() => { setSelected(option); setOpen(false) }}>
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function SettingsControl() {
  const [open, setOpen] = useState(false)
  const [slippage, setSlippage] = useState('AUTO')
  const [priority, setPriority] = useState('NORMAL')

  return (
    <div className="settings-control" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
    }}>
      <button className={open ? 'is-active' : ''} onClick={() => setOpen((value) => !value)} aria-label="Transaction settings" aria-expanded={open}>⚙</button>
      {open && (
        <div className="settings-popover">
          <div className="settings-title"><span>TRANSACTION SETTINGS</span><button onClick={() => setOpen(false)}>×</button></div>
          <label>SLIPPAGE</label>
          <div>{['AUTO', '0.5%', '1.0%'].map((value) => <button className={slippage === value ? 'is-selected' : ''} key={value} onClick={() => setSlippage(value)}>{value}</button>)}</div>
          <label>PRIORITY</label>
          <div>{['NORMAL', 'FAST'].map((value) => <button className={priority === value ? 'is-selected' : ''} key={value} onClick={() => setPriority(value)}>{value}</button>)}</div>
          <small>Applied to the transaction preview.</small>
        </div>
      )}
    </div>
  )
}
