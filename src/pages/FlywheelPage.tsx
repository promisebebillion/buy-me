import { useState } from 'react'
import { ProtocolScene } from '../components/ProtocolScene'

const modules = [
  { id: 'airdrops', number: '01', label: 'AIRDROPS', flow: 'TOKEN DISTRIBUTION', role: 'GROWTH', detail: 'Moves protocol incentives to eligible wallets.' },
  { id: 'staking', number: '02', label: 'STAKING + LOCKS', flow: 'SUPPLY COMMITMENT', role: 'RETENTION', detail: 'Moves circulating supply into committed positions.' },
  { id: 'liquidity', number: '03', label: 'LIQUIDITY', flow: 'MARKET DEPTH', role: 'ACCESS', detail: 'Supports efficient token routing and market depth.' },
  { id: 'buybacks', number: '04', label: 'BUYBACKS', flow: 'VALUE RETURN', role: 'DEMAND', detail: 'Routes protocol revenue into market repurchases.' },
  { id: 'burns', number: '05', label: 'BURNS', flow: 'SUPPLY REMOVAL', role: 'SCARCITY', detail: 'Permanently removes routed tokens from circulation.' },
  { id: 'supply', number: '06', label: 'SUPPLY', flow: 'SYSTEM STATE', role: 'ACCOUNTING', detail: 'Tracks the resulting circulating token supply.' },
] as const

type ModuleId = typeof modules[number]['id']

export function FlywheelPage() {
  const [selected, setSelected] = useState<ModuleId>('buybacks')
  const active = modules.find((module) => module.id === selected) ?? modules[0]

  return (
    <section className="flywheel-page flywheel-page--clean page-enter">
      <div className="flywheel-heading">
        <h1>Protocol Flywheel</h1>
        <p>Choose a module to inspect how value moves through the system.</p>
      </div>

      <div className="system-map system-map--clean">
        <div className="system-map-head"><span>$BUY VALUE FLOW</span><strong><i /> INTERACTIVE MAP</strong></div>
        <div className="flywheel-canvas"><ProtocolScene variant="flywheel" /></div>
        <div className="module-orbit" aria-label="Protocol modules">
          {modules.map((module) => (
            <button
              className={`module-card module-card--${module.id}${selected === module.id ? ' is-active' : ''}`}
              key={module.id}
              onClick={() => setSelected(module.id)}
            >
              <span>{module.number}</span>
              <strong>{module.label}</strong>
            </button>
          ))}
        </div>
      </div>

      <aside className="flow-inspector flow-inspector--clean">
        <div className="inspector-head"><span>SELECTED MODULE</span><strong>{active.number}</strong></div>
        <div className="selected-module">
          <strong>{active.label}</strong>
          <p>{active.detail}</p>
        </div>
        <div className="flow-values">
          <div><span>VALUE FLOW</span><strong>{active.flow}</strong></div>
          <div><span>SYSTEM ROLE</span><strong>{active.role}</strong></div>
        </div>
        <div className="system-balance">
          <h2>CORE SYSTEM STATE</h2>
          {['LIQUIDITY', 'STAKED', 'LOCKED', 'BURNED'].map((item, index) => (
            <div key={item}><span>{item}</span><i><b style={{ width: `${[42, 31, 24, 18][index]}%` }} /></i><strong>—</strong></div>
          ))}
        </div>
        <p className="inspector-note">Live values will appear after protocol contracts are connected.</p>
      </aside>
    </section>
  )
}
