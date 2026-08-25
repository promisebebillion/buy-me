import { useEffect } from 'react'
import { ReactiveGrid } from '../components/ProtocolScene'
import { TokenAddressBar } from '../components/TokenAddressBar'

interface WhitepaperPageProps {
  onBack: () => void
}

const sections = [
  ['00', 'Abstract', 'abstract'],
  ['01', 'Design thesis', 'thesis'],
  ['02', 'System architecture', 'architecture'],
  ['03', 'Supply mechanics', 'supply'],
  ['04', 'Participation', 'participation'],
  ['05', 'Commitment layer', 'commitment'],
  ['06', 'Liquidity', 'liquidity-paper'],
  ['07', 'Buybacks', 'buybacks-paper'],
  ['08', 'Flywheel', 'flywheel-paper'],
  ['09', 'Status & roadmap', 'roadmap'],
  ['10', 'Risks', 'risks'],
] as const

export function WhitepaperPage({ onBack }: WhitepaperPageProps) {
  useEffect(() => {
    document.title = '$BUY Whitepaper / Design Draft'
    return () => { document.title = '$BUY / Autonomous Token Economy' }
  }, [])

  return (
    <div className="whitepaper">
      <ReactiveGrid />
      <header className="paper-header">
        <button className="paper-brand" onClick={onBack} aria-label="$BUY protocol home">
          <img src="/logo.png" alt="$BUY" />
        </button>
        <div className="paper-header-meta">WHITEPAPER / V0.1 / DESIGN DRAFT</div>
        <button className="back-to-app" onClick={onBack}>ENTER PROTOCOL <span>↗</span></button>
      </header>

      <aside className="paper-index">
        <div className="paper-index-title">CONTENTS</div>
        <nav>
          {sections.map(([number, label, id]) => <a href={`#${id}`} key={id}><span>{number}</span>{label}</a>)}
        </nav>
        <div className="paper-index-status"><i /> PRE-DEPLOYMENT</div>
      </aside>

      <main className="paper-content">
        <section className="paper-cover">
          <div className="paper-kicker">$BUY / AUTONOMOUS TOKEN ECONOMY</div>
          <h1>VALUE FLOWS.<br />SUPPLY RESPONDS.</h1>
          <p className="paper-deck">A modular protocol design for transparent token distribution, commitment, liquidity, automated value routing, and verifiable supply reduction.</p>
          <div className="paper-cover-meta">
            <div><span>VERSION</span><strong>0.1 DRAFT</strong></div>
            <div><span>NETWORK</span><strong>SOLANA / PROPOSED</strong></div>
            <div><span>STATUS</span><strong>INTERFACE PROTOTYPE</strong></div>
            <div><span>DATE</span><strong>AUGUST 2026</strong></div>
          </div>
          <HeroSystemGraphic />
          <div className="paper-warning"><span>△</span>This document describes a proposed protocol architecture. No token, contract, return, price behavior, or deployment is guaranteed.</div>
        </section>

        <PaperSection number="00" title="Abstract" id="abstract" lead="A transparent coordination layer for token activity.">
          <div className="paper-summary-grid">
            <article><span>WHAT IT IS</span><strong>One visible token system</strong><p>Seven protocol modules share the same supply and value-flow accounting.</p></article>
            <article><span>HOW IT WORKS</span><strong>Actions create state changes</strong><p>Every distribution, lock, trade, buyback, or burn produces a public on-chain event.</p></article>
            <article><span>WHAT IT IS NOT</span><strong>Not a price promise</strong><p>The design explains mechanics and controls. It does not guarantee demand, yield, or appreciation.</p></article>
          </div>
          <p>$BUY is a proposed Solana token protocol connecting distribution, staking, time locks, liquidity, buybacks, and burns. Instead of presenting these features as separate campaigns, the protocol treats them as one observable accounting system. Every module has a defined input, output, and measurable effect.</p>
          <p>The protocol starts from a reference supply of <strong>1,000,000,000 $BUY</strong>. No additional issuance mechanism is assumed in this draft. Airdrops distribute an existing allocation; staking and locks temporarily reduce liquid supply; liquidity supports exchange; protocol revenue may be routed through a public buyback engine; and tokens routed to the burn module are permanently removed. The Flywheel page is the shared accounting surface connecting those modules.</p>
          <div className="paper-callout"><span>Core idea</span><strong>Activity should produce legible state changes—not hidden treasury decisions.</strong></div>
        </PaperSection>

        <PaperSection number="01" title="Design thesis" id="thesis" lead="The system should be understandable before it is profitable.">
          <div className="paper-principles">
            <article><span>01</span><h3>Finite reference supply</h3><p>The draft begins with a fixed genesis supply. Burns reduce it; no module silently expands it.</p></article>
            <article><span>02</span><h3>Explicit routing</h3><p>Every fee or revenue path must name its source, destination, limit, and execution rule.</p></article>
            <article><span>03</span><h3>Voluntary commitment</h3><p>Staking and locks exchange liquidity for weight or access without pretending risk disappears.</p></article>
            <article><span>04</span><h3>Observable automation</h3><p>Buybacks may be automated, but policy and execution remain inspectable before and after each action.</p></article>
          </div>
          <p>Most token systems expose pages; $BUY is designed to expose relationships. A burn only matters relative to supply. A staking pool only matters relative to rewards and unlock conditions. Liquidity only matters relative to depth and routing. The interface therefore treats the protocol as one state machine with seven modules and one shared system map.</p>
        </PaperSection>

        <PaperSection number="02" title="System architecture" id="architecture" lead="Seven modules, one accounting model.">
          <SystemFlow />
          <div className="module-table" role="table" aria-label="$BUY protocol modules">
            <div className="module-table-row module-table-head"><span>MODULE</span><span>INPUT</span><span>OUTPUT</span><span>PRIMARY MEASURE</span></div>
            {[
              ['Airdrops', 'Allocated $BUY', 'Wallet distribution', 'Recipients / claimed'],
              ['Staking', 'Liquid $BUY', 'Committed positions', 'Total staked'],
              ['Locks', 'Liquid $BUY + time', 'Scheduled unlocks', 'Locked supply'],
              ['Liquidity', '$BUY + paired asset', 'LP positions', 'Depth / volume'],
              ['Buybacks', 'Protocol revenue', 'Market-acquired $BUY', 'Spent / acquired'],
              ['Burns', 'Routed $BUY', 'Permanent removal', 'Cumulative burned'],
              ['Flywheel', 'Module events', 'Unified state', 'Net system flow'],
            ].map((row) => <div className="module-table-row" key={row[0]}>{row.map((cell) => <span key={cell}>{cell}</span>)}</div>)}
          </div>
          <p className="figure-caption">Fig. 1 — Modules are separated by responsibility but joined by event accounting. This reduces the amount of trust placed in any single dashboard number.</p>
        </PaperSection>

        <PaperSection number="03" title="Supply mechanics" id="supply" lead="Scarcity is an accounting result, not a slogan.">
          <div className="equation-card">
            <span>Liquid supply at epoch n</span>
            <strong>S<sub>liquid,n</sub> = S<sub>0</sub> − B<sub>n</sub> − L<sub>n</sub> − K<sub>n</sub> + U<sub>n</sub></strong>
            <p>where S₀ is genesis supply, B is cumulative burned supply, L is actively locked supply, K is actively staked supply, and U is supply returned through unlock or unstake.</p>
          </div>
          <p>Burns and commitments must not be mixed. A burn is irreversible and reduces total supply. A lock or stake changes liquid supply temporarily and must publish its exit conditions. The interface reports those categories separately so a temporary lock cannot be marketed as permanent scarcity.</p>
          <SupplyCurve />
          <p className="figure-caption">Fig. 2 — Illustrative normalized supply under constant per-epoch burn rates. These are mathematical scenarios, not forecasts or configured protocol parameters.</p>
        </PaperSection>

        <PaperSection number="04" title="Participation and distribution" id="participation" lead="Airdrops are a distribution primitive, not free supply creation.">
          <p>The proposed Airdrop module transfers tokens from a disclosed allocation to an eligibility snapshot. It does not mint new tokens. A distribution defines the source account, token amount, snapshot slot, eligibility rule, number of recipients, per-wallet amount, and transaction root. Claims can be direct or Merkle-proof based; the final implementation should choose the least complex model that can be independently audited.</p>
          <div className="spec-grid">
            <article><span>SNAPSHOT</span><strong>Immutable slot</strong><p>Eligibility is calculated against a named on-chain state, not a changing live list.</p></article>
            <article><span>PROOF</span><strong>Public verification</strong><p>Recipients can verify amount and inclusion without trusting the website.</p></article>
            <article><span>EXPIRY</span><strong>Declared upfront</strong><p>Unclaimed tokens follow a published return or rollover rule.</p></article>
          </div>
          <div className="equation-card compact-equation"><span>Equal distribution example</span><strong>a<sub>wallet</sub> = A<sub>drop</sub> / N<sub>eligible</sub></strong><p>Weighted distributions may replace the numerator with a published score, but the scoring function must be reproducible.</p></div>
        </PaperSection>

        <PaperSection number="05" title="The commitment layer" id="commitment" lead="Staking and locks make time an explicit protocol input.">
          <p>Staking represents an active position that may receive a share of a funded reward pool. Locks represent a fixed release schedule. Neither mechanism creates sustainable yield on its own: rewards must come from a disclosed source such as a reserved allocation, protocol revenue, or external incentives.</p>
          <div className="equation-card"><span>Proposed reward-weight model</span><strong>w<sub>i</sub> = a<sub>i</sub> · [1 + κ · ln(1 + d<sub>i</sub>/30)]</strong><p>Amount a and commitment duration d determine position weight; κ is a bounded policy parameter. Final coefficients are intentionally unset until simulation and audit.</p></div>
          <LockWeightChart />
          <p className="figure-caption">Fig. 3 — Illustrative weight at κ = 0.25. Logarithmic duration weighting rewards commitment while limiting extreme long-term advantage.</p>
          <div className="paper-callout"><span>Constraint</span><strong>A displayed APY must be derived from funded rewards and current total weight—not entered as a marketing constant.</strong></div>
        </PaperSection>

        <PaperSection number="06" title="Liquidity layer" id="liquidity-paper" lead="Liquidity is infrastructure; LP risk remains real.">
          <p>The Liquidity module coordinates a $BUY pair and records pool depth, volume, position share, and router choice. The current interface proposes a $BUY/SOL pair because the wallet integration targets Solana. A final pool venue has not been selected.</p>
          <div className="two-column-copy"><div><h3>Adding liquidity</h3><p>A user contributes assets at the current pool ratio and receives an LP position representing a proportional claim on reserves and fees.</p></div><div><h3>Removing liquidity</h3><p>LP tokens are redeemed for the underlying reserves. The resulting amounts can differ from the original deposit because pool prices change.</p></div></div>
          <div className="equation-card compact-equation"><span>Constant-product reference</span><strong>x · y = k</strong><p>This familiar model is shown for reasoning only. The selected Solana venue may implement concentrated liquidity or another invariant.</p></div>
          <div className="risk-strip"><span>PRICE RISK</span><span>IMPERMANENT LOSS</span><span>SMART-CONTRACT RISK</span><span>ROUTER RISK</span></div>
        </PaperSection>

        <PaperSection number="07" title="Revenue and buybacks" id="buybacks-paper" lead="Automation without invisible discretion.">
          <p>The Buyback Engine is a proposed route for protocol-owned revenue. It must never spend user deposits, staked principal, locked balances, or pool reserves. Only assets credited to a designated revenue vault are eligible.</p>
          <div className="equation-card"><span>Execution budget and route constraints</span><strong>E<sub>t</sub> ≤ min(V<sub>revenue,t</sub>, C<sub>epoch</sub>)</strong><p>Each execution is capped by available revenue and an epoch limit. Acquired $BUY is then routed by policy weights β<sub>burn</sub> + β<sub>treasury</sub> + β<sub>liquidity</sub> = 1.</p></div>
          <RouteDiagram />
          <p>Safe automation requires a maximum price impact, minimum output, oracle sanity check, cooldown, public preview, and permissionless execution. If those protections cannot be implemented and audited, buybacks should remain manual or disabled.</p>
        </PaperSection>

        <PaperSection number="08" title="The protocol flywheel" id="flywheel-paper" lead="A feedback system with measurable boundaries.">
          <div className="flywheel-paper-diagram">
            {['PARTICIPATION', 'COMMITMENT', 'LIQUIDITY', 'ACTIVITY', 'REVENUE', 'BUYBACKS', 'BURNS', 'SUPPLY'].map((item, index) => <div key={item} style={{ transform: `rotate(${index * 45}deg) translateY(-150px) rotate(${-index * 45}deg)` }}><span>{String(index + 1).padStart(2, '0')}</span>{item}</div>)}
            <strong>$BUY<span>STATE CORE</span></strong>
          </div>
          <p>The flywheel is not perpetual motion. It only turns when real activity produces measurable value. Participation may deepen liquidity and generate fees; eligible revenue may fund buybacks; purchased tokens may be burned, retained, or paired as liquidity; burns reduce supply. Every arrow can weaken or reverse when usage, liquidity, execution quality, or market demand changes.</p>
          <div className="paper-callout"><span>Success condition</span><strong>The system is healthy when module data reconciles—not merely when token price increases.</strong></div>
        </PaperSection>

        <PaperSection number="09" title="Current status and roadmap" id="roadmap" lead="What exists today, and what does not.">
          <div className="status-board">
            <div><span>AVAILABLE NOW</span><ul><li>Responsive eight-module interface</li><li>Procedural 3D system visualizations</li><li>Session-only Phantom connection</li><li>Transaction-safe placeholder states</li><li>Protocol system map and this design draft</li></ul></div>
            <div><span>NOT YET DEPLOYED</span><ul><li>$BUY token mint</li><li>Burn and distribution programs</li><li>Staking and lock custody</li><li>Liquidity venue integration</li><li>Revenue vault and buyback executor</li><li>Live indexer, statistics, and audits</li></ul></div>
          </div>
          <div className="roadmap-list">
            <article><span>PHASE 01</span><strong>Specification</strong><p>Finalize network, authority model, supply allocation, fee sources, routing bounds, and measurable invariants.</p></article>
            <article><span>PHASE 02</span><strong>Testnet</strong><p>Deploy minimal programs, publish addresses, connect live balances, and test failure and recovery paths.</p></article>
            <article><span>PHASE 03</span><strong>Verification</strong><p>Independent audits, public simulations, adversarial testing, monitoring, and documented upgrade controls.</p></article>
            <article><span>PHASE 04</span><strong>Controlled launch</strong><p>Conservative limits, transparent dashboards, incident process, and staged expansion only after reconciliation.</p></article>
          </div>
        </PaperSection>

        <PaperSection number="10" title="Security, assumptions, and risks" id="risks" lead="The design can fail in technical, economic, and social ways.">
          <div className="risk-matrix">
            {[
              ['Smart contracts', 'Bugs can freeze, misroute, or destroy assets.', 'Minimal programs, audits, limits, testnet.'],
              ['Wallet/session', 'Users can sign malicious or misunderstood transactions.', 'Human-readable previews and explicit signing.'],
              ['Liquidity', 'Thin markets amplify volatility and slippage.', 'Impact caps, route checks, conservative sizing.'],
              ['Automation', 'A keeper or oracle failure can execute at a bad time.', 'Cooldowns, bounds, fallbacks, monitoring.'],
              ['Governance', 'Mutable parameters can become hidden discretion.', 'Timelocks, published diffs, narrow authority.'],
              ['Market', 'Burns and buybacks do not guarantee appreciation.', 'No return claims; evaluate demand independently.'],
            ].map(([risk, impact, control]) => <article key={risk}><h3>{risk}</h3><p>{impact}</p><span>{control}</span></article>)}
          </div>
          <p className="legal-copy">This document is technical design material, not financial, legal, or investment advice. Illustrations are not projections. Protocol parameters, token availability, network, deployment dates, and even the decision to launch remain subject to engineering review, testing, audit, legal analysis, and explicit publication.</p>
        </PaperSection>

        <footer className="paper-footer">
          <div className="paper-footer-brand"><img src="/logo.png" alt="$BUY" /></div>
          <p>WHITEPAPER V0.1 / DESIGN DRAFT<br />AUTONOMOUS TOKEN ECONOMY</p>
          <button onClick={onBack}>RETURN TO PROTOCOL ↗</button>
        </footer>
      </main>
      <div className="paper-noise" />
      <TokenAddressBar />
    </div>
  )
}

interface PaperSectionProps {
  number: string
  title: string
  id: string
  lead: string
  children: React.ReactNode
}

function PaperSection({ number, title, id, lead, children }: PaperSectionProps) {
  return <section className="paper-section" id={id}><header><span>{number}</span><div><h2>{title}</h2><p>{lead}</p></div></header><div className="paper-section-body">{children}</div></section>
}

function HeroSystemGraphic() {
  return <div className="hero-system-graphic"><div className="hero-orbit hero-orbit--one" /><div className="hero-orbit hero-orbit--two" /><div className="hero-orbit hero-orbit--three" /><strong>$BUY<span>PROTOCOL CORE</span></strong>{['BURN', 'STAKE', 'LOCK', 'LIQUIDITY', 'BUYBACK', 'AIRDROP'].map((item, index) => <i key={item} style={{ transform: `rotate(${index * 60}deg) translateY(-118px) rotate(${-index * 60}deg)` }}>{item}</i>)}</div>
}

function SystemFlow() {
  return <div className="paper-flow"><div><span>01</span><strong>PARTICIPATION</strong></div><i>→</i><div><span>02</span><strong>COMMITMENT</strong></div><i>→</i><div><span>03</span><strong>ACTIVITY</strong></div><i>→</i><div><span>04</span><strong>REVENUE</strong></div><i>→</i><div className="is-red"><span>05</span><strong>SUPPLY ROUTING</strong></div></div>
}

function SupplyCurve() {
  const scenarios = [{ rate: 0.0025, color: '#777', label: '0.25%' }, { rate: 0.005, color: '#ccc8c0', label: '0.50%' }, { rate: 0.01, color: '#0EFF00', label: '1.00%' }]
  const pathFor = (rate: number) => Array.from({ length: 25 }, (_, i) => `${i === 0 ? 'M' : 'L'} ${48 + i * 24} ${26 + (1 - Math.pow(1 - rate, i)) * 570}`).join(' ')
  return <div className="paper-chart"><div className="chart-title"><span>NORMALIZED SUPPLY</span><strong>CONSTANT BURN-RATE SCENARIOS</strong></div><svg viewBox="0 0 660 230" role="img" aria-label="Illustrative normalized supply curves"><g className="chart-grid">{[40, 80, 120, 160, 200].map((y) => <line key={y} x1="48" y1={y} x2="624" y2={y} />)}</g>{scenarios.map((scenario) => <path key={scenario.label} d={pathFor(scenario.rate)} fill="none" stroke={scenario.color} strokeWidth="2" />)}<line x1="48" y1="26" x2="48" y2="202" className="chart-axis"/><line x1="48" y1="202" x2="624" y2="202" className="chart-axis"/><text x="10" y="34">100%</text><text x="13" y="204">80%</text><text x="48" y="222">0</text><text x="596" y="222">24 EPOCHS</text></svg><div className="chart-legend">{scenarios.map((scenario) => <span key={scenario.label}><i style={{ background: scenario.color }} />{scenario.label} / EPOCH</span>)}</div></div>
}

function LockWeightChart() {
  const values = [{ d: 30, w: 1.17 }, { d: 90, w: 1.35 }, { d: 180, w: 1.49 }, { d: 365, w: 1.64 }]
  return <div className="weight-chart"><div className="chart-title"><span>COMMITMENT WEIGHT</span><strong>ILLUSTRATIVE κ = 0.25</strong></div><div className="weight-bars">{values.map((item) => <div key={item.d}><strong>{item.w.toFixed(2)}×</strong><i style={{ height: `${(item.w - 1) * 170}px` }} /><span>{item.d}D</span></div>)}</div></div>
}

function RouteDiagram() {
  return <div className="route-diagram"><div className="route-source"><span>REVENUE</span><strong>VAULT</strong></div><i>→</i><div className="route-executor"><span>BOUNDED</span><strong>EXECUTION</strong></div><i>→</i><div className="route-destinations"><span>BURN</span><span>TREASURY</span><span>LIQUIDITY</span></div></div>
}
