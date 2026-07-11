import { GIFTS } from '../data/demo.js'
import { useStore, spendCoins, addCoins } from '../lib/store.js'
import { fmt } from '../lib/util.js'

export default function GiftTray({ onSend, onClose }) {
  const { coins } = useStore()

  const send = (g) => {
    if (!spendCoins(g.cost)) return
    onSend(g)
    onClose()
  }

  return (
    <div className="gift-backdrop" onClick={onClose}>
      <div className="gift-tray" onClick={(e) => e.stopPropagation()}>
        <div className="gift-head">
          <b>Send a gift</b>
          <span className="gift-balance">
            🪙 {fmt(coins)}
            <button className="topup" onClick={() => addCoins(1000)}>+1000 free</button>
          </span>
        </div>
        <div className="gift-grid gift-grid-scroll">
          {GIFTS.map((g) => (
            <button
              key={g.id}
              className={coins < g.cost ? 'gift gift-locked' : 'gift'}
              onClick={() => send(g)}
            >
              <span className="gift-emoji">{g.emoji}</span>
              <span className="gift-name">{g.name}</span>
              <span className="gift-cost">🪙{fmt(g.cost)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
