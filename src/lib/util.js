const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export const randCode = () =>
  Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('')

export const fmt = (n) =>
  n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n)

export function myName() {
  let n = localStorage.getItem('vibelive-name')
  if (!n) {
    n = 'Guest' + Math.floor(1000 + Math.random() * 9000)
    localStorage.setItem('vibelive-name', n)
  }
  return n
}

export const setMyName = (n) => localStorage.setItem('vibelive-name', n)

export const CHAT_COLORS = ['#ff8fb8', '#9ad0ff', '#ffd24d', '#a5ff9a', '#d6a5ff', '#ffb38a', '#8affea']
export const colorFor = (name) => {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return CHAT_COLORS[h % CHAT_COLORS.length]
}

export const HEART_EMOJIS = ['❤️', '🧡', '💛', '💚', '💙', '💜', '💖', '🩷']
export const randHeart = () => HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)]

export const watchUrl = (code) => `${location.origin}${location.pathname}#/watch/${code}`
