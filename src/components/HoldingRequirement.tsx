import type { BuyHoldingGate } from '../hooks/useBuyHoldingGate'

interface HoldingRequirementProps {
  gate: BuyHoldingGate
}

function gateMessage(gate: BuyHoldingGate) {
  if (gate.status === 'disconnected') return 'CONNECT WALLET TO VERIFY YOUR $BUY HOLDING'
  if (gate.status === 'checking') return 'READING $BUY BALANCE ON-CHAIN...'
  if (gate.status === 'eligible') return `ACCESS GRANTED / ${gate.balance} $BUY / ${gate.share} OF SUPPLY`
  if (gate.status === 'ineligible') return `BALANCE ${gate.balance} $BUY / MINIMUM ${gate.minimum} $BUY`
  if (gate.status === 'unavailable') return 'TOKEN CONFIGURATION IS PENDING — ACCESS WILL BE CHECKED AT LAUNCH'
  return gate.error || 'UNABLE TO VERIFY $BUY HOLDING'
}

export function HoldingRequirement({ gate }: HoldingRequirementProps) {
  return (
    <div className={`holding-requirement is-${gate.status}`} role="status">
      <div>
        <span>PROTOCOL ACCESS</span>
        <strong>MINIMUM: 1,000,000 $BUY</strong>
      </div>
      <p>{gateMessage(gate)}</p>
    </div>
  )
}
