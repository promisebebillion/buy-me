import { useCallback, useEffect, useState } from 'react'

type WalletStatus = 'idle' | 'connecting' | 'connected' | 'error'

export function usePhantom() {
  const [address, setAddress] = useState<string | null>(null)
  const [status, setStatus] = useState<WalletStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const getProvider = useCallback(() => {
    const provider = window.phantom?.solana
    return provider?.isPhantom ? provider : null
  }, [])

  const disconnect = useCallback(async () => {
    const provider = getProvider()
    try {
      if (provider?.isConnected) await provider.disconnect()
    } finally {
      setAddress(null)
      setStatus('idle')
      setError(null)
    }
  }, [getProvider])

  const connect = useCallback(async () => {
    const provider = getProvider()

    if (!provider) {
      window.open('https://phantom.com/download', '_blank', 'noopener,noreferrer')
      setError('Phantom is not installed')
      setStatus('error')
      return
    }

    setStatus('connecting')
    setError(null)

    try {
      // Never use onlyIfTrusted: true: every site session starts with an explicit click.
      if (provider.isConnected) await provider.disconnect()
      const response = await provider.connect({ onlyIfTrusted: false })
      setAddress(response.publicKey.toString())
      setStatus('connected')
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Connection cancelled'
      setError(message)
      setStatus('error')
    }
  }, [getProvider])

  useEffect(() => {
    const provider = getProvider()
    if (!provider) return

    const onDisconnect = () => {
      setAddress(null)
      setStatus('idle')
    }

    const onAccountChanged = (key: { toString(): string } | null) => {
      if (!key) {
        void disconnect()
        return
      }
      setAddress(key.toString())
      setStatus('connected')
    }

    provider.on?.('disconnect', onDisconnect)
    provider.on?.('accountChanged', onAccountChanged)

    // No auto-connect and no localStorage: leaving the page ends the dApp session.
    const endSession = () => {
      if (provider.isConnected) void provider.disconnect()
    }
    window.addEventListener('pagehide', endSession)
    window.addEventListener('beforeunload', endSession)

    return () => {
      window.removeEventListener('pagehide', endSession)
      window.removeEventListener('beforeunload', endSession)
      provider.removeListener?.('disconnect', onDisconnect)
      provider.removeListener?.('accountChanged', onAccountChanged)
      if (provider.isConnected) void provider.disconnect()
    }
  }, [disconnect, getProvider])

  return { address, status, error, connect, disconnect }
}
