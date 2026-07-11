import { useSyncExternalStore } from 'react'

const KEY = 'vibelive-store-v2'
const H = 3600e3
const listeners = new Set()

const VISITOR_POOL = [
  ['Priya', '👧'], ['Rahul', '🧑'], ['Sana', '👩'], ['Dev', '👨'], ['Tanya', '👱‍♀️'],
  ['Ali', '🧔'], ['Mia', '👩‍🦰'], ['Karan', '👨‍🦱'], ['Noor', '🧕'], ['Leo', '👦'],
]

function seedInbox(t) {
  return {
    team: {
      user: { name: 'VibeLive Team', avatar: '📣', official: true },
      msgs: [
        { from: 'them', text: 'Welcome to VibeLive! 🎉 You got 500 free coins. Tap Go Live to start your first broadcast, or visit the Games lobby to win more coins!', at: t - 26 * H },
      ],
      unread: 1,
    },
    bot: {
      user: { name: 'Online Service', avatar: '🤖', official: true, bot: true },
      msgs: [
        { from: 'them', text: 'Hi! I am your 24×7 VibeLive service bot 🤖 Ask me about your Account, Live streaming, Top up & coins, Privileges, Settings or Features.', at: t - 20 * H },
      ],
      unread: 0,
    },
    aisha: {
      user: { name: 'Aisha ✨', avatar: '👩‍🎤' },
      msgs: [{ from: 'them', text: 'Hey! Thanks for watching my stream 💖 Come back tonight, singing at 9!', at: t - 5 * H }],
      unread: 1,
    },
    rockyg: {
      user: { name: 'Rocky G', avatar: '🎮' },
      msgs: [{ from: 'them', text: 'GG bro, that was a fun raid 🎮🔥', at: t - 9 * H }],
      unread: 0,
    },
  }
}

function fresh() {
  const t = Date.now()
  const legacyRaw = localStorage.getItem('vibelive-diamonds')
  const legacy = Number(legacyRaw)
  return {
    userId: String(1000000 + Math.floor(Math.random() * 8999999)),
    avatar: '😎',
    coins: legacyRaw !== null && Number.isFinite(legacy) ? legacy : 500,
    beans: 0,
    points: 0,
    xp: 0,
    svip: 0,
    rank: null,
    inventory: ['frame-neon'],
    equipped: { frame: 'frame-neon', car: null, entry: null, id: null, badge: null },
    following: [],
    groups: ['VibeLive Stars', 'Global Friends'],
    visitors: VISITOR_POOL.map(([name, avatar], i) => ({
      name, avatar,
      at: t - (i + 1) * 2.7 * H,
      lv: 5 + ((i * 17) % 46),
    })),
    watched: [],
    recharges: [],
    redeems: [],
    liveMinutes: 0,
    giftsReceived: 0,
    tasksClaimed: [],
    inbox: seedInbox(t),
  }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...fresh(), ...JSON.parse(raw) }
  } catch { /* corrupted -> reseed */ }
  return fresh()
}

let state = load()
persist()

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* storage full */ }
}

export function update(patch) {
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) }
  persist()
  listeners.forEach((l) => l())
}

export const getState = () => state

export function useStore() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => state
  )
}

/* ---------- wallet ---------- */
export const levelOf = (xp) => Math.min(100, 1 + Math.floor(Math.sqrt(xp / 50)))
export const levelProgress = (xp) => {
  const lv = levelOf(xp)
  const cur = 50 * (lv - 1) * (lv - 1)
  const next = 50 * lv * lv
  return Math.min(1, (xp - cur) / Math.max(1, next - cur))
}

export function spendCoins(n) {
  if (state.coins < n) return false
  update((s) => ({ coins: s.coins - n, xp: s.xp + n }))
  return true
}
export const addCoins = (n) => update((s) => ({ coins: s.coins + n }))
export const addBeans = (n) =>
  update((s) => ({ beans: s.beans + n, giftsReceived: s.giftsReceived + 1 }))

export function recharge(coins) {
  update((s) => ({
    coins: s.coins + coins,
    points: s.points + coins,
    recharges: [...s.recharges, { coins, points: coins, at: Date.now() }],
  }))
}

export function spendPoints(n) {
  if (state.points < n) return false
  update((s) => ({ points: s.points - n }))
  return true
}

/* ---------- backpack ---------- */
export function buyItem(id, cost) {
  if (state.inventory.includes(id) || !spendCoins(cost)) return false
  update((s) => ({ inventory: [...s.inventory, id] }))
  return true
}
export function equipItem(slot, id) {
  update((s) => ({
    equipped: { ...s.equipped, [slot]: s.equipped[slot] === id ? null : id },
  }))
}
export const grantItem = (id) =>
  update((s) => (s.inventory.includes(id) ? {} : { inventory: [...s.inventory, id] }))

/* ---------- social ---------- */
export function toggleFollow(id) {
  update((s) => ({
    following: s.following.includes(id) ? s.following.filter((x) => x !== id) : [...s.following, id],
  }))
}
export function toggleGroup(name) {
  update((s) => ({
    groups: s.groups.includes(name) ? s.groups.filter((g) => g !== name) : [...s.groups, name],
  }))
}

export function addWatched(entry) {
  update((s) => ({
    watched: [{ ...entry, at: Date.now() }, ...s.watched.filter((w) => w.id !== entry.id)].slice(0, 30),
  }))
}

/* ---------- inbox ---------- */
export function addDM(cid, from, text, user) {
  update((s) => {
    const conv = s.inbox[cid] || { user: user || { name: cid, avatar: '👤' }, msgs: [], unread: 0 }
    return {
      inbox: {
        ...s.inbox,
        [cid]: {
          ...conv,
          msgs: [...conv.msgs.slice(-80), { from, text, at: Date.now() }],
          unread: from === 'them' ? conv.unread + 1 : conv.unread,
        },
      },
    }
  })
}
export function markRead(cid) {
  update((s) =>
    s.inbox[cid] ? { inbox: { ...s.inbox, [cid]: { ...s.inbox[cid], unread: 0 } } } : {}
  )
}
export const unreadTotal = (s) => Object.values(s.inbox).reduce((a, c) => a + c.unread, 0)

export function claimTask(id, beans) {
  if (state.tasksClaimed.includes(id)) return
  update((s) => ({ tasksClaimed: [...s.tasksClaimed, id], beans: s.beans + beans }))
}

export const setProfile = (patch) => update(patch)

export const timeAgo = (t) => {
  const m = Math.max(1, Math.round((Date.now() - t) / 60000))
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}
