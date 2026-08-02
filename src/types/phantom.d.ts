export {}

declare global {
  interface Window {
    phantom?: {
      solana?: PhantomProvider
    }
  }

  interface PhantomProvider {
    isPhantom?: boolean
    isConnected?: boolean
    publicKey?: { toString(): string }
    connect(options?: { onlyIfTrusted?: boolean }): Promise<{
      publicKey: { toString(): string }
    }>
    disconnect(): Promise<void>
    on?: {
      (event: 'disconnect', callback: () => void): void
      (event: 'accountChanged', callback: (key: { toString(): string } | null) => void): void
    }
    removeListener?: {
      (event: 'disconnect', callback: () => void): void
      (event: 'accountChanged', callback: (key: { toString(): string } | null) => void): void
    }
  }
}
