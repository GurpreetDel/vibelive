import { useState } from 'react'

export default function RoomBottomBar({ onChat, onHeart, onGiftOpen, children }) {
  const [text, setText] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    onChat(t)
    setText('')
  }

  return (
    <form className="room-bottombar" onSubmit={submit}>
      <input
        className="chat-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Say something…"
        maxLength={200}
      />
      {children}
      <button type="button" className="round-btn" onClick={onHeart} title="Send a heart">
        ❤️
      </button>
      <button type="button" className="round-btn round-gift" onClick={onGiftOpen} title="Send a gift">
        🎁
      </button>
    </form>
  )
}
