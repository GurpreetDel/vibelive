import { useEffect, useState } from 'react'

// Bigo-style scrolling event ticker. Pass the latest event {id, text}; it queues and expires.
export default function Marquee({ event }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    if (!event) return
    setItems((l) => [...l.slice(-1), event])
    const t = setTimeout(() => setItems((l) => l.filter((x) => x.id !== event.id)), 6500)
    return () => clearTimeout(t)
  }, [event]) // eslint-disable-line react-hooks/exhaustive-deps

  if (items.length === 0) return null
  return (
    <div className="marquee-zone">
      {items.map((it) => (
        <div key={it.id} className="marquee">
          <span>{it.text}</span>
        </div>
      ))}
    </div>
  )
}
