import { useEffect, useState } from 'react'

const steps = [
  'Establishing secure wallet session',
  'Reading $BUY token accounts',
  'Simulating protocol instruction',
  'Validating protocol access requirement',
]

export function useAccessSimulation() {
  const [step, setStep] = useState<number | null>(null)

  useEffect(() => {
    if (step === null || step >= steps.length) return
    const timer = window.setTimeout(() => setStep((current) => current === null ? null : current + 1), 520)
    return () => window.clearTimeout(timer)
  }, [step])

  return {
    processing: step !== null && step < steps.length,
    blocked: step === steps.length,
    step: step === null ? null : Math.min(step, steps.length - 1),
    message: step === null ? null : step < steps.length ? steps[step] : 'Access denied: hold at least 1,000,000 $BUY to use this protocol action.',
    start: () => setStep(0),
    dismiss: () => setStep(null),
  }
}
