import { PageHead } from './Backpack.jsx'

const EVENTS = [
  ['🐱', 'Lucky Cat ×2 rewards'],
  ['🍰', 'Greedy bonus round — King ×60'],
  ['🚀', 'Rocket cashback 10%'],
  ['🎁', 'Gift discount day −15%'],
  ['⭐', 'Double points on recharge'],
  ['🫘', 'Double beans for streamers'],
  ['🎮', 'Games tournament — top 10 win frames'],
  ['👑', 'Aristocracy 20% off'],
  ['🎤', 'Karaoke battle night'],
  ['🐉', 'Dragon gift ×2 animation day'],
]

export default function Activity() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const first = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()
  const eventFor = (d) => EVENTS[(d + month) % EVENTS.length]
  const monthName = today.toLocaleString([], { month: 'long', year: 'numeric' })

  return (
    <div className="page">
      <PageHead title="📅 Activities" sub={`Event calendar · ${monthName}`} />

      <div className="cal">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={i} className="cal-head">{d}</span>
        ))}
        {Array.from({ length: first }, (_, i) => <span key={'e' + i} />)}
        {Array.from({ length: days }, (_, i) => {
          const d = i + 1
          const isToday = d === today.getDate()
          return (
            <span key={d} className={isToday ? 'cal-day today' : 'cal-day'} title={eventFor(d)[1]}>
              <b>{d}</b>
              <i>{eventFor(d)[0]}</i>
            </span>
          )
        })}
      </div>

      <h2 className="section-title">This week</h2>
      <div className="list">
        {Array.from({ length: 7 }, (_, i) => {
          const d = new Date(year, month, today.getDate() + i)
          const [emoji, label] = eventFor(d.getDate())
          return (
            <div key={i} className="list-row">
              <span className="list-ico">{emoji}</span>
              <span className="list-main">
                <b>{label}</b>
                <small>{i === 0 ? 'Today' : d.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' })}</small>
              </span>
              {i === 0 && <a className="list-btn" href="#/games">Play</a>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
