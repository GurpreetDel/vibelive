import { useState } from 'react'
import { GIFT_CATEGORIES } from '../data/demo.js'
import { useStore, spendCoins, addCoins } from '../lib/store.js'
import { fmt } from '../lib/util.js'

const COMBOS = [1, 10, 99]

export default function GiftTray({ onSend, onClose }) {
  const { coins } = useStore()
  const [catId, setCatId] = useState('popular')
  const [sel, setSel] = useState(GIFT_CATEGORIES[0].gifts[0])
  const [combo, setCombo] = useState(1)
  const [shake, setShake] = useState(false)

  const cat = GIFT_CATEGORIES.find((c) => c.id === catId)
  const total = sel ? sel.cost * combo : 0
  const affordable = sel && coins >= total

  const send = () => {
    if (!sel) return
    if (!spendCoins(total)) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }
    onSend(sel, combo)
    onClose()
  }

  return (
    <div className="gift-backdrop" onClick={onClose}>
      <div className="gift-tray gift-tray-v2" onClick={(e) => e.stopPropagation()}>
        <div className="gift-tabs">
          {GIFT_CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={c.id === catId ? 'gift-tab active' : 'gift-tab'}
              onClick={() => {
                setCatId(c.id)
                setSel(c.gifts[0])
              }}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="gift-grid gift-grid-scroll">
          {cat.gifts.map((g) => (
            <button
              key={g.id}
              className={`gift ${sel?.id === g.id ? 'selected' : ''} ${coins < g.cost ? 'gift-locked' : ''}`}
              onClick={() => setSel(g)}
            >
              <span className="gift-emoji">{g.emoji}</span>
              <span className="gift-name">{g.name}</span>
              <span className="gift-cost">🪙{fmt(g.cost)}</span>
            </button>
          ))}
        </div>

        <div className={shake ? 'gift-footer shake' : 'gift-footer'}>
          <span className="gift-balance">
            🪙 {fmt(coins)}
            <button className="topup" onClick={() => addCoins(5000)}>+5000 free</button>
          </span>
          <div className="combo-row">
            {COMBOS.map((n) => (
              <button key={n} className={combo === n ? 'combo active' : 'combo'} onClick={() => setCombo(n)}>
                ×{n}
              </button>
            ))}
          </div>
          <button className={affordable ? 'gift-send' : 'gift-send disabled'} onClick={send}>
            Send {sel ? `${sel.emoji}${combo > 1 ? ` ×${combo}` : ''}` : ''} · 🪙{fmt(total)}
          </button>
        </div>
        {!affordable && sel && (
          <p className="gift-hint">Not enough coins for {sel.name} ×{combo} — tap +5000 free or lower the combo</p>
        )}
      </div>
    </div>
  )
}
