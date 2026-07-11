import { useRef, useState, useCallback } from 'react'
import { randHeart } from '../lib/util.js'

export function useHearts() {
  const [hearts, setHearts] = useState([])
  const nextId = useRef(0)

  const addHeart = useCallback((emoji) => {
    const id = nextId.current++
    const heart = {
      id,
      emoji: emoji || randHeart(),
      right: 4 + Math.random() * 16,
      size: 22 + Math.random() * 18,
      dur: 2.4 + Math.random() * 1.4,
    }
    setHearts((h) => [...h.slice(-40), heart])
    setTimeout(() => setHearts((h) => h.filter((x) => x.id !== id)), heart.dur * 1000)
  }, [])

  const burstHearts = useCallback(
    (n = 6, emoji) => {
      for (let i = 0; i < n; i++) setTimeout(() => addHeart(emoji), i * 120)
    },
    [addHeart]
  )

  return { hearts, addHeart, burstHearts }
}

export default function HeartsOverlay({ hearts }) {
  return (
    <div className="hearts" aria-hidden="true">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="heart"
          style={{ right: h.right + '%', fontSize: h.size, animationDuration: h.dur + 's' }}
        >
          {h.emoji}
        </span>
      ))}
    </div>
  )
}
