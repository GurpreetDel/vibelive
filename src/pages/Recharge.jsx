import { useState } from 'react'
import { useStore, recharge } from '../lib/store.js'
import { fmt } from '../lib/util.js'
import { PageHead } from './Backpack.jsx'

const PACKS = [
  { coins: 1000, price: '₹89', tag: '' },
  { coins: 5000, price: '₹419', tag: 'Popular' },
  { coins: 12000, price: '₹899', tag: '+5% bonus' },
  { coins: 30000, price: '₹2,099', tag: '+8% bonus' },
  { coins: 80000, price: '₹5,499', tag: '+12% bonus' },
  { coins: 200000, price: '₹12,999', tag: 'Whale 🐳' },
]

export default function Recharge() {
  const s = useStore()
  const [toast, setToast] = useState('')

  const buy = (p) => {
    recharge(p.coins)
    setToast(`✅ +${fmt(p.coins)} coins & +${fmt(p.coins)} points added!`)
    setTimeout(() => setToast(''), 2200)
  }

  return (
    <div className="page">
      <PageHead title="💳 Recharge Coins" sub={`Balance: 🪙 ${fmt(s.coins)} · every coin gives +1 ⭐ point`} />

      <div className="rc-grid">
        {PACKS.map((p) => (
          <button key={p.coins} className="rc-pack" onClick={() => buy(p)}>
            {p.tag && <span className="rc-tag">{p.tag}</span>}
            <span className="rc-coins">🪙 {fmt(p.coins)}</span>
            <span className="rc-price">{p.price}</span>
          </button>
        ))}
      </div>

      <p className="rc-pay">Payment methods: 📲 UPI · 💳 Card · 🅿️ PayPal · 🏦 NetBanking</p>
      <p className="disclaimer">
        Demo mode — tapping a package adds coins instantly, no real money involved. Points land in your
        <a href="#/points"> ⭐ Points Center</a>. Recharge issues? Ask the <a href="#/support">🤖 Online Service</a>.
      </p>

      {s.recharges.length > 0 && (
        <>
          <h2 className="section-title">Recharge history</h2>
          <div className="list">
            {[...s.recharges].reverse().map((r, i) => (
              <div key={i} className="list-row">
                <span className="list-ico">💳</span>
                <span className="list-main">
                  <b>+{fmt(r.coins)} coins</b>
                  <small>{new Date(r.at).toLocaleString()}</small>
                </span>
                <span className="list-side">+{fmt(r.points)} ⭐</span>
              </div>
            ))}
          </div>
        </>
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
