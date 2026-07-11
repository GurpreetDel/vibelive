import { useState } from 'react'
import { FRIENDS } from '../data/demo.js'
import { addDM } from '../lib/store.js'

export default function ShareSheet({ url, title, onClose }) {
  const [sent, setSent] = useState([])
  const [copied, setCopied] = useState(false)
  const text = `${title} ${url}`

  const sendToFriend = (f) => {
    if (sent.includes(f.name)) return
    addDM(f.name.toLowerCase(), 'me', `📺 ${title}\n${url}`, { name: f.name, avatar: f.avatar })
    setSent((s) => [...s, f.name])
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard unavailable */ }
  }

  const sysShare = () => {
    if (navigator.share) navigator.share({ title: 'VibeLive', text, url }).catch(() => {})
    else copy()
  }

  return (
    <div className="gift-backdrop" onClick={onClose}>
      <div className="gift-tray share-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="gift-head">
          <b>📤 Share this LIVE</b>
          <button className="topup" onClick={onClose}>Close</button>
        </div>

        <p className="share-label">Send to friends</p>
        <div className="share-friends">
          {FRIENDS.map((f) => (
            <button key={f.name} className="share-friend" onClick={() => sendToFriend(f)}>
              <span className="share-avatar">{f.avatar}</span>
              <span className="share-name">{f.name}</span>
              <span className={sent.includes(f.name) ? 'share-state sent' : 'share-state'}>
                {sent.includes(f.name) ? '✓ Sent' : 'Send'}
              </span>
            </button>
          ))}
        </div>

        <p className="share-label">Share outside</p>
        <div className="share-apps">
          <a
            className="share-app wa"
            href={`https://wa.me/?text=${encodeURIComponent(text)}`}
            target="_blank"
            rel="noreferrer"
          >
            🟢 WhatsApp
          </a>
          <a
            className="share-app tg"
            href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noreferrer"
          >
            🔵 Telegram
          </a>
          <button className="share-app" onClick={copy}>{copied ? '✓ Copied!' : '🔗 Copy link'}</button>
          <button className="share-app" onClick={sysShare}>➕ More</button>
        </div>
      </div>
    </div>
  )
}
