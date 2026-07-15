import { useEffect, useRef, useState } from 'react'

/* Royal Cat 3D gift takeover — renders the real Royal Cat GLB model
   (public/models/royal-cat.glb) full-screen with Google's <model-viewer>
   web component (loaded once from CDN). Listens for 'vibe-fx' gift events
   with fx:'royalcat'; falls back to an animated crown-cat emoji if the
   CDN or model fails. Canvas ambience (beams/fireworks/coin rain) comes
   from FxEngine.playGift in lib/fx.js. */

let mvLoading = null
function loadModelViewer() {
  if (customElements.get('model-viewer')) return Promise.resolve(true)
  if (mvLoading) return mvLoading
  mvLoading = new Promise((resolve) => {
    const s = document.createElement('script')
    s.type = 'module'
    s.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.head.appendChild(s)
  })
  return mvLoading
}

export default function RoyalCatFx() {
  const [show, setShow] = useState(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const hideT = useRef(0)

  useEffect(() => {
    let alive = true
    // warm up: load the web component + model so the first send is instant
    loadModelViewer().then((ok) => { if (alive) (ok ? setReady(true) : setFailed(true)) })
    fetch('/models/royal-cat.glb').catch(() => {})

    const onFx = (e) => {
      const d = e.detail
      if (d.kind !== 'gift' || d.fx !== 'royalcat') return
      clearTimeout(hideT.current)
      setShow({ count: d.count || 1, from: d.from || '', key: Date.now() })
      hideT.current = setTimeout(() => setShow(null), 6500)
    }
    window.addEventListener('vibe-fx', onFx)
    return () => {
      alive = false
      clearTimeout(hideT.current)
      window.removeEventListener('vibe-fx', onFx)
    }
  }, [])

  if (!show) return null
  return (
    <div className="royalcat-fx" key={show.key}>
      <div className="royalcat-stage">
        {ready && !failed ? (
          <model-viewer
            src="/models/royal-cat.glb"
            alt="Royal Cat"
            auto-rotate
            rotation-per-second="80deg"
            disable-zoom
            interaction-prompt="none"
            shadow-intensity="1"
            exposure="1.2"
            autoplay
            style={{ width: '100%', height: '100%', background: 'transparent' }}
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="royalcat-fallback">🐱</div>
        )}
        <div className="royalcat-crown">👑</div>
      </div>
      <div className="royalcat-title">
        ROYAL CAT{show.count > 1 ? ` ×${show.count}` : ''}
        {show.from ? <span className="royalcat-from">from {show.from}</span> : null}
      </div>
    </div>
  )
}
