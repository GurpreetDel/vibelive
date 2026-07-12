/* Gift sound engine — Web Audio synthesized SFX + speech announcer.
   No audio assets needed; everything is synthesized live. */

let ctx = null
let master = null
let enabled = (localStorage.getItem('vibelive-sound') ?? 'on') === 'on'

const ac = () => {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.5
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

// unlock audio on first interaction (mobile autoplay policy)
if (typeof window !== 'undefined') {
  const unlock = () => enabled && ac()
  window.addEventListener('pointerdown', unlock, { once: true })
}

export const soundEnabled = () => enabled
export const toggleSound = () => {
  enabled = !enabled
  localStorage.setItem('vibelive-sound', enabled ? 'on' : 'off')
  if (enabled) ac()
  else try { speechSynthesis.cancel() } catch { /* noop */ }
  return enabled
}

const now = () => ctx.currentTime

function tone({ type = 'sine', f0 = 440, f1, dur = 0.3, g = 0.25, at = 0 }) {
  if (!ac()) return
  const t0 = now() + at
  const o = ctx.createOscillator()
  const gn = ctx.createGain()
  o.type = type
  o.frequency.setValueAtTime(f0, t0)
  if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur)
  gn.gain.setValueAtTime(0.0001, t0)
  gn.gain.exponentialRampToValueAtTime(g, t0 + 0.015)
  gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  o.connect(gn)
  gn.connect(master)
  o.start(t0)
  o.stop(t0 + dur + 0.05)
}

let noiseBuf = null
function noise({ dur = 0.4, filter = 'lowpass', ff0 = 800, ff1, q = 1, g = 0.3, at = 0 }) {
  if (!ac()) return
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  const t0 = now() + at
  const src = ctx.createBufferSource()
  src.buffer = noiseBuf
  src.loop = true
  const f = ctx.createBiquadFilter()
  f.type = filter
  f.Q.value = q
  f.frequency.setValueAtTime(ff0, t0)
  if (ff1) f.frequency.exponentialRampToValueAtTime(Math.max(30, ff1), t0 + dur)
  const gn = ctx.createGain()
  gn.gain.setValueAtTime(0.0001, t0)
  gn.gain.exponentialRampToValueAtTime(g, t0 + 0.02)
  gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  src.connect(f)
  f.connect(gn)
  gn.connect(master)
  src.start(t0)
  src.stop(t0 + dur + 0.05)
}

export const SFX = {
  whoosh: () => noise({ dur: 0.55, filter: 'bandpass', ff0: 250, ff1: 2800, q: 2, g: 0.35 }),
  sparkle: () => {
    for (let i = 0; i < 5; i++)
      tone({ type: 'sine', f0: 1300 + Math.random() * 1200, dur: 0.25, g: 0.12, at: i * 0.07 })
  },
  kiss: () => {
    tone({ type: 'sine', f0: 420, f1: 130, dur: 0.16, g: 0.4 })
    noise({ dur: 0.08, filter: 'highpass', ff0: 1500, g: 0.12, at: 0.02 })
  },
  honk: () => {
    tone({ type: 'square', f0: 230, dur: 0.16, g: 0.25 })
    tone({ type: 'square', f0: 230, dur: 0.22, g: 0.25, at: 0.22 })
  },
  splat: () => {
    noise({ dur: 0.16, filter: 'lowpass', ff0: 900, g: 0.45 })
    tone({ type: 'sine', f0: 110, f1: 45, dur: 0.3, g: 0.35, at: 0.02 })
  },
  engine: () => {
    tone({ type: 'sawtooth', f0: 55, f1: 240, dur: 1.5, g: 0.3 })
    tone({ type: 'sawtooth', f0: 57, f1: 250, dur: 1.5, g: 0.2 })
    noise({ dur: 1.5, filter: 'lowpass', ff0: 300, ff1: 1200, g: 0.15 })
  },
  roar: () => {
    noise({ dur: 1.3, filter: 'lowpass', ff0: 500, ff1: 180, g: 0.5 })
    tone({ type: 'sawtooth', f0: 85, f1: 45, dur: 1.3, g: 0.3 })
    tone({ type: 'sawtooth', f0: 130, f1: 60, dur: 1.1, g: 0.15, at: 0.1 })
  },
  thunder: () => {
    noise({ dur: 0.07, filter: 'highpass', ff0: 2000, g: 0.4 })
    noise({ dur: 2, filter: 'lowpass', ff0: 220, ff1: 60, g: 0.55, at: 0.06 })
  },
  coins: () => {
    for (let i = 0; i < 8; i++)
      tone({ type: 'triangle', f0: 2100 + ((i * 173) % 900), dur: 0.18, g: 0.14, at: i * 0.06 })
  },
  fanfare: () => {
    const notes = [523, 659, 784, 1046]
    notes.forEach((f, i) => tone({ type: 'square', f0: f, dur: i === 3 ? 0.5 : 0.18, g: 0.16, at: i * 0.13 }))
  },
  magic: () => {
    tone({ type: 'sine', f0: 480, f1: 1900, dur: 0.7, g: 0.2 })
    SFX.sparkle()
  },
  wave: () => noise({ dur: 1.6, filter: 'bandpass', ff0: 280, ff1: 900, q: 1.4, g: 0.4 }),
  explosion: () => {
    noise({ dur: 1.5, filter: 'lowpass', ff0: 900, ff1: 90, g: 0.6 })
    tone({ type: 'sine', f0: 60, f1: 30, dur: 1.4, g: 0.45 })
    SFX.sparkle()
  },
  heart: () => {
    tone({ type: 'sine', f0: 90, f1: 60, dur: 0.16, g: 0.4 })
    tone({ type: 'sine', f0: 85, f1: 55, dur: 0.2, g: 0.35, at: 0.24 })
  },
  win: () => {
    const notes = [523, 659, 784, 1046, 1318]
    notes.forEach((f, i) => tone({ type: 'triangle', f0: f, dur: 0.22, g: 0.2, at: i * 0.11 }))
    SFX.coins()
  },
  lose: () => {
    tone({ type: 'sawtooth', f0: 320, f1: 140, dur: 0.7, g: 0.2 })
    tone({ type: 'sawtooth', f0: 240, f1: 100, dur: 0.9, g: 0.18, at: 0.25 })
  },
}

let voices = []
const loadVoices = () => { try { voices = speechSynthesis.getVoices() } catch { voices = [] } }
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices()
  speechSynthesis.onvoiceschanged = loadVoices
}

export function speak(text) {
  if (!enabled) return
  try {
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 1.06
    u.pitch = 1.12
    u.volume = 0.95
    u.voice =
      voices.find((v) => /^en/i.test(v.lang) && /female|zira|jenny|aria|samantha|susan/i.test(v.name)) ||
      voices.find((v) => /^en(-|_)US/i.test(v.lang)) ||
      voices.find((v) => /^en/i.test(v.lang)) ||
      null
    speechSynthesis.cancel()
    speechSynthesis.speak(u)
  } catch { /* speech unavailable */ }
}

/* Play the right sound + announcer voice for a gift */
export function giftSound(gift, from = 'Someone') {
  if (!enabled) return
  const fx = gift.fx || ''
  let key = gift.sound
  if (!key) {
    if (fx.startsWith('car:')) key = 'engine'
    else if (fx === 'dragon') key = 'roar'
    else if (fx === 'lightning') key = 'thunder'
    else if (fx === 'wave') key = 'wave'
    else if (fx === 'swirl' || fx === 'mystery') key = 'magic'
    else if (fx === 'universe') key = 'explosion'
    else if (fx === 'face-kiss' || fx === 'face-teddy') key = 'kiss'
    else if (fx === 'face-clown') key = 'honk'
    else if (fx === 'face-egg') key = 'splat'
    else if (fx === 'face-crown') key = 'fanfare'
    else if (gift.lucky) key = 'coins'
    else if (gift.cost >= 10000) key = 'explosion'
    else if (gift.cost >= 1000) key = 'fanfare'
    else if (gift.id === 'heart') key = 'heart'
    else key = 'sparkle'
  }
  SFX.whoosh()
  setTimeout(() => SFX[key] && SFX[key](), 120)
  if (gift.cost >= 1000) {
    const phrase =
      gift.cost >= 100000
        ? `LEGENDARY! ${from} sent the ${gift.name}! Unbelievable!`
        : gift.cost >= 10000
          ? `Incredible! ${from} sent a ${gift.name}!`
          : `Wow! ${from} sent a ${gift.name}!`
    setTimeout(() => speak(phrase), 300)
  }
}

export const eggSound = () => enabled && SFX.splat()
export const luckySound = () => {
  if (!enabled) return
  SFX.win()
  setTimeout(() => speak('Lucky win!'), 200)
}
export const victorySound = () => {
  if (!enabled) return
  SFX.win()
  setTimeout(() => speak('Victory!'), 300)
}
export const defeatSound = () => enabled && SFX.lose()
