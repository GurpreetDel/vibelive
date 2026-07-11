import { useEffect, useRef, useState } from 'react'
import { STREAMS, CHAT_USERS, CHAT_LINES, EPIC_GIFT_COST } from '../data/demo.js'
import { generatedStreamer } from '../data/countries.js'
import { fmt, colorFor, myName } from '../lib/util.js'
import { useStore, toggleFollow, addWatched } from '../lib/store.js'
import { itemById, rankById } from '../data/items.js'
import ChatList from '../components/ChatList.jsx'
import HeartsOverlay, { useHearts } from '../components/HeartsOverlay.jsx'
import GiftTray from '../components/GiftTray.jsx'
import GiftBanner from '../components/GiftBanner.jsx'
import EpicGift from '../components/EpicGift.jsx'
import RoomBottomBar from '../components/RoomBottomBar.jsx'

const pick = (a) => a[Math.floor(Math.random() * a.length)]

export default function DemoRoom({ id }) {
  const s = STREAMS.find((x) => x.id === id) || generatedStreamer(id)
  const store = useStore()
  const [msgs, setMsgs] = useState([])
  const [viewers, setViewers] = useState(s ? s.viewers : 0)
  const [showGifts, setShowGifts] = useState(false)
  const [banner, setBanner] = useState(null)
  const [epic, setEpic] = useState(null)
  const { hearts, addHeart, burstHearts } = useHearts()
  const msgId = useRef(0)
  const following = store.following.includes(id)

  const addMsg = (m) => setMsgs((prev) => [...prev.slice(-60), { ...m, id: msgId.current++ }])

  useEffect(() => {
    if (!s) return
    addWatched({ id: s.id, name: s.name, avatar: s.avatar })
    addMsg({ system: true, text: `Welcome to ${s.name}'s room! Be kind and say hi 👋` })

    // Your equipped entry effect / rank announce your arrival, Bigo-style
    const entry = itemById(store.equipped.entry)
    const car = itemById(store.equipped.car)
    const rank = store.rank ? rankById(store.rank) : null
    const me = myName()
    if (rank) addMsg({ system: true, text: `${rank.emoji} ${rank.name} ${me} has entered the room!` })
    if (entry) addMsg({ system: true, text: `${entry.emoji} ${me} enters with ${entry.name}!` })
    if (car) addMsg({ system: true, text: `${car.emoji} ${me} arrives in a ${car.name}!` })

    let alive = true
    const chatLoop = () => {
      if (!alive) return
      const name = pick(CHAT_USERS)
      addMsg({ name, color: colorFor(name), lv: 1 + Math.floor(Math.random() * 50), text: pick(CHAT_LINES) })
      setTimeout(chatLoop, 1400 + Math.random() * 2400)
    }
    const t1 = setTimeout(chatLoop, 800)
    const t2 = setInterval(() => Math.random() < 0.65 && addHeart(), 1300)
    const t3 = setInterval(() => setViewers((v) => Math.max(100, v + Math.floor(Math.random() * 61) - 28)), 2500)
    return () => {
      alive = false
      clearTimeout(t1)
      clearInterval(t2)
      clearInterval(t3)
    }
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!s) {
    location.hash = '#/'
    return null
  }

  const sendGift = (g) => {
    const from = myName()
    if (g.cost >= EPIC_GIFT_COST) {
      setEpic({ key: Date.now(), emoji: g.emoji, name: g.name, from })
      setTimeout(() => setEpic(null), 3200)
    } else {
      setBanner({ key: Date.now(), emoji: g.emoji, name: g.name, from })
      setTimeout(() => setBanner(null), 2600)
    }
    burstHearts(8, g.emoji)
    addMsg({ name: from, color: '#ffd24d', text: `sent a ${g.name} ${g.emoji}` })
  }

  return (
    <div className="room" style={{ background: `linear-gradient(160deg, ${s.grad[0]}, ${s.grad[1]} 70%, #0b0614)` }}>
      <div className="room-stage">
        <div className="stage-avatar">{s.avatar}</div>
        {s.tag === 'Music' || s.tag === 'Dance' ? (
          <div className="equalizer">{[...Array(7)].map((_, i) => <span key={i} style={{ animationDelay: i * 0.13 + 's' }} />)}</div>
        ) : null}
      </div>

      <div className="room-top">
        <div className="host-pill">
          <span className="host-avatar">{s.avatar}</span>
          <span className="host-meta">
            <b>{s.name} {s.country}</b>
            <small>👁 {fmt(viewers)} watching</small>
          </span>
          <button className={following ? 'follow following' : 'follow'} onClick={() => toggleFollow(id)}>
            {following ? '✓ Following' : '+ Follow'}
          </button>
        </div>
        <a className="room-close" href="#/">✕</a>
      </div>

      <span className="live-badge room-live">● {s.g === 'F' ? "She's" : "He's"} LIVE</span>
      <GiftBanner banner={banner} />
      <EpicGift epic={epic} />
      <HeartsOverlay hearts={hearts} />
      <ChatList msgs={msgs} />
      <RoomBottomBar
        onChat={(t) => addMsg({ name: myName(), color: '#ffd24d', text: t })}
        onHeart={() => addHeart()}
        onGiftOpen={() => setShowGifts(true)}
      />
      {showGifts && <GiftTray onSend={sendGift} onClose={() => setShowGifts(false)} />}
    </div>
  )
}
