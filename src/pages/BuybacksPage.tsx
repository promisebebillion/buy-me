import { useState } from 'react'
import { ProtocolScene } from '../components/ProtocolScene'
import { InlineSelect, SettingsControl } from '../components/InteractiveControls'

type Route = 'burn' | 'treasury' | 'liquidity'

export function BuybacksPage() {
  const [route, setRoute] = useState<Route>('burn')

  return (
    <section className="feature-page buybacks-page page-enter">
      <div className="feature-heading">
        <h1>Buybacks</h1>
      </div>

      <div className="feature-stats">
        <article><span>TOTAL SPENT</span><strong>—</strong></article>
        <article><span>$BUY ACQUIRED</span><strong>—</strong></article>
        <article><span>ACTIVE ROUTE</span><strong className="route-stat">{route.toUpperCase()}</strong></article>
      </div>

      <div className="buyback-engine buyback-engine--clean">
        <div className="budget-panel">
          <div>
            <span>AVAILABLE BUYBACK BUDGET</span>
            <strong>PROTOCOL REVENUE</strong>
          </div>
          <b>— &nbsp;SOL</b>
          <div className="budget-meta"><span>SOURCE VAULT</span><span>0x0000...0000</span></div>
        </div>

        <div className="execution-panel execution-panel--clean">
          <div className="execution-pair"><span>MARKET EXECUTION</span><strong>SOL&nbsp; → &nbsp;$BUY</strong></div>
          <div className="execution-route"><span>DESTINATION</span><strong>{route.toUpperCase()}</strong></div>
        </div>

        <div className="route-panel route-panel--clean">
          <div className="route-title"><span>POST-BUY DESTINATION</span><strong>CHOOSE VALUE ROUTE</strong></div>
          <div className="route-options">
            {(['burn', 'treasury', 'liquidity'] as Route[]).map((item) => (
              <button className={route === item ? 'is-active' : ''} key={item} onClick={() => setRoute(item)}>{item.toUpperCase()}</button>
            ))}
          </div>
        </div>

        <div className="execution-preview execution-preview--large">
          <div><span>BUDGET</span><strong>— SOL</strong></div>
          <div><span>EST. $BUY</span><strong>—</strong></div>
          <div><span>PRICE IMPACT</span><strong>—</strong></div>
        </div>
      </div>

      <div className="feature-transaction-bar buyback-statusbar">
        <InlineSelect label="NETWORK" defaultValue="SOLANA" options={['SOLANA', 'ETHEREUM', 'BASE', 'ARBITRUM']} />
        <InlineSelect label="MODE" defaultValue="AUTOMATED" options={['AUTOMATED', 'MANUAL', 'PAUSED']} />
        <div><span>TX PREVIEW</span><strong>—</strong></div>
        <SettingsControl />
      </div>

      <div className="feature-visual buyback-visual"><ProtocolScene variant="buybacks" /></div>

      <div className="feature-history buyback-history">
        <h2>BUYBACK HISTORY</h2>
        <div className="burn-table">
          <div className="table-row table-head table-row--four"><span>SPENT</span><span>$BUY BOUGHT</span><span>ROUTE</span><span>TX</span></div>
          {[0, 1, 2].map((row) => <div className="table-row table-row--four" key={row}><span>—</span><span>—</span><span>—</span><span>—</span></div>)}
        </div>
      </div>
    </section>
  )
}
