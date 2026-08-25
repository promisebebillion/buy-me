import { useCallback, useEffect, useState } from 'react'
import { AppShell } from './components/AppShell'
import { usePhantom } from './hooks/usePhantom'
import { BurnPage } from './pages/BurnPage'
import { BuybacksPage } from './pages/BuybacksPage'
import { FlywheelPage } from './pages/FlywheelPage'
import { AirdropsPage } from './pages/AirdropsPage'
import { IntroPage } from './pages/IntroPage'
import { LiquidityPage } from './pages/LiquidityPage'
import { LocksPage } from './pages/LocksPage'
import { StakingPage } from './pages/StakingPage'
import { WhitepaperPage } from './pages/WhitepaperPage'
import { MorePage } from './pages/MorePage'
import { useBuyHoldingGate } from './hooks/useBuyHoldingGate'

function cleanPath(path: string) {
  const normalized = path.toLowerCase()
  if (normalized.startsWith('/airdrops')) return '/airdrops'
  if (normalized.startsWith('/staking')) return '/staking'
  if (normalized.startsWith('/liquidity')) return '/liquidity'
  if (normalized.startsWith('/locks')) return '/locks'
  if (normalized.startsWith('/buybacks')) return '/buybacks'
  if (normalized.startsWith('/flywheel')) return '/flywheel'
  if (normalized.startsWith('/whitepaper')) return '/whitepaper'
  if (normalized.startsWith('/more')) return '/more'
  if (normalized.startsWith('/burn')) return '/burn'
  return '/'
}

export function App() {
  const [route, setRoute] = useState(() => cleanPath(window.location.pathname))
  const wallet = usePhantom()
  const holdingGate = useBuyHoldingGate(wallet.address)

  useEffect(() => {
    const onPopState = () => setRoute(cleanPath(window.location.pathname))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = useCallback((path: string) => {
    window.history.pushState({}, '', path)
    setRoute(cleanPath(path))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  if (route === '/whitepaper') {
    return <WhitepaperPage onBack={() => navigate('/')} />
  }

  return (
    <AppShell route={route} navigate={navigate} wallet={wallet}>
      {route === '/burn' && <BurnPage wallet={wallet} holdingGate={holdingGate} />}
      {route === '/airdrops' && <AirdropsPage wallet={wallet} holdingGate={holdingGate} />}
      {route === '/staking' && <StakingPage wallet={wallet} holdingGate={holdingGate} />}
      {route === '/locks' && <LocksPage wallet={wallet} holdingGate={holdingGate} />}
      {route === '/liquidity' && <LiquidityPage wallet={wallet} holdingGate={holdingGate} />}
      {route === '/buybacks' && <BuybacksPage />}
      {route === '/flywheel' && <FlywheelPage />}
      {route === '/more' && <MorePage />}
      {route === '/' && (
        <IntroPage
          onEnter={() => navigate('/burn')}
          onReadMechanism={() => navigate('/whitepaper')}
        />
      )}
    </AppShell>
  )
}
