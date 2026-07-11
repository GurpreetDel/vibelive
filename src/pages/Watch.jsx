import { useEffect, useRef, useState } from 'react'
import Peer from 'peerjs'
import { myName, colorFor } from '../lib/util.js'
import { giftById, EPIC_GIFT_COST, MYTHIC_GIFT_COST } from '../data/demo.js'
import { addWatched, useStore } from '../lib/store.js'
import ChatList from '../components/ChatList.jsx'
import HeartsOverlay, { useHearts } from '../components/HeartsOverlay.jsx'
import GiftTray from '../components/GiftTray.jsx'
import GiftBanner from '../components/GiftBanner.jsx'
import EpicGift from '../components/EpicGift.jsx'
import ShareSheet from '../components/ShareSheet.jsx'
import Marquee from '../components/Marquee.jsx'
import { PKBar, PKResult } from '../components/PK.jsx'
import RoomBottomBar from '../components/RoomBottomBar.jsx'

export default function Watch({ code }) {
  const roomCode = (code || '').toUpperCase()
  const store = useStore()
  const [status, setStatus] = useState('connecting')
  const [host, setHost] = useState({ name: 'Host', title: '' })
  const [viewers, setViewers] = useState(1)
  const [msgs, setMsgs] = useState([])
  const [muted, setMuted] = useState(true)
  const [following, setFollowing] = useState(false)
  const [showGifts, setShowGifts] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [banner, setBanner] = useState(null)
  const [epic, setEpic] = useState(null)
  const [marqueeEvent, setMarqueeEvent] = useState(null)
  const [pk, setPk] = useState(null)
  const [pkResult, setPkResult] = useState(null)
  const [input, setInput] = useState('')
  const { hearts, addHeart, burstHearts } = useHearts()

  const videoRef = useRef(null)
  const peerRef = useRef(null)
  const connRef = useRef(null)
  const msgId = useRef(0)
  const name = myName()

  const addMsg = (m) => setMsgs((prev) => [...prev.slice(-60), { ...m, id: msgId.current++ }])

  const showGiftAnim = (g, from, count = 1) => {
    const tier = g.cost >= MYTHIC_GIFT_COST ? 'mythic' : g.cost >= EPIC_GIFT_COST ? 'epic' : null
    if (tier) {
      setEpic({ key: Date.now(), emoji: g.emoji, name: g.name, from, tier, count })
      setTimeout(() => setEpic(null), tier === 'mythic' ? 4600 : 3200)
    } else {
      setBanner({ key: Date.now(), emoji: g.emoji, name: count > 1 ? `${g.name} ×${count}` : g.name, from })
      setTimeout(() => setBanner(null), 2600)
    }
    burstHearts(Math.min(14, 6 + count), g.emoji)
    setMarqueeEvent({ id: Math.random(), text: `${g.emoji} ${from} sent ${count > 1 ? count + '× ' : ''}${g.name}!` })
  }

  useEffect(() => {
    if (!roomCode) return
    setStatus('connecting')
    setMsgs([])

    const peer = new Peer()
    peerRef.current = peer

    const timeout = setTimeout(() => {
      setStatus((s) => (s === 'connecting' ? 'error' : s))
    }, 15000)

    peer.on('open', () => {
      const conn = peer.connect('vibelive-' + roomCode, { reliable: true })
      connRef.current = conn
      conn.on('data', (d) => {
        if (!d || typeof d !== 'object') return
        if (d.t === 'meta') setHost({ name: d.name, title: d.title })
        else if (d.t === 'chat') addMsg({ name: d.name, color: colorFor(d.name), text: String(d.text).slice(0, 200) })
        else if (d.t === 'heart') addHeart()
        else if (d.t === 'count') setViewers(d.n)
        else if (d.t === 'gift') {
          const g = giftById(d.id)
          if (!g) return
          const n = Math.max(1, Math.min(99, d.n || 1))
          showGiftAnim(g, d.name, n)
          addMsg({ name: d.name, color: colorFor(d.name), text: `sent ${n > 1 ? n + '× ' : ''}${g.name} ${g.emoji}` })
        } else if (d.t === 'pk-start') {
          setPk({ enemy: d.enemy, a: 0, b: 0, sec: d.sec, phase: 'battle' })
          addMsg({ system: true, text: `⚔️ PK battle vs ${d.enemy.name}! Send gifts to power our streamer!` })
        } else if (d.t === 'pk') {
          setPk((p) => (p ? { ...p, a: d.a, b: d.b, sec: d.sec } : p))
        } else if (d.t === 'pk-end') {
          setPk(null)
          setPkResult({ won: d.won, enemy: d.enemy, punishment: d.punishment })
          setTimeout(() => setPkResult(null), 5200)
        } else if (d.t === 'end') setStatus('ended')
      })
      conn.on('close', () => setStatus((s) => (s === 'live' ? 'ended' : s)))
    })

    peer.on('call', (call) => {
      call.answer()
      call.on('stream', (remote) => {
        clearTimeout(timeout)
        if (videoRef.current) videoRef.current.srcObject = remote
        setStatus('live')
        addWatched({ id: roomCode, name: `Room ${roomCode}`, avatar: '🎥', href: `#/watch/${roomCode}` })
        addMsg({ system: true, text: `You joined ${roomCode}. Say hi 👋` })
      })
    })

    peer.on('error', (err) => {
      if (err.type === 'peer-unavailable') {
        clearTimeout(timeout)
        setStatus('notfound')
      }
    })

    return () => {
      clearTimeout(timeout)
      peer.destroy()
    }
  }, [roomCode]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!roomCode) {
    return (
      <div className="ended">
        <h2>Join a live room</h2>
        <p className="muted-text">Enter the 6-letter room code from the streamer.</p>
        <form
          className="join-form join-big"
          onSubmit={(e) => {
            e.preventDefault()
            if (input.trim()) location.hash = `#/watch/${input.trim().toUpperCase()}`
          }}
        >
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="QK7X2M" maxLength={6} />
          <button type="submit">Join</button>
        </form>
        <a className="setup-back" href="#/">← Back</a>
      </div>
    )
  }

  if (status === 'notfound' || status === 'error' || status === 'ended') {
    const msg = {
      notfound: ['Room not found 😿', `No live stream with code ${roomCode}. Ask the streamer for the right code.`],
      error: ['Connection trouble 📡', 'Could not connect. The streamer may be offline — try again in a moment.'],
      ended: ['Stream ended 🎬', `${host.name}'s stream is over. Catch the next one!`],
    }[status]
    return (
      <div className="ended">
        <h2>{msg[0]}</h2>
        <p className="muted-text">{msg[1]}</p>
        <a className="btn-primary" href="#/">Back to Home</a>
      </div>
    )
  }

  const send = (data) => connRef.current?.open && connRef.current.send(data)

  const sendGift = (g, count = 1) => {
    send({ t: 'gift', id: g.id, name, n: count })
    showGiftAnim(g, name, count)
    addMsg({ name, color: '#ffd24d', text: `sent ${count > 1 ? count + '× ' : ''}${g.name} ${g.emoji}` })
  }

  const shareUrl = `${location.origin}${location.pathname}#/watch/${roomCode}`

  return (
    <div className="room room-v2">
      <video ref={videoRef} className="room-video" autoPlay playsInline muted={muted} />

      {status === 'connecting' && (
        <div className="connecting">
          <div className="spinner" />
          <p>Connecting to room {roomCode}…</p>
        </div>
      )}

      <div className="room-top">
        <div className="host-pill">
          <span className="host-avatar">🎥</span>
          <span className="host-meta">
            <b>{host.name}</b>
            <small>👁 {viewers} watching{host.title ? ` · ${host.title}` : ''}</small>
          </span>
          <button className={following ? 'follow following' : 'follow'} onClick={() => setFollowing(!following)}>
            {following ? '✓' : '+ Follow'}
          </button>
        </div>
        <div className="top-right">
          <a className="room-close" href="#/">✕</a>
        </div>
      </div>

      {status === 'live' && <span className="live-badge room-live">● LIVE</span>}
      {status === 'live' && muted && (
        <button className="unmute" onClick={() => setMuted(false)}>🔊 Tap for sound</button>
      )}

      <Marquee event={marqueeEvent} />
      {pk && pk.phase === 'battle' && <PKBar pk={pk} meName={host.name} meAvatar="🎥" />}
      {pkResult && <PKResult result={pkResult} />}

      <div className="fab-col">
        <button className="fab" onClick={() => setShowShare(true)} title="Share">📤<em>Share</em></button>
        <button className="fab fab-gift" onClick={() => setShowGifts(true)} title="Gifts">🎁<em>Gift</em></button>
      </div>

      <GiftBanner banner={banner} />
      <EpicGift epic={epic} />
      <HeartsOverlay hearts={hearts} />
      <ChatList msgs={msgs} />
      <RoomBottomBar
        onChat={(t) => {
          addMsg({ name, color: '#ffd24d', text: t })
          send({ t: 'chat', name, text: t })
        }}
        onHeart={() => {
          addHeart()
          send({ t: 'heart' })
        }}
        onGiftOpen={() => setShowGifts(true)}
      />
      {showGifts && <GiftTray onSend={sendGift} onClose={() => setShowGifts(false)} />}
      {showShare && (
        <ShareSheet
          url={shareUrl}
          title={`🔴 ${host.name} is LIVE on VibeLive — room ${roomCode}!`}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  )
}
