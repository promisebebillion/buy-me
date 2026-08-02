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

function cleanPath(path: string) {
  const normalized = path.toLowerCase()
  if (normalized.startsWith('/airdrops')) return '/airdrops'
  if (normalized.startsWith('/staking')) return '/staking'
  if (normalized.startsWith('/liquidity')) return '/liquidity'
  if (normalized.startsWith('/locks')) return '/locks'
  if (normalized.startsWith('/buybacks')) return '/buybacks'
  if (normalized.startsWith('/flywheel')) return '/flywheel'
  if (normalized.startsWith('/whitepaper')) return '/whitepaper'
  if (normalized.startsWith('/burn')) return '/burn'
  return '/'
}

export function App() {
  const [route, setRoute] = useState(() => cleanPath(window.location.pathname))
  const wallet = usePhantom()

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
      {route === '/burn' && <BurnPage wallet={wallet} />}
      {route === '/airdrops' && <AirdropsPage wallet={wallet} />}
      {route === '/staking' && <StakingPage wallet={wallet} />}
      {route === '/locks' && <LocksPage wallet={wallet} />}
      {route === '/liquidity' && <LiquidityPage wallet={wallet} />}
      {route === '/buybacks' && <BuybacksPage />}
      {route === '/flywheel' && <FlywheelPage />}
      {route === '/' && <IntroPage onEnter={() => navigate('/burn')} />}
    </AppShell>
  )
}
