import { useStore, timeAgo } from '../lib/store.js'
import { PageHead } from './Backpack.jsx'

export default function Watched() {
  const s = useStore()
  return (
    <div className="page">
      <PageHead title="🕐 Broadcasts Watched" sub="Your watch history" />
      <div className="list">
        {s.watched.length === 0 && (
          <p className="muted-text pad">Nothing yet — join any live room and it appears here.</p>
        )}
        {s.watched.map((w) => (
          <div key={w.id} className="list-row">
            <span className="list-ico conv-avatar">{w.avatar}</span>
            <span className="list-main">
              <b>{w.name}</b>
              <small>watched {timeAgo(w.at)}</small>
            </span>
            <a className="list-btn" href={w.href || `#/demo/${w.id}`}>Rewatch</a>
          </div>
        ))}
      </div>
    </div>
  )
}
