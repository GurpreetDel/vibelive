import { useEffect, useState } from 'react'
import Discover from './pages/Discover.jsx'
import Explore from './pages/Explore.jsx'
import GoLive from './pages/GoLive.jsx'
import Watch from './pages/Watch.jsx'
import DemoRoom from './pages/DemoRoom.jsx'
import Install from './pages/Install.jsx'
import Privacy from './pages/Privacy.jsx'
import Inbox, { DMThread } from './pages/Inbox.jsx'
import Profile from './pages/Profile.jsx'
import Backpack from './pages/Backpack.jsx'
import Recharge from './pages/Recharge.jsx'
import Points from './pages/Points.jsx'
import Aristocracy from './pages/Aristocracy.jsx'
import Svip from './pages/Svip.jsx'
import Games from './pages/Games.jsx'
import Connections from './pages/Connections.jsx'
import Visitors from './pages/Visitors.jsx'
import Watched from './pages/Watched.jsx'
import StreamerCenter from './pages/StreamerCenter.jsx'
import Activity from './pages/Activity.jsx'
import Support from './pages/Support.jsx'
import { useStore, unreadTotal } from './lib/store.js'
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

const ROUTES = {
  explore: (p) => <Explore />,
  live: () => <GoLive />,
  watch: (p) => <Watch code={p} />,
  demo: (p) => <DemoRoom id={p} />,
  install: () => <Install />,
  privacy: () => <Privacy />,
  inbox: () => <Inbox />,
  dm: (p) => <DMThread cid={p} />,
  profile: () => <Profile />,
  backpack: () => <Backpack />,
  recharge: () => <Recharge />,
  points: () => <Points />,
  aristocracy: () => <Aristocracy />,
  svip: () => <Svip />,
  games: (p) => <Games game={p} />,
  connections: (p) => <Connections tab={p} />,
  visitors: () => <Visitors />,
  watched: () => <Watched />,
  streamer: () => <StreamerCenter />,
  activity: () => <Activity />,
  support: () => <Support />,
}

export default function App() {
  const { page, param } = useRoute()
  const s = useStore()
  const unread = unreadTotal(s)

  const content = ROUTES[page] ? ROUTES[page](param) : <Discover />
  const inRoom = page === 'watch' || page === 'demo' || page === 'live'
  const active = (p) => (page === p ? 'nav-item active' : 'nav-item')

  return (
    <div className="app">
      {!inRoom && (
        <header className="topbar">
          <a className="logo" href="#/">
            Vibe<span>Live</span>
          </a>
          <div className="topbar-right">
            <a className="diamond-pill" href="#/recharge" title="Recharge coins">
              🪙 {fmt(s.coins)} <span className="plus">+</span>
            </a>
            <a className="icon-btn inbox-btn" href="#/inbox" title="Inbox">
              ✉️{unread > 0 && <span className="unread-dot">{unread}</span>}
            </a>
          </div>
        </header>
      )}

      <main className={inRoom ? 'main main-room' : 'main'}>{content}</main>

      {!inRoom && (
        <nav className="bottomnav">
          <a href="#/" className={active('')}>
            <span className="nav-ico">🏠</span>Home
          </a>
          <a href="#/explore" className={active('explore')}>
            <span className="nav-ico">🌍</span>Explore
          </a>
          <a href="#/live" className="nav-golive" title="Go Live">
            📹
          </a>
          <a href="#/games" className={active('games')}>
            <span className="nav-ico">🎮</span>Games
          </a>
          <a href="#/profile" className={active('profile')}>
            <span className="nav-ico">👤</span>Me
          </a>
        </nav>
      )}
    </div>
  )
}
