import { useStore, timeAgo } from '../lib/store.js'
import { PageHead } from './Backpack.jsx'

export default function Visitors() {
  const s = useStore()
  return (
    <div className="page">
      <PageHead title="👀 Recent Visitors" sub={`${s.visitors.length} people viewed your profile`} />
      <div className="list">
        {s.visitors.map((v) => (
          <div key={v.name} className="list-row">
            <span className="list-ico conv-avatar">{v.avatar}</span>
            <span className="list-main">
              <b>{v.name} <span className="lv">Lv{v.lv}</span></b>
              <small>visited {timeAgo(v.at)}</small>
            </span>
            <a className="list-btn" href="#/inbox">Say hi</a>
          </div>
        ))}
      </div>
      <p className="disclaimer">Tip: activate 🌟 Super King rank for invisible visit mode.</p>
    </div>
  )
}
