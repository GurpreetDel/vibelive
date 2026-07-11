import { useEffect, useRef, useState } from 'react'
import Peer from 'peerjs'
import { randCode, myName, setMyName, colorFor, watchUrl } from '../lib/util.js'
import { giftById, EPIC_GIFT_COST, MYTHIC_GIFT_COST, STREAMS } from '../data/demo.js'
import { addBeans, update, useStore } from '../lib/store.js'
import ChatList from '../components/ChatList.jsx'
import HeartsOverlay, { useHearts } from '../components/HeartsOverlay.jsx'
import GiftBanner from '../components/GiftBanner.jsx'
import EpicGift from '../components/EpicGift.jsx'
import GiftTray from '../components/GiftTray.jsx'
import ShareSheet from '../components/ShareSheet.jsx'
import Marquee from '../components/Marquee.jsx'
import { PKBar, PKResult, PK_SECONDS, randPunishment } from '../components/PK.jsx'
import RoomBottomBar from '../components/RoomBottomBar.jsx'

export default function GoLive() {
  const store = useStore()
  const [phase, setPhase] = useState('setup') // setup | live | ended
  const [name, setName] = useState(myName())
  const [title, setTitle] = useState('My first VibeLive stream 🔥')
  const [camError, setCamError] = useState('')
  const [code, setCode] = useState('')
  const [viewers, setViewers] = useState(0)
  const [peakViewers, setPeakViewers] = useState(0)
  const [msgs, setMsgs] = useState([])
  const [banner, setBanner] = useState(null)
  const [epic, setEpic] = useState(null)
  const [marqueeEvent, setMarqueeEvent] = useState(null)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [showGifts, setShowGifts] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [pk, setPk] = useState(null)
  const [pkResult, setPkResult] = useState(null)
  const { hearts, addHeart, burstHearts } = useHearts()

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const peerRef = useRef(null)
  const connsRef = useRef(new Map())
  const pkRef = useRef(null) // mutable battle state for intervals/handlers
  const pkTimer = useRef(null)
  const msgId = useRef(0)
  const startedAt = useRef(0)

  const addMsg = (m) => setMsgs((prev) => [...prev.slice(-60), { ...m, id: msgId.current++ }])

  useEffect(() => {
    let cancelled = false
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 } }, audio: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      })
      .catch(() => setCamError('Camera/mic access is needed to go live. Allow permissions and reload.'))
    return () => {
      cancelled = true
      clearInterval(pkTimer.current)
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
      if (peerRef.current) peerRef.current.destroy()
    }
  }, [])

  const broadcast = (data, except) => {
    for (const [pid, conn] of connsRef.current) {
      if (pid !== except && conn.open) conn.send(data)
    }
  }

  const updateCount = () => {
    const n = connsRef.current.size
    setViewers(n)
    setPeakViewers((p) => Math.max(p, n))
    broadcast({ t: 'count', n })
  }

  const showGiftAnim = (g, from, count) => {
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

  const addPKPoints = (n) => {
    if (pkRef.current && pkRef.current.phase === 'battle') {
      pkRef.current.a += n
      setPk({ ...pkRef.current })
    }
  }

  const handleData = (d, conn) => {
    if (!d || typeof d !== 'object') return
    if (d.t === 'chat') {
      addMsg({ name: d.name, color: colorFor(d.name), text: String(d.text).slice(0, 200) })
      broadcast(d, conn.peer)
    } else if (d.t === 'heart') {
      addHeart()
      addPKPoints(2)
      broadcast(d, conn.peer)
    } else if (d.t === 'gift') {
      const g = giftById(d.id)
      if (!g) return
      const n = Math.max(1, Math.min(99, d.n || 1))
      addBeans(g.cost * n)
      addPKPoints(g.cost * n)
      showGiftAnim(g, d.name, n)
      addMsg({ name: d.name, color: colorFor(d.name), text: `sent ${n > 1 ? n + '× ' : ''}${g.name} ${g.emoji}` })
      broadcast(d, conn.peer)
    }
  }

  const goLive = () => {
    if (!streamRef.current) return
    setMyName(name)
    const roomCode = randCode()
    const peer = new Peer('vibelive-' + roomCode)
    peerRef.current = peer

    peer.on('open', () => {
      setCode(roomCode)
      startedAt.current = Date.now()
      setPhase('live')
      addMsg({ system: true, text: 'You are LIVE! Share your room code so friends can join 🎉' })
    })

    peer.on('connection', (conn) => {
      conn.on('open', () => {
        connsRef.current.set(conn.peer, conn)
        conn.send({ t: 'meta', name, title })
        if (pkRef.current && pkRef.current.phase === 'battle') {
          conn.send({ t: 'pk-start', enemy: pkRef.current.enemy, sec: pkRef.current.sec })
        }
        const call = peer.call(conn.peer, streamRef.current)
        call.on('error', () => {})
        addMsg({ system: true, text: 'A viewer joined 👋' })
        updateCount()
      })
      conn.on('data', (d) => handleData(d, conn))
      const drop = () => {
        if (connsRef.current.delete(conn.peer)) updateCount()
      }
      conn.on('close', drop)
      conn.on('error', drop)
    })

    peer.on('error', (err) => {
      if (err.type === 'unavailable-id') {
        peer.destroy()
        goLive()
      } else if (phase === 'setup') {
        setCamError('Could not reach the streaming server. Check your connection and try again.')
      }
    })
  }

  const startPK = () => {
    if (pkRef.current) return
    const enemy = STREAMS[Math.floor(Math.random() * STREAMS.length)]
    pkRef.current = { enemy, a: 0, b: 0, sec: PK_SECONDS, phase: 'battle' }
    setPk({ ...pkRef.current })
    broadcast({ t: 'pk-start', enemy: { name: enemy.name, avatar: enemy.avatar }, sec: PK_SECONDS })
    addMsg({ system: true, text: `⚔️ PK battle vs ${enemy.name} started! Viewers: send gifts to power our side!` })
    pkTimer.current = setInterval(() => {
      const p = pkRef.current
      if (!p) return
      let gain = 20 + Math.random() * 70
      if (p.b > p.a * 1.6) gain = 4 + Math.random() * 22
      if (p.b < p.a * 0.5) gain = 45 + Math.random() * 110
      p.b += gain
      p.sec -= 1
      if (p.sec <= 0) {
        clearInterval(pkTimer.current)
        const won = p.a >= p.b
        const result = { won, enemy: p.enemy, punishment: randPunishment() }
        pkRef.current = null
        setPk(null)
        setPkResult(result)
        broadcast({ t: 'pk-end', won, enemy: result.enemy, punishment: result.punishment })
        addMsg({ system: true, text: won ? '🏆 WE WON THE PK!' : `💀 PK lost to ${result.enemy.name}…` })
        setTimeout(() => setPkResult(null), 5200)
        return
      }
      setPk({ ...p })
      broadcast({ t: 'pk', a: Math.round(p.a), b: Math.round(p.b), sec: p.sec })
    }, 1000)
  }

  // Host sends a gift in their own room: viewers see it too (coins already spent by the tray)
  const hostSendGift = (g, count = 1) => {
    showGiftAnim(g, name, count)
    addMsg({ name, color: '#ffd24d', text: `sent ${count > 1 ? count + '× ' : ''}${g.name} ${g.emoji}` })
    addPKPoints(g.cost * count)
    broadcast({ t: 'gift', id: g.id, name, n: count })
  }

  const endStream = () => {
    broadcast({ t: 'end' })
    clearInterval(pkTimer.current)
    const mins = Math.max(1, Math.round((Date.now() - startedAt.current) / 60000))
    update((s) => ({ liveMinutes: s.liveMinutes + mins }))
    setTimeout(() => {
      if (peerRef.current) peerRef.current.destroy()
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
      setPhase('ended')
    }, 300)
  }

  const toggleMic = () => {
    const track = streamRef.current?.getAudioTracks()[0]
    if (track) {
      track.enabled = !track.enabled
      setMicOn(track.enabled)
    }
  }

  const toggleCam = () => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (track) {
      track.enabled = !track.enabled
      setCamOn(track.enabled)
    }
  }

  if (phase === 'ended') {
    const mins = Math.max(1, Math.round((Date.now() - startedAt.current) / 60000))
    return (
      <div className="ended">
        <h2>Stream ended 🎬</h2>
        <div className="ended-stats">
          <div><b>{mins}</b><span>minutes live</span></div>
          <div><b>{peakViewers}</b><span>peak viewers</span></div>
          <div><b>{store.beans}</b><span>total beans</span></div>
        </div>
        <a className="btn-primary" href="#/">Back to Home</a>
      </div>
    )
  }

  return (
    <div className="room room-host room-v2">
      <video ref={videoRef} className="room-video" autoPlay playsInline muted />

      {phase === 'setup' && (
        <div className="setup-panel">
          <h2>Ready to go live?</h2>
          {camError ? (
            <p className="error">{camError}</p>
          ) : (
            <>
              <label>Your name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} />
              <label>Stream title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} />
              <button className="btn-primary btn-big" onClick={goLive} disabled={!name.trim()}>
                🔴 Go LIVE
              </button>
            </>
          )}
          <a className="setup-back" href="#/">← Back</a>
        </div>
      )}

      {phase === 'live' && (
        <>
          <div className="room-top">
            <div className="host-pill">
              <span className="host-avatar">{store.avatar}</span>
              <span className="host-meta">
                <b>{name}</b>
                <small>👁 {viewers} watching · 🫘 {store.beans}</small>
              </span>
            </div>
            <div className="top-right">
              <button className="room-close" onClick={endStream} title="End stream">✕</button>
            </div>
          </div>

          <span className="live-badge room-live">● LIVE</span>

          <div className="share-bar">
            <span className="room-code">Room&nbsp;<b>{code}</b></span>
            <button onClick={() => setShowShare(true)}>📤 Share</button>
          </div>

          <Marquee event={marqueeEvent} />
          {pk && pk.phase === 'battle' && <PKBar pk={pk} meName={name} meAvatar={store.avatar} />}
          {pkResult && <PKResult result={pkResult} />}

          <div className="fab-col">
            {!pk && <button className="fab fab-pk" onClick={startPK} title="Start PK battle">⚔️<em>PK</em></button>}
            <button className="fab" onClick={() => setShowShare(true)} title="Share">📤<em>Share</em></button>
            <button className="fab fab-gift" onClick={() => setShowGifts(true)} title="Send a gift">🎁<em>Gift</em></button>
          </div>

          <GiftBanner banner={banner} />
          <EpicGift epic={epic} />
          <HeartsOverlay hearts={hearts} />
          <ChatList msgs={msgs} />
          <RoomBottomBar
            onChat={(t) => {
              addMsg({ name, color: '#ffd24d', text: t })
              broadcast({ t: 'chat', name, text: t })
            }}
            onHeart={() => {
              addHeart()
              broadcast({ t: 'heart' })
            }}
            onGiftOpen={() => setShowGifts(true)}
          >
            <button type="button" className={micOn ? 'round-btn' : 'round-btn off'} onClick={toggleMic}>
              {micOn ? '🎙️' : '🔇'}
            </button>
            <button type="button" className={camOn ? 'round-btn' : 'round-btn off'} onClick={toggleCam}>
              {camOn ? '📷' : '🚫'}
            </button>
          </RoomBottomBar>
          {showGifts && <GiftTray onSend={hostSendGift} onClose={() => setShowGifts(false)} />}
          {showShare && (
            <ShareSheet
              url={watchUrl(code)}
              title={`🔴 I'm LIVE on VibeLive! Room code ${code} — come watch!`}
              onClose={() => setShowShare(false)}
            />
          )}
        </>
      )}
    </div>
  )
}
