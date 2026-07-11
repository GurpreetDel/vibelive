import { useEffect, useRef, useState } from 'react'
import Peer from 'peerjs'
import { randCode, myName, setMyName, colorFor, watchUrl } from '../lib/util.js'
import { giftById, EPIC_GIFT_COST } from '../data/demo.js'
import { addBeans, update } from '../lib/store.js'
import ChatList from '../components/ChatList.jsx'
import HeartsOverlay, { useHearts } from '../components/HeartsOverlay.jsx'
import GiftBanner from '../components/GiftBanner.jsx'
import EpicGift from '../components/EpicGift.jsx'
import RoomBottomBar from '../components/RoomBottomBar.jsx'

export default function GoLive() {
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
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [copied, setCopied] = useState(false)
  const { hearts, addHeart, burstHearts } = useHearts()

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const peerRef = useRef(null)
  const connsRef = useRef(new Map())
  const msgId = useRef(0)
  const startedAt = useRef(0)

  const addMsg = (m) => setMsgs((prev) => [...prev.slice(-60), { ...m, id: msgId.current++ }])

  // Camera preview
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

  const handleData = (d, conn) => {
    if (!d || typeof d !== 'object') return
    if (d.t === 'chat') {
      addMsg({ name: d.name, color: colorFor(d.name), text: String(d.text).slice(0, 200) })
      broadcast(d, conn.peer)
    } else if (d.t === 'heart') {
      addHeart()
      broadcast(d, conn.peer)
    } else if (d.t === 'gift') {
      const g = giftById(d.id)
      if (!g) return
      addBeans(g.cost) // streamer earns beans at full gift value
      if (g.cost >= EPIC_GIFT_COST) {
        setEpic({ key: Date.now(), emoji: g.emoji, name: g.name, from: d.name })
        setTimeout(() => setEpic(null), 3200)
      } else {
        setBanner({ key: Date.now(), emoji: g.emoji, name: g.name, from: d.name })
        setTimeout(() => setBanner(null), 2600)
      }
      burstHearts(8, g.emoji)
      addMsg({ name: d.name, color: colorFor(d.name), text: `sent a ${g.name} ${g.emoji}` })
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
        goLive() // rare code collision — retry with a fresh code
      } else if (phase === 'setup') {
        setCamError('Could not reach the streaming server. Check your connection and try again.')
      }
    })
  }

  const endStream = () => {
    broadcast({ t: 'end' })
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

  const share = async () => {
    const url = watchUrl(code)
    const text = `I'm LIVE on VibeLive! Watch me here: ${url} (room code ${code})`
    if (navigator.share) {
      navigator.share({ title: 'VibeLive', text, url }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
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
        </div>
        <a className="btn-primary" href="#/">Back to Home</a>
      </div>
    )
  }

  return (
    <div className="room room-host">
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
              <span className="host-avatar">🎥</span>
              <span className="host-meta">
                <b>{name}</b>
                <small>👁 {viewers} watching</small>
              </span>
            </div>
            <button className="room-close" onClick={endStream} title="End stream">✕</button>
          </div>

          <span className="live-badge room-live">● LIVE</span>

          <div className="share-bar">
            <span className="room-code">Room&nbsp;<b>{code}</b></span>
            <button onClick={share}>{copied ? '✓ Copied!' : '📤 Share link'}</button>
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
            onGiftOpen={() => {}}
          >
            <button type="button" className={micOn ? 'round-btn' : 'round-btn off'} onClick={toggleMic}>
              {micOn ? '🎙️' : '🔇'}
            </button>
            <button type="button" className={camOn ? 'round-btn' : 'round-btn off'} onClick={toggleCam}>
              {camOn ? '📷' : '🚫'}
            </button>
          </RoomBottomBar>
        </>
      )}
    </div>
  )
}
