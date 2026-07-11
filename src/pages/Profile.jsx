import { useState } from 'react'
import { useStore, levelOf, levelProgress, setProfile } from '../lib/store.js'
import { itemById, rankById } from '../data/items.js'
import { myName, setMyName, fmt } from '../lib/util.js'

const AVATARS = ['😎', '🤩', '😇', '🥳', '😺', '🦊', '🐼', '🦄', '👸', '🤴', '🧑‍🎤', '👩‍🎤']

const MENU = [
  ['#/backpack', '🎒', 'Backpack', 'Cars, entry effects, frames, IDs'],
  ['#/recharge', '💳', 'Recharge Coins', 'Top up instantly'],
  ['#/points', '⭐', 'Points Center', 'Earn points on every recharge'],
  ['#/aristocracy', '👑', 'Aristocracy Center', 'Baron → Legendary King'],
  ['#/svip', '💠', 'SVIP', 'Supreme VIP privileges'],
  ['#/streamer', '🎥', 'Live Streamer Center', 'Beans, tasks & earnings'],
  ['#/visitors', '👀', 'Recent Visitors', 'Who viewed your profile'],
  ['#/watched', '🕐', 'Broadcasts Watched', 'Your watch history'],
  ['#/activity', '📅', 'Activities', 'Events & bonus calendar'],
  ['#/games', '🎮', 'Games Lobby', 'Lucky Cat, Greedy & more'],
  ['#/support', '🤖', 'Online Service 24×7', 'Account · Live · Top up · Help'],
  ['#/install', '📱', 'Get Mobile App', 'Install on your phone'],
  ['#/privacy', '🔒', 'Privacy Policy', ''],
]

export default function Profile() {
  const s = useStore()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(myName())

  const lv = levelOf(s.xp)
  const frame = itemById(s.equipped.frame)
  const idItem = itemById(s.equipped.id)
  const car = itemById(s.equipped.car)
  const badge = itemById(s.equipped.badge)
  const rank = s.rank ? rankById(s.rank) : null
  const friends = 12 + Math.floor(s.following.length / 2)
  const followers = 128 + s.following.length * 3

  const cycleAvatar = () => {
    const i = AVATARS.indexOf(s.avatar)
    setProfile({ avatar: AVATARS[(i + 1) % AVATARS.length] })
  }

  const saveName = () => {
    if (name.trim()) setMyName(name.trim())
    setEditing(false)
  }

  return (
    <div className="profile">
      <div className="profile-head">
        <button className={`pf-avatar ${frame?.css || ''}`} onClick={cycleAvatar} title="Tap to change avatar">
          {s.avatar}
          {car && <span className="pf-car">{car.emoji}</span>}
        </button>
        <div className="pf-name-row">
          {editing ? (
            <span className="pf-edit">
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} autoFocus />
              <button onClick={saveName}>✓</button>
            </span>
          ) : (
            <h1 onClick={() => setEditing(true)} title="Tap to edit name">
              {myName()} <span className="pf-pencil">✏️</span>
            </h1>
          )}
        </div>
        <div className="pf-badges">
          <span className="lv">Lv{lv}</span>
          {s.svip > 0 && <span className="svip-badge">SVIP{s.svip}</span>}
          {rank && (
            <span className="rank-badge" style={{ borderColor: rank.color, color: rank.color }}>
              {rank.emoji} {rank.name}
            </span>
          )}
          {badge && <span className="orn-badge">{badge.emoji}</span>}
        </div>
        <div className={idItem ? `pf-id pf-id-${idItem.slot === 'id' && idItem.id === 'id-gold' ? 'gold' : 'silver'}` : 'pf-id'}>
          ID: {idItem ? `${idItem.emoji} ${idItem.value}` : s.userId}
        </div>
        <div className="pf-levelbar">
          <div className="pf-levelfill" style={{ width: `${Math.round(levelProgress(s.xp) * 100)}%` }} />
        </div>
        <small className="pf-levelhint">Spend coins to level up · Lv{lv} → Lv{lv + 1}</small>
      </div>

      <div className="pf-stats">
        <a href="#/connections/friends"><b>{friends}</b><span>Friends</span></a>
        <a href="#/connections/following"><b>{s.following.length}</b><span>Following</span></a>
        <a href="#/connections/followers"><b>{fmt(followers)}</b><span>Followers</span></a>
        <a href="#/connections/groups"><b>{s.groups.length}</b><span>Groups</span></a>
      </div>

      <div className="pf-wallet">
        <div><b>🪙 {fmt(s.coins)}</b><span>Coins</span></div>
        <div><b>🫘 {fmt(s.beans)}</b><span>Beans</span></div>
        <div><b>⭐ {fmt(s.points)}</b><span>Points</span></div>
        <a className="btn-primary pf-recharge" href="#/recharge">Recharge</a>
      </div>

      <div className="pf-menu">
        {MENU.map(([href, ico, label, sub]) => (
          <a key={href} className="pf-menu-item" href={href}>
            <span className="pf-menu-ico">{ico}</span>
            <span className="pf-menu-text">
              <b>{label}</b>
              {sub && <small>{sub}</small>}
            </span>
            <span className="pf-menu-arrow">›</span>
          </a>
        ))}
      </div>
    </div>
  )
}
