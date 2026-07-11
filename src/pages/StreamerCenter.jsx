import { useState } from 'react'
import { useStore, update, claimTask } from '../lib/store.js'
import { fmt } from '../lib/util.js'
import { PageHead } from './Backpack.jsx'

const TASKS = [
  { id: 'task-first-live', label: 'Go live for the first time', beans: 50, done: (s) => s.liveMinutes > 0 },
  { id: 'task-10-min', label: 'Stream 10 minutes total', beans: 100, done: (s) => s.liveMinutes >= 10 },
  { id: 'task-first-gift', label: 'Receive your first gift', beans: 80, done: (s) => s.giftsReceived > 0 },
  { id: 'task-5-gifts', label: 'Receive 5 gifts', beans: 250, done: (s) => s.giftsReceived >= 5 },
]

export default function StreamerCenter() {
  const s = useStore()
  const [toast, setToast] = useState('')

  const exchange = () => {
    if (s.beans < 100) {
      setToast('Need at least 🫘 100 beans to exchange')
    } else {
      const beans = Math.floor(s.beans / 100) * 100
      const coins = Math.round(beans * 0.3)
      update((st) => ({ beans: st.beans - beans, coins: st.coins + coins }))
      setToast(`Exchanged 🫘 ${fmt(beans)} → 🪙 ${fmt(coins)}!`)
    }
    setTimeout(() => setToast(''), 2000)
  }

  return (
    <div className="page">
      <PageHead title="🎥 Live Streamer Center" sub="Earnings, stats & streamer tasks" />

      <div className="pf-wallet sc-stats">
        <div><b>🫘 {fmt(s.beans)}</b><span>Beans earned</span></div>
        <div><b>⏱ {s.liveMinutes}m</b><span>Time live</span></div>
        <div><b>🎁 {s.giftsReceived}</b><span>Gifts received</span></div>
        <button className="btn-primary pf-recharge" onClick={exchange}>Beans → Coins</button>
      </div>
      <p className="disclaimer">Exchange rate: 🫘 100 beans = 🪙 30 coins. Viewers' gifts convert to beans at full gift value.</p>

      <h2 className="section-title">Streamer tasks</h2>
      <div className="list">
        {TASKS.map((t) => {
          const done = t.done(s)
          const claimed = s.tasksClaimed.includes(t.id)
          return (
            <div key={t.id} className="list-row">
              <span className="list-ico">{done ? '✅' : '⬜'}</span>
              <span className="list-main"><b>{t.label}</b><small>Reward: 🫘 {t.beans}</small></span>
              {claimed ? (
                <span className="list-side">Claimed</span>
              ) : done ? (
                <button className="list-btn" onClick={() => claimTask(t.id, t.beans)}>Claim</button>
              ) : (
                <a className="list-btn" href="#/live">Go live</a>
              )}
            </div>
          )
        })}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
