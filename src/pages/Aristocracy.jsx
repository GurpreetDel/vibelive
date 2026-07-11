import { useState } from 'react'
import { RANKS, rankIndex } from '../data/items.js'
import { useStore, spendCoins, update } from '../lib/store.js'
import { fmt } from '../lib/util.js'
import { PageHead } from './Backpack.jsx'

export default function Aristocracy() {
  const s = useStore()
  const [toast, setToast] = useState('')
  const currentIdx = s.rank ? rankIndex(s.rank) : -1

  const activate = (r, i) => {
    if (i <= currentIdx) return
    if (spendCoins(r.cost)) {
      update({ rank: r.id })
      setToast(`👑 You are now ${r.name}! Entry effects unlocked.`)
    } else {
      setToast(`Need 🪙 ${fmt(r.cost)} — recharge to activate ${r.name}`)
    }
    setTimeout(() => setToast(''), 2200)
  }

  return (
    <div className="page">
      <PageHead title="👑 Aristocracy Center" sub="Noble ranks with royal privileges" />

      <div className="ari-current">
        {s.rank ? (
          <>Your rank: <b style={{ color: RANKS[currentIdx].color }}>{RANKS[currentIdx].emoji} {RANKS[currentIdx].name}</b></>
        ) : (
          <>Your rank: <b className="ari-none">Not yet activated</b> — choose your title below</>
        )}
      </div>

      <div className="ari-list">
        {RANKS.map((r, i) => {
          const active = i === currentIdx
          const owned = i < currentIdx
          return (
            <div key={r.id} className={active ? 'ari-card active' : 'ari-card'} style={{ borderColor: active ? r.color : undefined }}>
              <div className="ari-top">
                <span className="ari-emoji">{r.emoji}</span>
                <span className="ari-name" style={{ color: r.color }}>{r.name}</span>
                <span className={active || owned ? 'ari-status on' : 'ari-status'}>
                  {active ? '✓ Activated' : owned ? 'Included' : 'Not yet activated'}
                </span>
              </div>
              <ul className="ari-perks">
                {r.perks.map((p) => <li key={p}>✦ {p}</li>)}
              </ul>
              {!active && !owned && (
                <button className="btn-primary ari-buy" onClick={() => activate(r, i)}>
                  Activate · 🪙 {fmt(r.cost)}
                </button>
              )}
            </div>
          )
        })}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
