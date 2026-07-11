import { useState } from 'react'
import { BACKPACK, SLOTS } from '../data/items.js'
import { useStore, buyItem, equipItem } from '../lib/store.js'
import { fmt } from '../lib/util.js'

export default function Backpack() {
  const s = useStore()
  const [slot, setSlot] = useState('car')
  const [toast, setToast] = useState('')

  const items = BACKPACK.filter((i) => i.slot === slot)

  const flash = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 1800)
  }

  const act = (item) => {
    const owned = s.inventory.includes(item.id)
    if (owned) {
      equipItem(item.slot, item.id)
      flash(s.equipped[item.slot] === item.id ? `Unequipped ${item.name}` : `${item.emoji} ${item.name} equipped!`)
    } else if (buyItem(item.id, item.cost)) {
      equipItem(item.slot, item.id)
      flash(`🎉 Bought & equipped ${item.name}!`)
    } else {
      flash('Not enough coins — recharge first 💳')
    }
  }

  return (
    <div className="page">
      <PageHead title="🎒 Backpack" sub="Decorate your profile & room entries" />
      <div className="chips">
        {SLOTS.map(([id, label]) => (
          <button key={id} className={id === slot ? 'chip active' : 'chip'} onClick={() => setSlot(id)}>
            {label}
          </button>
        ))}
      </div>

      <div className="bp-grid">
        {items.map((item) => {
          const owned = s.inventory.includes(item.id)
          const equipped = s.equipped[item.slot] === item.id
          return (
            <div key={item.id} className={equipped ? 'bp-item equipped' : 'bp-item'}>
              <span className="bp-emoji">{item.emoji}</span>
              <b>{item.name}</b>
              <small>{item.desc}</small>
              <button className={owned ? 'bp-btn owned' : 'bp-btn'} onClick={() => act(item)}>
                {equipped ? '✓ Equipped' : owned ? 'Equip' : item.cost === 0 ? 'Free' : `🪙 ${fmt(item.cost)}`}
              </button>
            </div>
          )
        })}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

export function PageHead({ title, sub, back = '#/profile' }) {
  return (
    <div className="page-head">
      <a className="page-back" href={back}>‹</a>
      <div>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
    </div>
  )
}
