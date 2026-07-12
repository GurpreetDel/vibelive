import { useEffect, useRef } from 'react'
import SVGA from 'svgaplayerweb'
import { FxEngine } from '../lib/fx.js'

/* Full-room effects layer: canvas particle engine + SVGA gift-animation player.
   Listens for 'vibe-fx' events dispatched by playGiftFx / playEggFx. */
export default function FxCanvas() {
  const canvasRef = useRef(null)
  const svgaHostRef = useRef(null)

  useEffect(() => {
    const engine = new FxEngine(canvasRef.current)
    const host = svgaHostRef.current
    let player = null
    let parser = null
    const cache = new Map()
    let disposed = false

    try {
      player = new SVGA.Player(host)
      player.loops = 1
      player.clearsAfterStop = true
      player.setContentMode('AspectFit')
      player.onFinished(() => host.classList.remove('on'))
      parser = new SVGA.Parser()
    } catch { player = null }

    const playSvga = (url, fallback) => {
      if (!player) return fallback()
      const start = (item) => {
        if (disposed) return
        host.classList.add('on')
        player.setVideoItem(item)
        player.startAnimation()
        setTimeout(() => host.classList.remove('on'), 6000) // safety
      }
      if (cache.has(url)) return start(cache.get(url))
      parser.load(
        url,
        (item) => {
          cache.set(url, item)
          start(item)
        },
        fallback
      )
    }

    const onFx = (e) => {
      const d = e.detail
      if (d.kind === 'egg') {
        engine.egg(d)
      } else if (d.kind === 'gift') {
        if (d.svga) {
          playSvga(d.svga, () => engine.playGift(d))
          // sparkle support under the SVGA animation
          engine.burst(engine.w / 2, engine.h * 0.5, 18)
          if (d.count > 1) engine.flight({ emoji: d.emoji, size: 64, count: d.count, dur: 2.2 })
        } else {
          engine.playGift(d)
        }
      }
    }

    window.addEventListener('vibe-fx', onFx)
    return () => {
      disposed = true
      window.removeEventListener('vibe-fx', onFx)
      try { player && player.clear() } catch { /* noop */ }
      engine.destroy()
    }
  }, [])

  return (
    <div className="fx-layer" aria-hidden="true">
      <canvas ref={canvasRef} className="fx-canvas" />
      <div ref={svgaHostRef} className="svga-host" />
    </div>
  )
}
