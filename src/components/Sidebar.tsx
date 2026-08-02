const sections = [
  ['00', 'INTRO', '/'],
  ['01', 'BURNS', '/burn'],
  ['02', 'AIRDROPS', '/airdrops'],
  ['03', 'STAKING', '/staking'],
  ['04', 'LOCKS', '/locks'],
  ['05', 'LIQUIDITY', '/liquidity'],
  ['06', 'BUYBACKS', '/buybacks'],
  ['07', 'FLYWHEEL', '/flywheel'],
] as const

interface SidebarProps {
  route: string
  navigate: (path: string) => void
}

export function Sidebar({ route, navigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <button className="brand" onClick={() => navigate('/')} aria-label="$BUY home">
        <img src="/logo.png" alt="$BUY" />
      </button>

      <nav className="side-nav" aria-label="Protocol sections">
        {sections.map(([number, label, path]) => {
          const active = path === route
          return (
            <button
              className={`side-link${active ? ' is-active' : ''}`}
              key={number}
              onClick={() => navigate(path)}
              aria-current={active ? 'page' : undefined}
            >
              <i />
              <span>{number}</span>
              <strong>{label}</strong>
            </button>
          )
        })}
      </nav>

      <div className="side-footer">
        <button className="docs-link" onClick={() => navigate('/whitepaper')}>DOCS <span>↗</span></button>
        <div className="socials">
          <a href="#x" aria-label="X">X</a>
          <a href="#telegram" aria-label="Telegram">TG</a>
        </div>
        <div className="live"><span /> LIVE / ON-CHAIN</div>
      </div>
    </aside>
  )
}
