import { useState } from 'react'
import { BUY_TOKEN_CA } from '../config/token'

export function TokenAddressBar() {
  const [copied, setCopied] = useState(false)

  const copyAddress = async () => {
    await navigator.clipboard?.writeText(BUY_TOKEN_CA)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <button className="token-address-bar" type="button" onClick={() => void copyAddress()} title="Copy token contract address">
      <span>CA:</span> {BUY_TOKEN_CA}
      <em>{copied ? 'COPIED' : 'CLICK TO COPY'}</em>
    </button>
  )
}
