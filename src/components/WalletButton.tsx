interface WalletButtonProps {
  address: string | null
  status: 'idle' | 'connecting' | 'connected' | 'error'
  error: string | null
  onConnect: () => void
  onDisconnect: () => void
}

function shorten(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`
}

export function WalletButton({
  address,
  status,
  error,
  onConnect,
  onDisconnect,
}: WalletButtonProps) {
  if (!address) {
    return (
      <div className="wallet-shell">
        <button className="wallet-button" onClick={onConnect} disabled={status === 'connecting'}>
          {status === 'connecting' ? 'CONNECTING…' : 'CONNECT WALLET'}
        </button>
        {error && <span className="wallet-error">{error}</span>}
      </div>
    )
  }

  return (
    <div className="wallet-shell wallet-shell--connected">
      <button className="wallet-button wallet-button--address" aria-haspopup="menu">
        <span className="status-dot" />
        {shorten(address)}
      </button>
      <div className="wallet-menu" role="menu">
        <button onClick={() => navigator.clipboard.writeText(address)} role="menuitem">
          COPY ADDRESS
        </button>
        <button onClick={onDisconnect} role="menuitem">
          DISCONNECT
        </button>
      </div>
    </div>
  )
}
