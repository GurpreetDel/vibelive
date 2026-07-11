export default function EpicGift({ epic }) {
  if (!epic) return null
  return (
    <div className="epic" key={epic.key}>
      <div className="epic-emoji">{epic.emoji}</div>
      <div className="epic-text">
        <b>{epic.from}</b> sent a <b>{epic.name}</b>!
      </div>
      <div className="epic-rays" />
    </div>
  )
}
