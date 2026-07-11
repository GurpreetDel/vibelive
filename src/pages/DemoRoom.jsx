import { useEffect, useRef, useState } from 'react'
import { STREAMS, CHAT_USERS, CHAT_LINES, GIFTS, EPIC_GIFT_COST, MYTHIC_GIFT_COST } from '../data/demo.js'
import { generatedStreamer } from '../data/countries.js'
import { fmt, colorFor, myName } from '../lib/util.js'
import { useStore, toggleFollow, addWatched } from '../lib/store.js'
import { itemById, rankById } from '../data/items.js'
import ChatList from '../components/ChatList.jsx'
import HeartsOverlay, { useHearts } from '../components/HeartsOverlay.jsx'
import GiftTray from '../components/GiftTray.jsx'
import GiftBanner from '../components/GiftBanner.jsx'
import EpicGift from '../components/EpicGift.jsx'
import ShareSheet from '../components/ShareSheet.jsx'
import Marquee from '../components/Marquee.jsx'
import { PKBar, PKResult, PK_SECONDS, randPunishment } from '../components/PK.jsx'
import RoomBottomBar from '../components/RoomBottomBar.jsx'

const pick = (a) => a[Math.floor(Math.random() * a.length)]
const VIEWER_FACES = ['🧑', '👧', '🧔', '👩‍🦰', '👱‍♀️', '👨‍🦱']

export default function DemoRoom({ id }) {
  const s = STREAMS.find((x) => x.id === id) || generatedStreamer(id)
  const store = useStore()
  const [msgs, setMsgs] = useState([])
  const [viewers, setViewers] = useState(s ? s.viewers : 0)
  const [showGifts, setShowGifts] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [banner, setBanner] = useState(null)
  const [epic, setEpic] = useState(null)
  const [marqueeEvent, setMarqueeEvent] = useState(null)
  const [pk, setPk] = useState(null) // {enemy, a, b, sec, phase}
  const [pkResult, setPkResult] = useState(null)
  const [energy, setEnergy] = useState(30)
  const { hearts, addHeart, burstHearts } = useHearts()
  const msgId = useRef(0)
  const following = store.following.includes(id)

  const addMsg = (m) => setMsgs((prev) => [...prev.slice(-60), { ...m, id: msgId.current++ }])

  /* room ambience: chat, hearts, viewers, marquee gossip */
  useEffect(() => {
    if (!s) return
    addWatched({ id: s.id, name: s.name, avatar: s.avatar })
    addMsg({ system: true, text: `Welcome to ${s.name}'s room! Be kind and say hi 👋` })

    const entry = itemById(store.equipped.entry)
    const car = itemById(store.equipped.car)
    const rank = store.rank ? rankById(store.rank) : null
    const me = myName()
    if (rank) addMsg({ system: true, entry: true, text: `${rank.emoji} ${rank.name} ${me} has entered the room!` })
    if (entry) addMsg({ system: true, entry: true, text: `${entry.emoji} ${me} enters with ${entry.name}!` })
    if (car) addMsg({ system: true, entry: true, text: `${car.emoji} ${me} arrives in a ${car.name}!` })

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
    const t4 = setInterval(() => {
      const g = pick(GIFTS.filter((x) => x.cost >= 100))
      const other = pick(STREAMS.filter((x) => x.id !== id))
      setMarqueeEvent({ id: Math.random(), text: `${g.emoji} ${pick(CHAT_USERS)} sent ${g.name} in ${other.name}'s room` })
    }, 8000)
    return () => {
      alive = false
      clearTimeout(t1)
      clearInterval(t2)
      clearInterval(t3)
      clearInterval(t4)
    }
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  /* PK battle engine */
  useEffect(() => {
    if (!pk || pk.phase !== 'battle') return
    const t = setInterval(() => {
      setPk((p) => {
        if (!p || p.phase !== 'battle') return p
        // enemy AI with rubber-banding: stays beatable but keeps pressure
        let gain = 20 + Math.random() * 70
        if (p.b > p.a * 1.6) gain = 4 + Math.random() * 22
        if (p.b < p.a * 0.5) gain = 45 + Math.random() * 110
        const b = p.b + gain
        const sec = p.sec - 1
        if (sec <= 0) {
          const won = p.a >= b
          setPkResult({ won, enemy: p.enemy, punishment: randPunishment() })
          addMsg({ system: true, text: won ? `🏆 ${myName()}'s side WON the PK!` : `💀 PK lost against ${p.enemy.name}…` })
          setTimeout(() => setPkResult(null), 5200)
          return null
        }
        return { ...p, b, sec }
      })
    }, 1000)
    return () => clearInterval(t)
  }, [pk?.phase]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!s) {
    location.hash = '#/'
    return null
  }

  const startPK = () => {
    if (pk) return
    const enemy = pick(STREAMS.filter((x) => x.id !== id))
    setEnergy(30)
    setPk({ enemy, a: 0, b: 0, sec: PK_SECONDS, phase: 'battle' })
    addMsg({ system: true, text: `⚔️ PK battle started vs ${enemy.name}! Send gifts & attacks to win!` })
  }

  const addPKPoints = (n) => setPk((p) => (p && p.phase === 'battle' ? { ...p, a: p.a + n } : p))

  const attack = () => {
    if (!pk || energy <= 0) return
    setEnergy((e) => e - 1)
    addPKPoints(25)
    burstHearts(2, '⚡')
  }

  const sendGift = (g, count = 1) => {
    const from = myName()
    const tier = g.cost >= MYTHIC_GIFT_COST ? 'mythic' : g.cost >= EPIC_GIFT_COST ? 'epic' : null
    if (tier) {
      setEpic({ key: Date.now(), emoji: g.emoji, name: g.name, from, tier, count })
      setTimeout(() => setEpic(null), tier === 'mythic' ? 4600 : 3200)
    } else {
      setBanner({ key: Date.now(), emoji: g.emoji, name: count > 1 ? `${g.name} ×${count}` : g.name, from })
      setTimeout(() => setBanner(null), 2600)
    }
    burstHearts(Math.min(14, 6 + count), g.emoji)
    addMsg({ name: from, color: '#ffd24d', text: `sent ${count > 1 ? count + '× ' : ''}${g.name} ${g.emoji}` })
    setMarqueeEvent({ id: Math.random(), text: `${g.emoji} ${from} sent ${count > 1 ? count + '× ' : ''}${g.name} in ${s.name}'s room!` })
    addPKPoints(g.cost * count)
  }

  const shareUrl = `${location.origin}${location.pathname}#/demo/${id}`

  return (
    <div className="room room-v2" style={{ background: `linear-gradient(160deg, ${s.grad[0]}, ${s.grad[1]} 70%, #0b0614)` }}>
      <div className="room-stage">
        <div className="stage-blob b1" />
        <div className="stage-blob b2" />
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
            <small>👁 {fmt(viewers)} · Lv{s.level}</small>
          </span>
          <button className={following ? 'follow following' : 'follow'} onClick={() => toggleFollow(id)}>
            {following ? '✓' : '+ Follow'}
          </button>
        </div>
        <div className="top-right">
          <span className="viewer-strip">
            {VIEWER_FACES.slice(0, 3).map((f, i) => <i key={i}>{f}</i>)}
            <em>{fmt(viewers)}</em>
          </span>
          <a className="room-close" href="#/">✕</a>
        </div>
      </div>

      <span className="live-badge room-live">● {s.g === 'F' ? "She's" : "He's"} LIVE</span>
      <Marquee event={marqueeEvent} />
      {pk && pk.phase === 'battle' && <PKBar pk={pk} meName={myName()} meAvatar={store.avatar} />}
      {pkResult && <PKResult result={pkResult} />}

      <div className="fab-col">
        {!pk && <button className="fab fab-pk" onClick={startPK} title="Start PK battle">⚔️<em>PK</em></button>}
        {pk && pk.phase === 'battle' && (
          <button className="fab fab-attack" onClick={attack} title="Free attack">
            ⚡<em>{energy}</em>
          </button>
        )}
        <button className="fab" onClick={() => setShowShare(true)} title="Share">📤<em>Share</em></button>
        <button className="fab fab-gift" onClick={() => setShowGifts(true)} title="Gifts">🎁<em>Gift</em></button>
      </div>

      <GiftBanner banner={banner} />
      <EpicGift epic={epic} />
      <HeartsOverlay hearts={hearts} />
      <ChatList msgs={msgs} />
      <RoomBottomBar
        onChat={(t) => addMsg({ name: myName(), color: '#ffd24d', text: t })}
        onHeart={() => {
          addHeart()
          addPKPoints(2)
        }}
        onGiftOpen={() => setShowGifts(true)}
      />
      {showGifts && <GiftTray onSend={sendGift} onClose={() => setShowGifts(false)} />}
      {showShare && (
        <ShareSheet
          url={shareUrl}
          title={`🔴 ${s.name} is LIVE on VibeLive — come watch!`}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  )
}
