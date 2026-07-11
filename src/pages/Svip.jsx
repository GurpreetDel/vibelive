import { useState } from 'react'
import { SVIP_LEVELS } from '../data/items.js'
import { useStore, spendCoins, update } from '../lib/store.js'
import { fmt } from '../lib/util.js'
import { PageHead } from './Backpack.jsx'

export default function Svip() {
  const s = useStore()
  const [toast, setToast] = useState('')

  const buy = (l) => {
    if (l.lv <= s.svip) return
    if (spendCoins(l.cost)) {
      update({ svip: l.lv })
      setToast(`💠 SVIP${l.lv} activated! Your badge now shines everywhere.`)
    } else {
      setToast(`Need 🪙 ${fmt(l.cost)} for SVIP${l.lv} — recharge first`)
    }
    setTimeout(() => setToast(''), 2200)
  }

  return (
    <div className="page">
      <PageHead title="💠 SVIP" sub="Supreme VIP — the crown above VIP" />

      <div className="ari-current">
        Your status: {s.svip ? <b className="svip-badge">SVIP{s.svip}</b> : <b className="ari-none">Not yet activated</b>}
      </div>

      <div className="svip-grid">
        {SVIP_LEVELS.map((l) => {
          const active = s.svip === l.lv
          const owned = l.lv < s.svip
          return (
            <div key={l.lv} className={active ? 'svip-card active' : 'svip-card'}>
              <div className="svip-lv">SVIP{l.lv}</div>
              <ul>{l.perks.map((p) => <li key={p}>✦ {p}</li>)}</ul>
              {active ? (
                <span className="ari-status on">✓ Active</span>
              ) : owned ? (
                <span className="ari-status on">Included</span>
              ) : (
                <button className="btn-primary svip-buy" onClick={() => buy(l)}>🪙 {fmt(l.cost)}</button>
              )}
            </div>
          )
        })}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
