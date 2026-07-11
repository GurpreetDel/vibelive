import { useEffect, useRef } from 'react'

export default function ChatList({ msgs }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [msgs])

  return (
    <div className="chatlist" ref={ref}>
      {msgs.map((m) => (
        <div key={m.id} className={m.entry ? 'msg msg-system msg-entry' : m.system ? 'msg msg-system' : 'msg'}>
          {m.system ? (
            <span>{m.text}</span>
          ) : (
            <>
              {m.lv ? <span className="lv">Lv{m.lv}</span> : null}
              <b style={{ color: m.color }}>{m.name}</b> <span>{m.text}</span>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
