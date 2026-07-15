import { useEffect, useRef } from 'react'
import SVGA from 'svgaplayerweb'
import { FxEngine } from '../lib/fx.js'
import { FaceTracker, faceAnchor } from '../lib/face.js'
import RoyalCatFx from './RoyalCatFx.jsx'

/* Full-room effects layer: canvas particle engine + SVGA gift-animation player
   + AR face tracking for face-anchored gifts (teddy kiss, crown, egg, clown).
   Listens for 'vibe-fx' events dispatched by playGiftFx / playEggFx. */
export default function FxCanvas() {
  const canvasRef = useRef(null)
  const svgaHostRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const engine = new FxEngine(canvas)
    const host = svgaHostRef.current
    let player = null
    let parser = null
    let tracker = null
    const cache = new Map()
    let disposed = false

    const room = canvas.closest('.room')
    const video = room && room.querySelector('.room-video')
    const mirrored = !!(room && room.classList.contains('room-host'))

    if (video) {
      engine.setAnchorProvider(() => faceAnchor(tracker, video, engine.w, engine.h, mirrored))
    }

    const ensureTracker = () => {
      if (video && !tracker && !disposed) {
        tracker = new FaceTracker(video)
        tracker.start()
      }
    }

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
        setTimeout(() => host.classList.remove('on'), 6000)
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
        if (d.fx && d.fx.startsWith('face-')) ensureTracker()
        if (d.svga) {
          playSvga(d.svga, () => engine.playGift(d))
          engine.burst(engine.w / 2, engine.h * 0.5, 18)
          if (d.count > 1) engine.flight({ emoji: d.emoji, size: 64, count: d.count, dur: 2.2 })
        } else {
          engine.playGift(d)
        }
      }
    }

    // warm up face tracking shortly after entering a room with video (broadcast/watch)
    const warm = video ? setTimeout(ensureTracker, 2500) : 0

    window.addEventListener('vibe-fx', onFx)
    return () => {
      disposed = true
      clearTimeout(warm)
      window.removeEventListener('vibe-fx', onFx)
      try { player && player.clear() } catch { /* noop */ }
      tracker && tracker.stop()
      engine.destroy()
    }
  }, [])

  return (
    <div className="fx-layer" aria-hidden="true">
      <canvas ref={canvasRef} className="fx-canvas" />
      <div ref={svgaHostRef} className="svga-host" />
      <RoyalCatFx />
    </div>
  )
}
