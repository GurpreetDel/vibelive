import { useEffect, useRef, useState } from 'react'
import Peer from 'peerjs'
import { myName, colorFor } from '../lib/util.js'
import { giftById } from '../data/demo.js'
import ChatList from '../components/ChatList.jsx'
import HeartsOverlay, { useHearts } from '../components/HeartsOverlay.jsx'
import GiftTray from '../components/GiftTray.jsx'
import GiftBanner from '../components/GiftBanner.jsx'
import RoomBottomBar from '../components/RoomBottomBar.jsx'

export default function Watch({ code }) {
  const roomCode = (code || '').toUpperCase()
  const [status, setStatus] = useState('connecting') // connecting | live | notfound | ended | error
  const [host, setHost] = useState({ name: 'Host', title: '' })
  const [viewers, setViewers] = useState(1)
  const [msgs, setMsgs] = useState([])
  const [muted, setMuted] = useState(true)
  const [following, setFollowing] = useState(false)
  const [showGifts, setShowGifts] = useState(false)
  const [banner, setBanner] = useState(null)
  const [input, setInput] = useState('')
  const { hearts, addHeart, burstHearts } = useHearts()

  const videoRef = useRef(null)
  const peerRef = useRef(null)
  const connRef = useRef(null)
  const msgId = useRef(0)
  const name = myName()

  const addMsg = (m) => setMsgs((prev) => [...prev.slice(-60), { ...m, id: msgId.current++ }])

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
          setBanner({ key: Date.now(), emoji: g.emoji, name: g.name, from: d.name })
          burstHearts(8, g.emoji)
          setTimeout(() => setBanner(null), 2600)
        } else if (d.t === 'end') setStatus('ended')
      })
      conn.on('close', () => setStatus((s) => (s === 'live' ? 'ended' : s)))
    })

    peer.on('call', (call) => {
      call.answer() // viewer receives only
      call.on('stream', (remote) => {
        clearTimeout(timeout)
        if (videoRef.current) videoRef.current.srcObject = remote
        setStatus('live')
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

  const sendGift = (g) => {
    send({ t: 'gift', id: g.id, name })
    setBanner({ key: Date.now(), emoji: g.emoji, name: g.name, from: name })
    burstHearts(8, g.emoji)
    setTimeout(() => setBanner(null), 2600)
  }

  return (
    <div className="room">
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
            {following ? '✓ Following' : '+ Follow'}
          </button>
        </div>
        <a className="room-close" href="#/">✕</a>
      </div>

      {status === 'live' && <span className="live-badge room-live">● LIVE</span>}
      {status === 'live' && muted && (
        <button className="unmute" onClick={() => setMuted(false)}>🔊 Tap for sound</button>
      )}

      <GiftBanner banner={banner} />
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
    </div>
  )
}
