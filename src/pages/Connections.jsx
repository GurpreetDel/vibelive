import { useStore, toggleFollow, toggleGroup } from '../lib/store.js'
import { STREAMS, FRIENDS } from '../data/demo.js'
import { generatedStreamer } from '../data/countries.js'
import { fmt } from '../lib/util.js'
import { PageHead } from './Backpack.jsx'

const TABS = ['friends', 'following', 'followers', 'groups']
const FOLLOWERS = [
  ['StarGazer99', '🌟', 8], ['DanceQueen', '💃', 33], ['MusicLover', '🎧', 21], ['Foodie_Sam', '🍜', 17],
  ['NightOwl', '🦉', 26], ['GamerX', '🎮', 39], ['SunnyDay', '🌞', 14], ['CricketFan', '🏏', 31],
]
const GROUPS = [
  { name: 'VibeLive Stars', emoji: '⭐', members: 12400 },
  { name: 'Global Friends', emoji: '🌍', members: 8930 },
  { name: 'Desi Singers', emoji: '🎤', members: 5210 },
  { name: 'Gamers Adda', emoji: '🎮', members: 15800 },
  { name: 'Dance Floor', emoji: '💃', members: 7600 },
  { name: 'Foodies United', emoji: '🍕', members: 4300 },
]

export default function Connections({ tab }) {
  const s = useStore()
  const active = TABS.includes(tab) ? tab : 'friends'

  const followingList = s.following
    .map((id) => STREAMS.find((x) => x.id === id) || generatedStreamer(id))
    .filter(Boolean)

  return (
    <div className="page">
      <PageHead title="👥 My Connections" sub="Friends, follows & groups" />
      <div className="chips">
        {TABS.map((t) => (
          <a key={t} className={t === active ? 'chip active' : 'chip'} href={`#/connections/${t}`}>
            {t[0].toUpperCase() + t.slice(1)}
          </a>
        ))}
      </div>

      <div className="list">
        {active === 'friends' &&
          FRIENDS.map((f) => (
            <div key={f.name} className="list-row">
              <span className="list-ico conv-avatar">{f.avatar}</span>
              <span className="list-main"><b>{f.name}</b><small>Lv{f.lv} · mutual follow</small></span>
              <a className="list-btn" href="#/inbox">💬 Chat</a>
            </div>
          ))}

        {active === 'following' && (
          followingList.length === 0 ? (
            <p className="muted-text pad">You're not following anyone yet — tap ＋ Follow in any live room!</p>
          ) : (
            followingList.map((st) => (
              <div key={st.id} className="list-row">
                <span className="list-ico conv-avatar">{st.avatar}</span>
                <span className="list-main"><b>{st.name} {st.country}</b><small>{st.title}</small></span>
                <button className="list-btn" onClick={() => toggleFollow(st.id)}>Unfollow</button>
              </div>
            ))
          )
        )}

        {active === 'followers' &&
          FOLLOWERS.map(([name, avatar, lv]) => (
            <div key={name} className="list-row">
              <span className="list-ico conv-avatar">{avatar}</span>
              <span className="list-main"><b>{name}</b><small>Lv{lv} · follows you</small></span>
              <span className="list-side">💖</span>
            </div>
          ))}

        {active === 'groups' &&
          GROUPS.map((g) => {
            const joined = s.groups.includes(g.name)
            return (
              <div key={g.name} className="list-row">
                <span className="list-ico conv-avatar">{g.emoji}</span>
                <span className="list-main"><b>{g.name}</b><small>{fmt(g.members)} members</small></span>
                <button className={joined ? 'list-btn joined' : 'list-btn'} onClick={() => toggleGroup(g.name)}>
                  {joined ? '✓ Joined' : 'Join'}
                </button>
              </div>
            )
          })}
      </div>
    </div>
  )
}
