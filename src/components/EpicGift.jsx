export default function EpicGift({ epic }) {
  if (!epic) return null
  const mythic = epic.tier === 'mythic'
  return (
    <div className={mythic ? 'epic mythic' : 'epic'} key={epic.key}>
      {mythic && <div className="epic-flash" />}
      <div className="epic-rays" />
      {mythic && (
        <div className="epic-swarm">
          {[...Array(10)].map((_, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.22}s`, left: `${6 + i * 9}%` }}>
              {epic.emoji}
            </span>
          ))}
        </div>
      )}
      <div className="epic-emoji">{epic.emoji}</div>
      {mythic && (
        <div className="epic-rings">
          <i /><i /><i />
        </div>
      )}
      <div className="epic-text">
        <b>{epic.from}</b> sent {epic.count > 1 ? <b>×{epic.count} </b> : ''}
        <b>{epic.name}</b>{mythic ? ' 🌟' : '!'}
      </div>
    </div>
  )
}
