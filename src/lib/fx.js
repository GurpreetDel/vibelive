/* VibeLive FX engine — canvas particle/sprite effects for gift animations.
   Gifts fly left→right with glow trails; dragons are articulated serpents;
   mythic gifts get beams + fireworks + zoom takeover; eggs splat. */

const TAU = Math.PI * 2
const rand = (a, b) => a + Math.random() * (b - a)
const ease = (k) => 1 - Math.pow(1 - k, 3)

export const playGiftFx = (gift, count = 1, from = '') =>
  window.dispatchEvent(
    new CustomEvent('vibe-fx', {
      detail: { kind: 'gift', id: gift.id, emoji: gift.emoji, cost: gift.cost, fx: gift.fx, svga: gift.svga, count, from },
    })
  )

export const playEggFx = (x = 0.5, y = 0.4) =>
  window.dispatchEvent(new CustomEvent('vibe-fx', { detail: { kind: 'egg', x, y } }))

export class FxEngine {
  constructor(canvas) {
    this.cv = canvas
    this.ctx = canvas.getContext('2d')
    this.items = []
    this.raf = 0
    this.resize = this.resize.bind(this)
    this.tick = this.tick.bind(this)
    this.resize()
    window.addEventListener('resize', this.resize)
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    this.raf = 0
    window.removeEventListener('resize', this.resize)
  }

  resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    this.w = this.cv.clientWidth || innerWidth
    this.h = this.cv.clientHeight || innerHeight
    this.cv.width = this.w * dpr
    this.cv.height = this.h * dpr
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  add(item) {
    item.t = item.t ?? 0
    this.items.push(item)
    if (!this.raf) {
      this.last = performance.now()
      this.raf = requestAnimationFrame(this.tick)
    }
  }

  tick(now) {
    const dt = Math.min(0.05, (now - this.last) / 1000)
    this.last = now
    const { ctx } = this
    ctx.clearRect(0, 0, this.w, this.h)
    this.items = this.items.filter((it) => {
      it.t += dt
      return it.t < it.dur
    })
    for (const it of this.items) {
      if (it.t < 0) continue
      it.draw(ctx, Math.min(1, it.t / it.dur), dt, this)
    }
    if (this.items.length) this.raf = requestAnimationFrame(this.tick)
    else {
      this.raf = 0
      ctx.clearRect(0, 0, this.w, this.h)
    }
  }

  /* ---- particles ---- */
  spark(x, y, opts = {}) {
    const a = rand(0, TAU)
    const sp = rand(40, opts.speed || 220)
    this.add({
      dur: opts.dur || rand(0.5, 1.1),
      x, y,
      vx: Math.cos(a) * sp + (opts.vx || 0),
      vy: Math.sin(a) * sp + (opts.vy || 0),
      g: opts.g ?? 220,
      size: opts.size || rand(1.5, 4),
      color: opts.color || `hsl(${rand(35, 55)}, 100%, ${rand(60, 80)}%)`,
      draw(ctx, k, dt) {
        this.vy += this.g * dt
        this.x += this.vx * dt
        this.y += this.vy * dt
        ctx.globalAlpha = 1 - k
        ctx.fillStyle = this.color
        ctx.shadowColor = this.color
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, TAU)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1
      },
    })
  }

  burst(x, y, n = 26, opts = {}) {
    for (let i = 0; i < n; i++) this.spark(x, y, opts)
  }

  /* ---- gift flight: emoji sprite sweeps left → right with glow trail ---- */
  flight({ emoji, size = 90, count = 1, delay = 0, dur = 2.6 }) {
    const eng = this
    const y0 = rand(0.22, 0.5) * this.h
    const y1 = rand(0.2, 0.55) * this.h
    const cpy = rand(0.1, 0.6) * this.h
    this.add({
      dur,
      t: -delay,
      trail: [],
      draw(ctx, k) {
        const kk = ease(k)
        const x = -0.15 * eng.w + kk * 1.3 * eng.w
        const y = (1 - kk) * (1 - kk) * y0 + 2 * (1 - kk) * kk * cpy + kk * kk * y1
        this.trail.push([x, y])
        if (this.trail.length > 9) this.trail.shift()
        for (let i = 0; i < this.trail.length - 1; i++) {
          const a = (i / this.trail.length) * 0.35
          ctx.globalAlpha = a
          ctx.font = `${size * (0.5 + (i / this.trail.length) * 0.5)}px serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(emoji, this.trail[i][0], this.trail[i][1])
        }
        ctx.globalAlpha = 1
        ctx.shadowColor = 'rgba(255,210,77,0.9)'
        ctx.shadowBlur = 34
        ctx.font = `${size}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(emoji, x, y)
        ctx.shadowBlur = 0
        if (count > 1) {
          ctx.font = `800 ${Math.max(22, size * 0.3)}px system-ui`
          ctx.strokeStyle = 'rgba(255,45,120,0.9)'
          ctx.lineWidth = 5
          ctx.strokeText(`×${count}`, x + size * 0.7, y - size * 0.42)
          ctx.fillStyle = '#fff'
          ctx.fillText(`×${count}`, x + size * 0.7, y - size * 0.42)
        }
        if (Math.random() < 0.7) eng.spark(x - size * 0.4, y, { speed: 90, g: 60, dur: 0.6 })
      },
    })
  }

  /* ---- articulated dragon serpent, flies left → right breathing fire ---- */
  dragon({ emoji = '🐉', golden = false, dur = 4.4 }) {
    const eng = this
    const baseY = rand(0.3, 0.42) * this.h
    const amp = this.h * 0.11
    const phase = rand(0, TAU)
    const path = (k) => [
      -0.18 * eng.w + ease(k) * 1.36 * eng.w,
      baseY + Math.sin(k * 5.5 + phase) * amp,
    ]
    this.add({
      dur,
      draw(ctx, k) {
        for (let i = 19; i >= 1; i--) {
          const kk = Math.max(0, k - i * 0.016)
          const [x, y] = path(kk)
          const r = 24 * (1 - i / 24) + 5
          const hue = golden ? 48 - i : 40 - i * 1.6
          ctx.fillStyle = `hsla(${hue}, 95%, ${62 - i}%, ${0.92 - i * 0.03})`
          ctx.shadowColor = golden ? 'rgba(255,215,0,0.85)' : 'rgba(255,110,40,0.8)'
          ctx.shadowBlur = 22
          ctx.beginPath()
          ctx.arc(x, y, r, 0, TAU)
          ctx.fill()
        }
        ctx.shadowBlur = 0
        const [hx, hy] = path(k)
        const [px, py] = path(Math.max(0, k - 0.02))
        const ang = Math.atan2(hy - py, hx - px)
        ctx.save()
        ctx.translate(hx, hy)
        ctx.rotate(ang * 0.35)
        ctx.font = '96px serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = 'rgba(255,180,40,1)'
        ctx.shadowBlur = 44
        ctx.fillText(emoji, 0, 0)
        ctx.restore()
        ctx.shadowBlur = 0
        const [tx, ty] = path(Math.max(0, k - 0.3))
        eng.spark(tx, ty, { color: `hsl(${rand(10, 45)},100%,60%)`, speed: 130, g: -70, dur: 0.8 })
        if (Math.random() < 0.5) eng.spark(hx + 30, hy, { color: '#ffd24d', speed: 160, g: 40 })
      },
    })
  }

  /* ---- rotating god-rays from center ---- */
  beams({ dur = 3.4, color = '255, 210, 77' }) {
    const eng = this
    this.add({
      dur,
      draw(ctx, k) {
        const cx = eng.w / 2
        const cy = eng.h * 0.45
        const alpha = (k < 0.15 ? k / 0.15 : k > 0.8 ? (1 - k) / 0.2 : 1) * 0.22
        ctx.save()
        ctx.translate(cx, cy)
        for (let i = 0; i < 7; i++) {
          ctx.save()
          ctx.rotate(k * 1.5 + (i * TAU) / 7)
          const grad = ctx.createLinearGradient(0, 0, eng.w, 0)
          grad.addColorStop(0, `rgba(${color}, ${alpha})`)
          grad.addColorStop(1, `rgba(${color}, 0)`)
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.lineTo(eng.w, -eng.w * 0.06)
          ctx.lineTo(eng.w, eng.w * 0.06)
          ctx.closePath()
          ctx.fill()
          ctx.restore()
        }
        ctx.restore()
      },
    })
  }

  /* ---- center zoom sprite (mythic hero) ---- */
  zoom({ emoji, dur = 3.6, size = 190 }) {
    const eng = this
    this.add({
      dur,
      draw(ctx, k) {
        const s = k < 0.18 ? (k / 0.18) * 1.35 : k < 0.3 ? 1.35 - ((k - 0.18) / 0.12) * 0.35 : 1 + Math.sin(k * 10) * 0.03
        const alpha = k > 0.85 ? (1 - k) / 0.15 : 1
        const shake = k < 0.3 ? rand(-4, 4) : 0
        ctx.globalAlpha = alpha
        ctx.font = `${size * s}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = 'rgba(255,210,77,1)'
        ctx.shadowBlur = 60
        ctx.fillText(emoji, eng.w / 2 + shake, eng.h * 0.42 + shake)
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1
        if (Math.random() < 0.6)
          eng.spark(eng.w / 2 + rand(-120, 120), eng.h * 0.42 + rand(-120, 120), { g: -60, speed: 100 })
      },
    })
  }

  fireworks({ bursts = 5, dur = 3 }) {
    for (let i = 0; i < bursts; i++) {
      const x = rand(0.2, 0.8) * this.w
      const y = rand(0.15, 0.5) * this.h
      const hue = rand(0, 360)
      this.add({
        dur: 0.01,
        t: -i * (dur / bursts),
        draw: () => {},
      })
      setTimeout(() => {
        this.burst(x, y, 42, { color: `hsl(${hue}, 100%, 65%)`, speed: 330, g: 150, dur: 1.4 })
        this.burst(x, y, 18, { color: '#fff', speed: 180, g: 120, dur: 1 })
      }, i * (dur / bursts) * 1000)
    }
  }

  coinRain({ n = 34, dur = 3.2 }) {
    const eng = this
    for (let i = 0; i < n; i++) {
      const x0 = rand(0, this.w)
      const sway = rand(20, 60)
      const spin = rand(3, 7)
      const r = rand(9, 15)
      this.add({
        dur: rand(2, dur),
        t: -rand(0, 1.2),
        draw(ctx, k) {
          const y = -30 + k * (eng.h + 60)
          const x = x0 + Math.sin(k * 6) * sway
          const sc = Math.abs(Math.cos(k * spin * TAU * 0.2 + x0))
          ctx.save()
          ctx.translate(x, y)
          ctx.scale(Math.max(0.15, sc), 1)
          const g = ctx.createRadialGradient(0, -r * 0.3, r * 0.1, 0, 0, r)
          g.addColorStop(0, '#fff3b0')
          g.addColorStop(0.55, '#ffd24d')
          g.addColorStop(1, '#c8860a')
          ctx.fillStyle = g
          ctx.shadowColor = 'rgba(255,210,77,0.8)'
          ctx.shadowBlur = 10
          ctx.beginPath()
          ctx.arc(0, 0, r, 0, TAU)
          ctx.fill()
          ctx.restore()
        },
      })
    }
  }

  lightning({ dur = 1.8 }) {
    const eng = this
    for (let s = 0; s < 3; s++) {
      this.add({
        dur: 0.34,
        t: -s * 0.45,
        bolt: null,
        draw(ctx, k) {
          if (!this.bolt) {
            const x0 = rand(0.25, 0.75) * eng.w
            const pts = [[x0, 0]]
            let x = x0
            for (let y = 0; y < eng.h * 0.55; y += eng.h * 0.06) {
              x += rand(-46, 46)
              pts.push([x, y])
            }
            this.bolt = pts
            eng.burst(pts[pts.length - 1][0], pts[pts.length - 1][1], 26, { color: '#bfe9ff', speed: 280 })
          }
          ctx.globalAlpha = 1 - k
          ctx.fillStyle = `rgba(190,230,255,${0.28 * (1 - k)})`
          ctx.fillRect(0, 0, eng.w, eng.h)
          ctx.strokeStyle = '#e8f7ff'
          ctx.lineWidth = 4
          ctx.shadowColor = '#7fd4ff'
          ctx.shadowBlur = 26
          ctx.beginPath()
          this.bolt.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
          ctx.stroke()
          ctx.shadowBlur = 0
          ctx.globalAlpha = 1
        },
      })
    }
  }

  swirl({ dur = 3.4 }) {
    const eng = this
    for (let i = 0; i < 90; i++) {
      const a0 = rand(0, TAU)
      const r0 = rand(0.25, 0.62) * Math.min(this.w, this.h)
      const hue = rand(230, 320)
      this.add({
        dur,
        t: -rand(0, 0.8),
        draw(ctx, k) {
          const a = a0 + k * 5
          const r = r0 * (1 - ease(k))
          const x = eng.w / 2 + Math.cos(a) * r
          const y = eng.h * 0.44 + Math.sin(a) * r * 0.6
          ctx.globalAlpha = Math.min(1, k * 4) * (1 - k * 0.5)
          ctx.fillStyle = `hsl(${hue}, 90%, 70%)`
          ctx.shadowColor = `hsl(${hue}, 90%, 70%)`
          ctx.shadowBlur = 10
          ctx.beginPath()
          ctx.arc(x, y, rand(1.5, 3.5), 0, TAU)
          ctx.fill()
          ctx.shadowBlur = 0
          ctx.globalAlpha = 1
        },
      })
    }
  }

  wave({ dur = 3 }) {
    const eng = this
    for (let i = 0; i < 3; i++) {
      this.add({
        dur: 1.6,
        t: -i * 0.5,
        draw(ctx, k) {
          const y = eng.h - ease(k) * eng.h * 0.55
          ctx.globalAlpha = (1 - k) * 0.5
          const g = ctx.createLinearGradient(0, y, 0, eng.h)
          g.addColorStop(0, 'rgba(55,199,255,0.9)')
          g.addColorStop(1, 'rgba(15,95,215,0)')
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.moveTo(0, y + 30)
          for (let x = 0; x <= eng.w; x += 24)
            ctx.lineTo(x, y + Math.sin(x * 0.02 + k * 9) * 16)
          ctx.lineTo(eng.w, eng.h)
          ctx.lineTo(0, eng.h)
          ctx.closePath()
          ctx.fill()
          ctx.globalAlpha = 1
          if (Math.random() < 0.5) eng.spark(rand(0, eng.w), y, { color: '#bfe9ff', speed: 120, g: 240 })
        },
      })
    }
  }

  /* ---- egg throw & splat ---- */
  egg({ x = 0.5, y = 0.4 }) {
    const eng = this
    const tx = x * this.w
    const ty = y * this.h
    const fromLeft = Math.random() < 0.5
    const x0 = fromLeft ? -30 : this.w + 30
    const y0 = this.h * 0.85
    this.add({
      dur: 0.55,
      draw(ctx, k) {
        const kk = ease(k)
        const ex = x0 + (tx - x0) * kk
        const ey = y0 + (ty - y0) * kk - Math.sin(kk * Math.PI) * eng.h * 0.25
        ctx.save()
        ctx.translate(ex, ey)
        ctx.rotate(k * 14)
        const g = ctx.createRadialGradient(-3, -5, 2, 0, 0, 14)
        g.addColorStop(0, '#fffdf5')
        g.addColorStop(1, '#e8dfc8')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.ellipse(0, 0, 10, 13, 0, 0, TAU)
        ctx.fill()
        ctx.restore()
        if (k > 0.98) {
          eng.splat(tx, ty)
        }
      },
    })
  }

  splat(x, y) {
    const eng = this
    // shell shards
    for (let i = 0; i < 6; i++)
      this.spark(x, y, { color: '#f6efdc', speed: 240, size: rand(2.5, 5), g: 420, dur: 0.8 })
    // SPLAT! flash + yolk with drips
    const lobes = Array.from({ length: 8 }, () => [rand(0, TAU), rand(14, 30)])
    const drips = Array.from({ length: 3 }, () => [rand(-22, 22), rand(30, 70), rand(4, 8)])
    this.add({
      dur: 2.4,
      draw(ctx, k) {
        const a = k < 0.75 ? 1 : (1 - k) / 0.25
        ctx.globalAlpha = a * 0.95
        // white splash
        ctx.fillStyle = 'rgba(250, 246, 232, 0.92)'
        for (const [ang, r] of lobes) {
          const grow = Math.min(1, k * 6)
          ctx.beginPath()
          ctx.arc(x + Math.cos(ang) * r * grow, y + Math.sin(ang) * r * grow * 0.7, 9 * grow, 0, TAU)
          ctx.fill()
        }
        // yolk
        const g = ctx.createRadialGradient(x - 4, y - 5, 2, x, y, 18)
        g.addColorStop(0, '#ffdf6b')
        g.addColorStop(1, '#f5a812')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, 17, 0, TAU)
        ctx.fill()
        // drips sliding down
        ctx.fillStyle = '#f5b022'
        for (const [dx, len, w] of drips) {
          const dy = Math.min(1, k * 1.4) * len
          ctx.beginPath()
          ctx.ellipse(x + dx, y + 10 + dy, w, w * 1.6, 0, 0, TAU)
          ctx.fill()
          ctx.fillRect(x + dx - w / 2, y + 8, w, dy)
        }
        // SPLAT text
        if (k < 0.3) {
          ctx.font = '900 26px system-ui'
          ctx.textAlign = 'center'
          ctx.fillStyle = '#ffd24d'
          ctx.strokeStyle = 'rgba(0,0,0,0.6)'
          ctx.lineWidth = 5
          ctx.strokeText('SPLAT!', x, y - 42)
          ctx.fillText('SPLAT!', x, y - 42)
        }
        ctx.globalAlpha = 1
      },
    })
  }

  /* ================= face-anchored AR effects ================= */
  setAnchorProvider(fn) {
    this.anchorProvider = fn
  }

  getAnchor() {
    const a = this.anchorProvider && this.anchorProvider()
    if (a) return a
    // fallback: center-stage (demo avatar) anchor
    const x = this.w / 2
    const y = this.h * 0.4
    return {
      x, y, w: 130,
      cheeks: [[x - 46, y + 12], [x + 46, y + 12]],
      forehead: [x, y - 58],
      nose: [x, y],
      mouth: [x, y + 34],
      found: false,
    }
  }

  kissMark(side = 0) {
    const eng = this
    const jx = rand(-10, 10)
    const jy = rand(-8, 8)
    this.add({
      dur: 1.8,
      draw(ctx, k) {
        const a = eng.getAnchor()
        const [cx, cy] = a.cheeks[side]
        ctx.globalAlpha = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85
        ctx.font = `${a.w * 0.28}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('💋', cx + jx, cy + jy)
        ctx.globalAlpha = 1
      },
    })
    this.burst(this.getAnchor().cheeks[side][0], this.getAnchor().cheeks[side][1], 6, {
      color: '#ff8fb8', speed: 90, g: -40, dur: 0.7,
    })
  }

  faceTeddy() {
    const eng = this
    let kisses = 0
    this.add({
      dur: 4.2,
      lastKiss: 0,
      draw(ctx, k) {
        const a = eng.getAnchor()
        const size = Math.max(54, a.w * 0.62)
        let x, y
        if (k < 0.22) {
          const kk = ease(k / 0.22)
          x = -60 + (a.cheeks[0][0] - -60) * kk
          y = eng.h * 0.75 + (a.cheeks[0][1] - eng.h * 0.75) * kk - Math.sin(kk * Math.PI) * 120
        } else {
          const side = Math.floor((k - 0.22) / 0.26) % 2
          const [cx, cy] = a.cheeks[side]
          x = cx + Math.sin(k * 40) * 3
          y = cy + Math.cos(k * 34) * 3
          if (k - this.lastKiss > 0.24) {
            this.lastKiss = k
            eng.kissMark(side)
            kisses++
            if (kisses % 2 === 0) eng.spark(cx, cy - 20, { color: '#ff8fb8', speed: 70, g: -60 })
          }
        }
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(Math.sin(k * 26) * 0.16)
        ctx.font = `${size}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = 'rgba(255,143,184,0.9)'
        ctx.shadowBlur = 24
        ctx.globalAlpha = k > 0.92 ? (1 - k) / 0.08 : 1
        ctx.fillText('🧸', 0, 0)
        ctx.restore()
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
      },
    })
  }

  faceKiss() {
    for (let i = 0; i < 3; i++) setTimeout(() => this.kissMark(i % 2), i * 480)
  }

  faceEgg() {
    const eng = this
    this.add({
      dur: 0.5,
      draw(ctx, k) {
        const a = eng.getAnchor()
        const [tx, ty] = a.forehead
        const kk = ease(k)
        const x = eng.w + 30 - (eng.w + 30 - tx) * kk
        const y = eng.h * 0.8 - (eng.h * 0.8 - ty) * kk - Math.sin(kk * Math.PI) * eng.h * 0.2
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(k * 12)
        ctx.fillStyle = '#f6efdc'
        ctx.beginPath()
        ctx.ellipse(0, 0, 10, 13, 0, 0, TAU)
        ctx.fill()
        ctx.restore()
        if (k > 0.97) eng.splatAnchored()
      },
    })
  }

  splatAnchored() {
    const eng = this
    const lobes = Array.from({ length: 8 }, () => [rand(0, TAU), rand(0.12, 0.3)])
    const drips = Array.from({ length: 3 }, () => [rand(-0.2, 0.2), rand(0.3, 0.6), rand(3, 6)])
    const a0 = this.getAnchor()
    this.burst(a0.forehead[0], a0.forehead[1], 8, { color: '#f6efdc', speed: 200, g: 380, dur: 0.7 })
    this.add({
      dur: 2.6,
      draw(ctx, k) {
        const a = eng.getAnchor()
        const [x, y] = a.forehead
        const R = a.w
        const al = k < 0.75 ? 1 : (1 - k) / 0.25
        ctx.globalAlpha = al * 0.95
        ctx.fillStyle = 'rgba(250,246,232,0.92)'
        const grow = Math.min(1, k * 6)
        for (const [ang, rr] of lobes) {
          ctx.beginPath()
          ctx.arc(x + Math.cos(ang) * rr * R * grow, y + Math.sin(ang) * rr * R * grow * 0.7, R * 0.09 * grow, 0, TAU)
          ctx.fill()
        }
        const g = ctx.createRadialGradient(x - 3, y - 4, 2, x, y, R * 0.17)
        g.addColorStop(0, '#ffdf6b')
        g.addColorStop(1, '#f5a812')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, R * 0.16, 0, TAU)
        ctx.fill()
        ctx.fillStyle = '#f5b022'
        for (const [dx, len, w] of drips) {
          const dy = Math.min(1, k * 1.3) * len * R
          ctx.fillRect(x + dx * R - w / 2, y + R * 0.08, w, dy)
          ctx.beginPath()
          ctx.ellipse(x + dx * R, y + R * 0.08 + dy, w, w * 1.5, 0, 0, TAU)
          ctx.fill()
        }
        if (k < 0.25) {
          ctx.font = '900 24px system-ui'
          ctx.textAlign = 'center'
          ctx.fillStyle = '#ffd24d'
          ctx.strokeStyle = 'rgba(0,0,0,0.6)'
          ctx.lineWidth = 5
          ctx.strokeText('SPLAT!', x, y - R * 0.5)
          ctx.fillText('SPLAT!', x, y - R * 0.5)
        }
        ctx.globalAlpha = 1
      },
    })
  }

  faceCrown() {
    const eng = this
    this.add({
      dur: 3.6,
      draw(ctx, k) {
        const a = eng.getAnchor()
        const size = Math.max(60, a.w * 0.8)
        const ty = a.forehead[1] - a.w * 0.32
        const y = k < 0.25 ? -80 + (ty - -80) * ease(k / 0.25) : ty + Math.sin(k * 20) * 2
        ctx.globalAlpha = k > 0.9 ? (1 - k) / 0.1 : 1
        ctx.font = `${size}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = 'rgba(255,210,77,1)'
        ctx.shadowBlur = 30
        ctx.fillText('👑', a.forehead[0], y)
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1
        if (k > 0.25 && Math.random() < 0.35)
          eng.spark(a.forehead[0] + rand(-size / 2, size / 2), y, { speed: 70, g: -30, dur: 0.6 })
      },
    })
  }

  faceClown() {
    const eng = this
    this.add({
      dur: 2.6,
      draw(ctx, k) {
        const a = eng.getAnchor()
        const r = Math.max(12, a.w * 0.14)
        const s = k < 0.12 ? ease(k / 0.12) * 1.5 : k < 0.24 ? 1.5 - ((k - 0.12) / 0.12) * 0.5 : 1
        ctx.globalAlpha = k > 0.85 ? (1 - k) / 0.15 : 1
        const g = ctx.createRadialGradient(a.nose[0] - r * 0.3, a.nose[1] - r * 0.3, r * 0.15, a.nose[0], a.nose[1], r * s)
        g.addColorStop(0, '#ff7b7b')
        g.addColorStop(1, '#d40f0f')
        ctx.fillStyle = g
        ctx.shadowColor = 'rgba(255,60,60,0.8)'
        ctx.shadowBlur = 16
        ctx.beginPath()
        ctx.arc(a.nose[0], a.nose[1], r * s, 0, TAU)
        ctx.fill()
        ctx.shadowBlur = 0
        if (k < 0.3) {
          ctx.font = '900 22px system-ui'
          ctx.textAlign = 'center'
          ctx.fillStyle = '#fff'
          ctx.strokeStyle = 'rgba(0,0,0,0.6)'
          ctx.lineWidth = 4
          ctx.strokeText('HONK HONK! 🤡', a.nose[0], a.nose[1] - a.w * 0.55)
          ctx.fillText('HONK HONK! 🤡', a.nose[0], a.nose[1] - a.w * 0.55)
        }
        ctx.globalAlpha = 1
      },
    })
  }

  /* ================= branded supercars ================= */
  carRun(brand, count = 1) {
    const spec = CARS[brand] || CARS.lambo
    const runs = count >= 99 ? 3 : count >= 10 ? 2 : 1
    for (let i = 0; i < runs; i++) this.carOne(spec, i * 0.5, i)
    if (spec.price >= 20000) this.beams({ color: spec.beam || '255, 210, 77', dur: 3 })
  }

  carOne(spec, delay, lane) {
    const eng = this
    const baseY = this.h * (0.58 + lane * 0.13)
    const L = Math.min(300, this.w * 0.62)
    const H = L * 0.3
    this.add({
      dur: 3.4,
      t: -delay,
      wheelA: 0,
      draw(ctx, k, dt) {
        const kk = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2 // easeInOut
        const x = -L + kk * (eng.w + 2 * L)
        const y = baseY + Math.sin(k * 40) * 1.6
        this.wheelA += dt * 22
        // speed lines
        ctx.globalAlpha = 0.28
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        for (let i = 0; i < 5; i++) {
          const ly = baseY - H + ((i * 37) % (H * 1.4))
          ctx.beginPath()
          ctx.moveTo(x - L * 0.6 - i * 26, ly)
          ctx.lineTo(x - L * 0.95 - i * 26, ly)
          ctx.stroke()
        }
        ctx.globalAlpha = 1
        drawCar(ctx, spec, x, y, L, H, this.wheelA)
        // exhaust flames
        if (Math.random() < 0.8)
          eng.spark(x - L * 0.52, y - H * 0.18, { color: `hsl(${rand(15, 45)},100%,60%)`, speed: 100, vx: -140, g: -30, dur: 0.5 })
        // brand name with chrome shine sweep
        const bx = x
        const by = y - H - 26
        ctx.font = `italic 900 ${Math.max(20, L * 0.09)}px system-ui`
        ctx.textAlign = 'center'
        const grad = ctx.createLinearGradient(bx - 120 + ((k * 3) % 1) * 240, by, bx + 120, by)
        grad.addColorStop(0, '#cfd8e6')
        grad.addColorStop(0.5, '#ffffff')
        grad.addColorStop(1, '#8f9bb0')
        ctx.strokeStyle = 'rgba(0,0,0,0.65)'
        ctx.lineWidth = 5
        ctx.strokeText(spec.name, bx, by)
        ctx.fillStyle = grad
        ctx.fillText(spec.name, bx, by)
      },
    })
  }
}

/* ---- stylized car painter (side view, nose pointing right) ---- */
function drawCar(ctx, spec, cx, cy, L, H, wheelA) {
  const x0 = cx - L / 2
  const y0 = cy - H
  const P = (px, py) => [x0 + px * L, y0 + py * H]
  ctx.save()
  // neon underglow
  ctx.fillStyle = spec.glow
  ctx.shadowColor = spec.glow
  ctx.shadowBlur = 30
  ctx.beginPath()
  ctx.ellipse(cx, cy + 6, L * 0.46, 10, 0, 0, TAU)
  ctx.fill()
  ctx.shadowBlur = 0
  // body
  const grad = ctx.createLinearGradient(0, y0, 0, cy)
  grad.addColorStop(0, spec.colors[0])
  grad.addColorStop(1, spec.colors[1])
  ctx.fillStyle = grad
  ctx.beginPath()
  const body = spec.body
  body.forEach(([px, py], i) => {
    const [x, y] = P(px, py)
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
  })
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'
  ctx.lineWidth = 1.5
  ctx.stroke()
  // glass
  ctx.fillStyle = 'rgba(150, 210, 255, 0.85)'
  ctx.beginPath()
  spec.glass.forEach(([px, py], i) => {
    const [x, y] = P(px, py)
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
  })
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.fillRect(...P(spec.glass[0][0] + 0.02, spec.glass[0][1] + 0.04), L * 0.05, 2)
  // headlight beam
  const [hx, hy] = P(0.99, 0.6)
  const beam = ctx.createLinearGradient(hx, hy, hx + L * 0.9, hy)
  beam.addColorStop(0, 'rgba(255,255,220,0.5)')
  beam.addColorStop(1, 'rgba(255,255,220,0)')
  ctx.fillStyle = beam
  ctx.beginPath()
  ctx.moveTo(hx, hy - 3)
  ctx.lineTo(hx + L * 0.9, hy - H * 0.5)
  ctx.lineTo(hx + L * 0.9, hy + H * 0.5)
  ctx.lineTo(hx, hy + 5)
  ctx.closePath()
  ctx.fill()
  // taillight
  ctx.fillStyle = '#ff2d2d'
  ctx.shadowColor = '#ff2d2d'
  ctx.shadowBlur = 12
  ctx.fillRect(...P(0.005, 0.52), 4, H * 0.14)
  ctx.shadowBlur = 0
  // wheels
  for (const wx of spec.wheels) {
    const [cxw, cyw] = P(wx, 1)
    ctx.fillStyle = '#0c0c12'
    ctx.beginPath()
    ctx.arc(cxw, cyw, H * 0.34, 0, TAU)
    ctx.fill()
    const rim = ctx.createRadialGradient(cxw, cyw, 1, cxw, cyw, H * 0.2)
    rim.addColorStop(0, '#f2f5fa')
    rim.addColorStop(1, '#7d8798')
    ctx.fillStyle = rim
    ctx.beginPath()
    ctx.arc(cxw, cyw, H * 0.2, 0, TAU)
    ctx.fill()
    ctx.strokeStyle = '#39404d'
    ctx.lineWidth = 2
    for (let sp = 0; sp < 5; sp++) {
      const a = wheelA + (sp * TAU) / 5
      ctx.beginPath()
      ctx.moveTo(cxw, cyw)
      ctx.lineTo(cxw + Math.cos(a) * H * 0.19, cyw + Math.sin(a) * H * 0.19)
      ctx.stroke()
    }
  }
  ctx.restore()
}

export const CARS = {
  lambo: {
    name: 'LAMBORGHINI', price: 25888,
    colors: ['#ffe066', '#ff9a00'], glow: 'rgba(255, 210, 77, 0.55)', beam: '255, 210, 77',
    body: [[0.02, 0.72], [0.05, 0.5], [0.3, 0.42], [0.42, 0.16], [0.68, 0.14], [0.84, 0.38], [0.98, 0.5], [1, 0.68], [0.97, 0.86], [0.85, 0.88], [0.75, 0.86], [0.28, 0.86], [0.16, 0.88], [0.04, 0.86]],
    glass: [[0.43, 0.22], [0.66, 0.2], [0.74, 0.4], [0.38, 0.44]],
    wheels: [0.22, 0.8],
  },
  ferrari: {
    name: 'FERRARI', price: 18888,
    colors: ['#ff4040', '#a30000'], glow: 'rgba(255, 60, 60, 0.55)', beam: '255, 90, 90',
    body: [[0.02, 0.7], [0.06, 0.48], [0.28, 0.4], [0.4, 0.18], [0.64, 0.16], [0.82, 0.4], [0.98, 0.52], [1, 0.7], [0.96, 0.86], [0.84, 0.88], [0.74, 0.86], [0.28, 0.86], [0.17, 0.88], [0.04, 0.86]],
    glass: [[0.41, 0.24], [0.62, 0.22], [0.7, 0.4], [0.36, 0.44]],
    wheels: [0.21, 0.79],
  },
  mercedes: {
    name: 'MERCEDES-BENZ', price: 8888,
    colors: ['#f2f6fb', '#9aa7b5'], glow: 'rgba(0, 212, 255, 0.5)', beam: '160, 220, 255',
    body: [[0.02, 0.66], [0.06, 0.46], [0.24, 0.42], [0.34, 0.2], [0.7, 0.18], [0.82, 0.42], [0.98, 0.48], [1, 0.66], [0.97, 0.84], [0.86, 0.86], [0.76, 0.84], [0.26, 0.84], [0.15, 0.86], [0.04, 0.84]],
    glass: [[0.36, 0.26], [0.67, 0.24], [0.76, 0.42], [0.3, 0.44]],
    wheels: [0.2, 0.8],
  },
  rolls: {
    name: 'ROLLS-ROYCE', price: 58888,
    colors: ['#2b2b3a', '#0d0d16'], glow: 'rgba(255, 255, 255, 0.45)', beam: '235, 235, 255',
    body: [[0.02, 0.6], [0.04, 0.4], [0.3, 0.38], [0.38, 0.18], [0.72, 0.16], [0.8, 0.38], [0.99, 0.42], [1, 0.62], [0.97, 0.84], [0.87, 0.86], [0.77, 0.84], [0.27, 0.84], [0.16, 0.86], [0.04, 0.84]],
    glass: [[0.4, 0.24], [0.69, 0.22], [0.76, 0.38], [0.34, 0.4]],
    wheels: [0.21, 0.81],
  },
  bugatti: {
    name: 'BUGATTI', price: 128888,
    colors: ['#3d6bff', '#0a1f66'], glow: 'rgba(80, 130, 255, 0.6)', beam: '120, 160, 255',
    body: [[0.02, 0.74], [0.05, 0.5], [0.26, 0.4], [0.4, 0.16], [0.66, 0.14], [0.86, 0.4], [0.98, 0.52], [1, 0.7], [0.96, 0.86], [0.84, 0.88], [0.74, 0.86], [0.28, 0.86], [0.17, 0.88], [0.04, 0.86]],
    glass: [[0.42, 0.22], [0.64, 0.2], [0.73, 0.4], [0.36, 0.44]],
    wheels: [0.22, 0.8],
  },
}

Object.assign(FxEngine.prototype, {
  /* ---- orchestrated gift effect by spec ---- */
  playGift(d) {
    const count = Math.min(99, d.count || 1)
    const flights = count >= 99 ? 5 : count >= 10 ? 3 : 1
    if (d.fx && d.fx.startsWith('car:')) {
      this.carRun(d.fx.slice(4), count)
      return
    }
    if (d.fx && d.fx.startsWith('face-')) {
      const face = d.fx.slice(5)
      if (face === 'teddy') this.faceTeddy()
      else if (face === 'kiss') this.faceKiss()
      else if (face === 'egg') this.faceEgg()
      else if (face === 'crown') this.faceCrown()
      else if (face === 'clown') this.faceClown()
      if (count > 1) this.burst(this.w / 2, this.h * 0.45, 18, { color: '#ff8fb8' })
      return
    }
    if (d.fx === 'royalcat') {
      // 3D model takeover is rendered by RoyalCatFx; canvas adds royal ambience
      this.beams({ color: '255, 210, 77', dur: 5 })
      this.fireworks({ bursts: 5, dur: 3.5 })
      this.coinRain({ n: 30 })
      return
    }
    if (d.fx === 'luckyrain') {
      this.coinRain({ n: 44 })
      return
    }
    if (d.fx === 'mystery') {
      this.zoom({ emoji: '🎁', dur: 1.6, size: 150 })
      setTimeout(() => {
        const roll = Math.random()
        if (roll < 0.3) this.carRun(['lambo', 'ferrari', 'rolls', 'bugatti'][Math.floor(Math.random() * 4)])
        else if (roll < 0.55) this.dragon({ emoji: '🐉', golden: Math.random() < 0.5 })
        else if (roll < 0.8) {
          this.fireworks({ bursts: 4 })
          this.coinRain({ n: 26 })
        } else this.lightning({})
      }, 1500)
      return
    }
    if (d.fx === 'universe') {
      this.beams({ dur: 5 })
      this.fireworks({ bursts: 7, dur: 4 })
      this.swirl({ dur: 4.5 })
      this.coinRain({ n: 40 })
      this.lightning({})
      this.zoom({ emoji: d.emoji, dur: 5, size: 210 })
      setTimeout(() => this.dragon({ emoji: '🐲', golden: true }), 1500)
      return
    }
    if (d.fx === 'dragon') {
      this.beams({ color: '255, 140, 40' })
      this.dragon({ emoji: d.emoji, golden: d.id === 'goldendragon' || d.id === 'dragonemperor' })
      if (count > 1) this.dragon({ emoji: d.emoji, golden: d.id === 'goldendragon', dur: 4.9 })
      return
    }
    if (d.fx === 'lightning') {
      this.lightning({})
      this.zoom({ emoji: d.emoji, size: 200 })
      this.beams({ color: '127, 212, 255' })
      return
    }
    if (d.fx === 'swirl') {
      this.swirl({})
      this.zoom({ emoji: d.emoji, size: 180 })
      return
    }
    if (d.fx === 'wave') {
      this.wave({})
      this.flight({ emoji: d.emoji, size: 150, dur: 3 })
      this.beams({ color: '55, 199, 255' })
      return
    }
    if (d.cost >= 10000) {
      this.beams({})
      this.fireworks({ bursts: 5 })
      this.zoom({ emoji: d.emoji })
      this.coinRain({ n: 24 })
      return
    }
    if (d.cost >= 1000) {
      this.beams({ dur: 2.6 })
      for (let i = 0; i < flights; i++)
        this.flight({ emoji: d.emoji, size: 120, count: i === 0 ? count : 1, delay: i * 0.35 })
      this.burst(this.w / 2, this.h * 0.4, 22)
      return
    }
    for (let i = 0; i < flights; i++)
      this.flight({ emoji: d.emoji, size: 74, count: i === 0 ? count : 1, delay: i * 0.3, dur: 2.2 })
  },
})
