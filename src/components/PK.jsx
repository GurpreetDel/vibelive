import { fmt } from '../lib/util.js'

export const PK_SECONDS = 60

export const PUNISHMENTS = [
  'Punishment: sing a song! 🎤',
  'Punishment: 10 push-ups! 💪',
  'Punishment: wear the clown filter! 🤡',
  'Punishment: drink lemon juice! 🍋',
  'Punishment: dance for 30 seconds! 💃',
]

export const randPunishment = () => PUNISHMENTS[Math.floor(Math.random() * PUNISHMENTS.length)]

export function PKBar({ pk, meName, meAvatar }) {
  const total = pk.a + pk.b || 1
  const pct = Math.max(6, Math.min(94, Math.round((pk.a / total) * 100)))
  const winning = pk.a >= pk.b
  return (
    <div className="pk-wrap">
      <div className="pk-head">
        <span className="pk-side me">{meAvatar} {meName}</span>
        <span className={pk.sec <= 10 ? 'pk-timer urgent' : 'pk-timer'}>⚔️ {pk.sec}s</span>
        <span className="pk-side foe">{pk.enemy.name} {pk.enemy.avatar}</span>
      </div>
      <div className="pk-bar">
        <div className={winning ? 'pk-fill lead' : 'pk-fill'} style={{ width: pct + '%' }} />
        <span className="pk-score a">{fmt(Math.round(pk.a))}</span>
        <span className="pk-vs">VS</span>
        <span className="pk-score b">{fmt(Math.round(pk.b))}</span>
      </div>
      <div className="pk-hint">🎁 Gifts power your side!</div>
    </div>
  )
}

export function PKResult({ result }) {
  return (
    <div className="pk-result">
      {result.won ? (
        <>
          <div className="pk-result-title win">🏆 VICTORY!</div>
          <div className="pk-loser">
            {result.enemy.avatar}
            <span className="pk-doodle">😵</span>
          </div>
          <p>
            <b>{result.enemy.name}</b> is defeated! {result.punishment}
          </p>
          <div className="confetti">
            {[...Array(26)].map((_, i) => (
              <i
                key={i}
                style={{
                  left: `${(i * 37) % 100}%`,
                  animationDelay: `${(i % 9) * 0.14}s`,
                  background: ['#ff2d78', '#ffd24d', '#00d4ff', '#7b2dff', '#2dff9a'][i % 5],
                }}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="pk-result-title lose">💀 DEFEAT</div>
          <div className="pk-loser">😵</div>
          <p>
            <b>{result.enemy.name}</b> wins this round. {result.punishment} Revenge next PK!
          </p>
        </>
      )}
    </div>
  )
}
