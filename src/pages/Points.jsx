import { useState } from 'react'
import { useStore, spendPoints, addCoins, grantItem, update } from '../lib/store.js'
import { fmt } from '../lib/util.js'
import { PageHead } from './Backpack.jsx'

const REDEEMS = [
  { id: 'pts-coins', cost: 1000, label: '🪙 200 coins', apply: () => addCoins(200) },
  { id: 'pts-frame', cost: 5000, label: '🔥 Fire Halo frame', apply: () => grantItem('frame-fire') },
  { id: 'pts-entry', cost: 8000, label: '👑 Royal Carpet entry', apply: () => grantItem('entry-royal') },
]

export default function Points() {
  const s = useStore()
  const [toast, setToast] = useState('')

  const redeem = (r) => {
    if (!spendPoints(r.cost)) {
      setToast('Not enough points — recharge coins to earn points ⭐')
    } else {
      r.apply()
      update((st) => ({ redeems: [...st.redeems, { label: r.label, at: Date.now() }] }))
      setToast(`🎉 Redeemed ${r.label}!`)
    }
    setTimeout(() => setToast(''), 2000)
  }

  return (
    <div className="page">
      <PageHead title="⭐ Points Center" sub="1 coin recharged = 1 point, automatically" />

      <div className="points-hero">
        <b>⭐ {fmt(s.points)}</b>
        <span>available points</span>
      </div>

      <h2 className="section-title">Redeem points</h2>
      <div className="list">
        {REDEEMS.map((r) => (
          <div key={r.id} className="list-row">
            <span className="list-main"><b>{r.label}</b><small>{fmt(r.cost)} points</small></span>
            <button className="list-btn" onClick={() => redeem(r)}>Redeem</button>
          </div>
        ))}
      </div>

      <h2 className="section-title">Points earned</h2>
      <div className="list">
        {s.recharges.length === 0 && <p className="muted-text pad">No points yet — recharge coins and points appear here instantly.</p>}
        {[...s.recharges].reverse().map((r, i) => (
          <div key={i} className="list-row">
            <span className="list-ico">⭐</span>
            <span className="list-main">
              <b>+{fmt(r.points)} points</b>
              <small>recharge of {fmt(r.coins)} coins · {new Date(r.at).toLocaleString()}</small>
            </span>
          </div>
        ))}
        {[...s.redeems].reverse().map((r, i) => (
          <div key={'rd' + i} className="list-row">
            <span className="list-ico">🎁</span>
            <span className="list-main"><b>Redeemed {r.label}</b><small>{new Date(r.at).toLocaleString()}</small></span>
          </div>
        ))}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
