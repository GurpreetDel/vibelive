import { useEffect, useState } from 'react'
import Discover from './pages/Discover.jsx'
import GoLive from './pages/GoLive.jsx'
import Watch from './pages/Watch.jsx'
import DemoRoom from './pages/DemoRoom.jsx'
import Install from './pages/Install.jsx'
import { useDiamonds, topUpDiamonds } from './lib/balance.js'
import { fmt } from './lib/util.js'

function useRoute() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const onChange = () => setHash(location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  const parts = hash.replace(/^#\/?/, '').split('/')
  return { page: parts[0] || '', param: parts[1] || '' }
}

export default function App() {
  const { page, param } = useRoute()
  const diamonds = useDiamonds()

  let content
  if (page === 'live') content = <GoLive />
  else if (page === 'watch') content = <Watch code={param} />
  else if (page === 'demo') content = <DemoRoom id={param} />
  else if (page === 'install') content = <Install />
  else content = <Discover />

  const inRoom = page === 'watch' || page === 'demo' || page === 'live'

  return (
    <div className="app">
      {!inRoom && (
        <header className="topbar">
          <a className="logo" href="#/">
            Vibe<span>Live</span>
          </a>
          <div className="topbar-right">
            <button className="diamond-pill" onClick={() => topUpDiamonds(1000)} title="Free demo top-up +1000">
              💎 {fmt(diamonds)} <span className="plus">+</span>
            </button>
            <a className="icon-btn" href="#/install" title="Get the mobile app">📱</a>
          </div>
        </header>
      )}

      <main className={inRoom ? 'main main-room' : 'main'}>{content}</main>

      {!inRoom && (
        <nav className="bottomnav">
          <a href="#/" className={page === '' ? 'nav-item active' : 'nav-item'}>
            <span className="nav-ico">🏠</span>Home
          </a>
          <a href="#/live" className="nav-golive">
            <span>📹</span> Go Live
          </a>
          <a href="#/install" className={page === 'install' ? 'nav-item active' : 'nav-item'}>
            <span className="nav-ico">📱</span>Get App
          </a>
        </nav>
      )}
    </div>
  )
}
