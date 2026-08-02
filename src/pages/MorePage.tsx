export function MorePage() {
  return (
    <section className="more-page page-enter">
      <header className="more-page-head">
        <div>
          <span>ECOSYSTEM CONNECTION</span>
          <h1>$MORE</h1>
        </div>
        <div className="more-page-status"><i /> MORETOKENS.COM</div>
        <a href="https://www.moretokens.com/" target="_blank" rel="noreferrer">OPEN ORIGINAL ↗</a>
      </header>

      <div className="more-embed-shell">
        <div className="more-embed-bar">
          <span><i /> SECURE EXTERNAL VIEW</span>
          <strong>https://www.moretokens.com/</strong>
        </div>
        <iframe
          src="https://www.moretokens.com/"
          title="$MORE ecosystem"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="clipboard-read; clipboard-write"
        />
      </div>

      <p className="more-embed-note">
        If the embedded view is restricted by your browser, use OPEN ORIGINAL to access $MORE directly.
      </p>
    </section>
  )
}
