import { useEffect, useRef, useState } from 'react'
import { useStore, addDM, markRead, timeAgo } from '../lib/store.js'
import { botReply, HUMAN_REPLIES, TOPIC_CHIPS } from '../lib/bot.js'
import { STREAMS } from '../data/demo.js'
import { PageHead } from './Backpack.jsx'

export default function Inbox() {
  const s = useStore()
  const [picking, setPicking] = useState(false)

  const convs = Object.entries(s.inbox).sort((a, b) => {
    const la = a[1].msgs[a[1].msgs.length - 1]?.at || 0
    const lb = b[1].msgs[b[1].msgs.length - 1]?.at || 0
    return lb - la
  })

  const startChat = (st) => {
    if (!s.inbox[st.id]) addDM(st.id, 'them', `Hi! This is ${st.name} 👋 Thanks for reaching out!`, { name: st.name, avatar: st.avatar })
    location.hash = `#/dm/${st.id}`
  }

  return (
    <div className="page">
      <PageHead title="✉️ Inbox" sub="Messages, friends & service" back="#/" />
      <button className="btn-primary new-chat" onClick={() => setPicking(!picking)}>
        ＋ New message
      </button>
      {picking && (
        <div className="contact-pick">
          {STREAMS.map((st) => (
            <button key={st.id} onClick={() => startChat(st)}>
              <span>{st.avatar}</span> {st.name}
            </button>
          ))}
        </div>
      )}

      <div className="list">
        {convs.map(([cid, c]) => {
          const last = c.msgs[c.msgs.length - 1]
          return (
            <a key={cid} className="list-row" href={`#/dm/${cid}`}>
              <span className="list-ico conv-avatar">{c.user.avatar}</span>
              <span className="list-main">
                <b>
                  {c.user.name} {c.user.official && <span className="official">✓</span>}
                </b>
                <small className="conv-preview">{last ? last.text.slice(0, 46) : 'Say hi!'}</small>
              </span>
              <span className="list-side conv-side">
                {last && <small>{timeAgo(last.at)}</small>}
                {c.unread > 0 && <span className="unread-dot">{c.unread}</span>}
              </span>
            </a>
          )
        })}
      </div>
    </div>
  )
}

export function DMThread({ cid, embedded = false }) {
  const s = useStore()
  const conv = s.inbox[cid]
  const [text, setText] = useState('')
  const listRef = useRef(null)
  const isBot = conv?.user.bot

  useEffect(() => {
    markRead(cid)
  }, [cid, conv?.msgs.length]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [conv?.msgs.length])

  if (!conv) {
    return (
      <div className="ended">
        <h2>Conversation not found</h2>
        <a className="btn-primary" href="#/inbox">Back to Inbox</a>
      </div>
    )
  }

  const send = (msg) => {
    const t = (msg ?? text).trim()
    if (!t) return
    addDM(cid, 'me', t)
    setText('')
    if (isBot) {
      const reply = botReply(t)
      setTimeout(() => addDM(cid, 'them', reply.text), 700)
    } else if (!conv.user.official) {
      setTimeout(() => addDM(cid, 'them', HUMAN_REPLIES[Math.floor(Math.random() * HUMAN_REPLIES.length)]), 1400 + Math.random() * 1600)
    }
  }

  return (
    <div className={embedded ? 'dm dm-embedded' : 'dm page'}>
      {!embedded && (
        <div className="page-head dm-head">
          <a className="page-back" href="#/inbox">‹</a>
          <span className="conv-avatar">{conv.user.avatar}</span>
          <div>
            <h1>
              {conv.user.name} {conv.user.official && <span className="official">✓</span>}
            </h1>
            <p>{isBot ? 'Service bot · replies instantly' : 'Usually replies fast'}</p>
          </div>
        </div>
      )}

      <div className="dm-msgs" ref={listRef}>
        {conv.msgs.map((m, i) => (
          <div key={i} className={m.from === 'me' ? 'dm-msg me' : 'dm-msg'}>
            <div className="dm-bubble">{m.text}</div>
            <small>{timeAgo(m.at)}</small>
          </div>
        ))}
      </div>

      {isBot && (
        <div className="chips dm-chips">
          {TOPIC_CHIPS.map((c) => (
            <button key={c} className="chip" onClick={() => send(c)}>{c}</button>
          ))}
        </div>
      )}

      <form
        className="dm-inputrow"
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <input
          className="chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isBot ? 'Ask about account, coins, live…' : 'Type a message…'}
          maxLength={300}
        />
        <button type="submit" className="round-btn round-gift">➤</button>
      </form>
    </div>
  )
}
