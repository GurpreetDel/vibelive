import { useEffect, useState } from 'react'
import { STREAMS, TAGS } from '../data/demo.js'
import { fmt } from '../lib/util.js'

export default function Discover() {
  const [tag, setTag] = useState('Popular')
  const [tick, setTick] = useState(0)
  const [code, setCode] = useState('')

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 3000)
    return () => clearInterval(t)
  }, [])

  const list = tag === 'Popular' ? STREAMS : STREAMS.filter((s) => s.tag === tag)

  const join = (e) => {
    e.preventDefault()
    const c = code.trim().toUpperCase()
    if (c) location.hash = `#/watch/${c}`
  }

  return (
    <div className="discover">
      <div className="hero">
        <h1>
          Go Live. <span className="grad-text">Get Famous.</span>
        </h1>
        <p>Watch live streams, chat, send gifts — or start your own broadcast in one tap.</p>
        <div className="hero-actions">
          <a className="btn-primary" href="#/live">📹 Go Live Now</a>
          <form className="join-form" onSubmit={join}>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Have a room code? e.g. QK7X2M"
              maxLength={6}
            />
            <button type="submit">Join</button>
          </form>
        </div>
      </div>

      <div className="chips">
        {TAGS.map((t) => (
          <button key={t} className={t === tag ? 'chip active' : 'chip'} onClick={() => setTag(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid">
        {list.map((s, i) => {
          const viewers = s.viewers + Math.round(Math.sin(tick * 0.7 + i * 2) * 120) + tick * 2
          return (
            <a key={s.id} className="card" href={`#/demo/${s.id}`}
               style={{ background: `linear-gradient(135deg, ${s.grad[0]}, ${s.grad[1]})` }}>
              <div className="card-top">
                <span className="live-badge">● LIVE</span>
                <span className="viewers">👁 {fmt(viewers)}</span>
              </div>
              <div className="card-avatar">{s.avatar}</div>
              <div className="card-bottom">
                <div className="card-name">
                  {s.name} {s.country} <span className="lv">Lv{s.level}</span>
                </div>
                <div className="card-title">{s.title}</div>
                <span className="card-tag">{s.tag}</span>
              </div>
            </a>
          )
        })}

        <a className="card card-cta" href="#/live">
          <div className="card-avatar">➕</div>
          <div className="card-bottom">
            <div className="card-name">Your stream here</div>
            <div className="card-title">Start broadcasting in one tap</div>
          </div>
        </a>
      </div>

      <p className="disclaimer">
        Demo rooms are simulated. Tap <b>Go Live</b> to start a real camera broadcast and share your room
        code — anyone can watch live from their phone or laptop.
      </p>
    </div>
  )
}
