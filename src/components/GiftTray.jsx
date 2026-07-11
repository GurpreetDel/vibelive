import { GIFTS } from '../data/demo.js'
import { useDiamonds, spendDiamonds, topUpDiamonds } from '../lib/balance.js'
import { fmt } from '../lib/util.js'

export default function GiftTray({ onSend, onClose }) {
  const diamonds = useDiamonds()

  const send = (g) => {
    if (diamonds < g.cost) return
    spendDiamonds(g.cost)
    onSend(g)
    onClose()
  }

  return (
    <div className="gift-backdrop" onClick={onClose}>
      <div className="gift-tray" onClick={(e) => e.stopPropagation()}>
        <div className="gift-head">
          <b>Send a gift</b>
          <span className="gift-balance">
            💎 {fmt(diamonds)}
            <button className="topup" onClick={() => topUpDiamonds(1000)}>+1000 free</button>
          </span>
        </div>
        <div className="gift-grid">
          {GIFTS.map((g) => (
            <button
              key={g.id}
              className={diamonds < g.cost ? 'gift gift-locked' : 'gift'}
              onClick={() => send(g)}
            >
              <span className="gift-emoji">{g.emoji}</span>
              <span className="gift-name">{g.name}</span>
              <span className="gift-cost">💎{g.cost}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
