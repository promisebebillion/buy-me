interface ProtocolAccessNoticeProps {
  processing: boolean
  blocked: boolean
  step: number | null
  message: string | null
  onDismiss: () => void
}

const checks = ['WALLET', 'TOKEN ACCOUNTS', 'SIMULATION', 'ACCESS']

export function ProtocolAccessNotice({ processing, blocked, step, message, onDismiss }: ProtocolAccessNoticeProps) {
  if (!message) return null

  return (
    <button className={`protocol-access-notice${blocked ? ' is-blocked' : ''}`} onClick={blocked ? onDismiss : undefined} disabled={processing} type="button">
      <span className="access-notice-title">{processing ? 'PROTOCOL CHECK IN PROGRESS' : 'PROTOCOL ACCESS REQUIRED'}</span>
      {processing && <span className="access-checks">{checks.map((check, index) => <i className={index <= (step ?? -1) ? 'is-active' : ''} key={check}>{check}</i>)}</span>}
      <strong>{message}</strong>
      {blocked && <em>CLICK TO DISMISS</em>}
    </button>
  )
}
