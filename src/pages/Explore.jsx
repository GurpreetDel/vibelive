import { useState } from 'react'
import { COUNTRIES, flagOf, countryStreamers, liveCountFor } from '../data/countries.js'
import { fmt } from '../lib/util.js'

export default function Explore() {
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState('IN')

  const list = COUNTRIES.filter(([, name]) => name.toLowerCase().includes(q.toLowerCase()))
  const streams = countryStreamers(selected, 8)

  return (
    <div className="explore">
      <div className="explore-head">
        <h1>🌍 Explore the world</h1>
        <p>Live streamers from {COUNTRIES.length} countries — tap a country to see who's on air.</p>
        <input
          className="explore-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search countries… e.g. India, Brazil, Japan"
        />
      </div>

      <div className="country-strip">
        {list.map(([code, name]) => (
          <button
            key={code}
            className={code === selected ? 'country-chip active' : 'country-chip'}
            onClick={() => setSelected(code)}
          >
            <span className="country-flag">{flagOf(code)}</span>
            <span className="country-name">{name}</span>
            <span className="country-live">🔴 {liveCountFor(code)}</span>
          </button>
        ))}
        {list.length === 0 && <p className="muted-text">No country matches “{q}”</p>}
      </div>

      <h2 className="explore-sub">
        {flagOf(selected)} Live now in {COUNTRIES.find(([c]) => c === selected)?.[1]}
      </h2>
      <div className="grid">
        {streams.map((s) => (
          <a
            key={s.id}
            className="card"
            href={`#/demo/${s.id}`}
            style={{ background: `linear-gradient(135deg, ${s.grad[0]}, ${s.grad[1]})` }}
          >
            <div className="card-top">
              <span className="live-badge">● {s.g === 'F' ? "She's" : "He's"} LIVE</span>
              <span className="viewers">👁 {fmt(s.viewers)}</span>
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
        ))}
      </div>
    </div>
  )
}
