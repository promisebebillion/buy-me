import { IntroBackground } from '../components/IntroBackground'

interface IntroPageProps {
  onEnter: () => void
  onReadMechanism: () => void
}

export function IntroPage({ onEnter, onReadMechanism }: IntroPageProps) {
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
          <button className="secondary-action" onClick={onReadMechanism}>READ THE MECHANISM</button>
        </div>
      </div>

      {/* The interactive 3D hand is temporarily disabled. The empty visual
          column preserves the desktop hero composition for the image artwork. */}
      <div className="intro-visual intro-visual--background-only" aria-hidden="true" />

      <div className="protocol-state">
        <div className="state-title">LIVE PROTOCOL STATE</div>
        <div className="state-cell"><span>SUPPLY</span><strong>1.00B</strong></div>
        <div className="state-cell"><span>BURNED</span><strong>—</strong></div>
        <div className="state-cell"><span>LOCKED</span><strong>—</strong></div>
      </div>
    </section>
  )
}
