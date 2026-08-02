import { ProtocolScene } from '../components/ProtocolScene'
import { IntroBackground } from '../components/IntroBackground'

interface IntroPageProps {
  onEnter: () => void
}

export function IntroPage({ onEnter }: IntroPageProps) {
  return (
    <section className="intro-page page-enter">
      <IntroBackground />
      <div className="intro-copy">
        <h1>THE TOKEN<br />THAT ONLY<br />MOVES UP.</h1>
        <div className="intro-description">
          <span className="bracket-line" />
          <p>One transparent loop.<br />Every move on-chain.</p>
        </div>
        <div className="intro-actions">
          <button className="primary-action" onClick={onEnter}>ENTER ECOSYSTEM <span>↗</span></button>
          <button className="secondary-action" onClick={onEnter}>READ THE MECHANISM</button>
        </div>
      </div>

      <div className="intro-visual">
        <ProtocolScene variant="intro" />
      </div>

      <div className="protocol-state">
        <div className="state-title">LIVE PROTOCOL STATE</div>
        <div className="state-cell"><span>SUPPLY</span><strong>1.00B</strong></div>
        <div className="state-cell"><span>BURNED</span><strong>—</strong></div>
        <div className="state-cell"><span>LOCKED</span><strong>—</strong></div>
      </div>
    </section>
  )
}
