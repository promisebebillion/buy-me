import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { ReactiveGrid } from './ProtocolScene'
import { WalletButton } from './WalletButton'
import { TokenAddressBar } from './TokenAddressBar'

interface AppShellProps {
  route: string
  navigate: (path: string) => void
  wallet: {
    address: string | null
    status: 'idle' | 'connecting' | 'connected' | 'error'
    error: string | null
    connect: () => void
    disconnect: () => void
  }
  children: ReactNode
}

export function AppShell({ route, navigate, wallet, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <ReactiveGrid />
      <Sidebar route={route} navigate={navigate} />
      <header className="topbar">
        {/* Navigation anchors will return when the linked sections are available.
        <nav>
          <a href="#mechanism">MECHANISM</a>
          <a href="#ecosystem">ECOSYSTEM</a>
          <a href="#contract">CONTRACT</a>
        </nav> */}
        <WalletButton
          address={wallet.address}
          status={wallet.status}
          error={wallet.error}
          onConnect={wallet.connect}
          onDisconnect={wallet.disconnect}
        />
      </header>
      <main className="main-view">{children}</main>
      <div className="noise" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
      <TokenAddressBar />
    </div>
  )
}
