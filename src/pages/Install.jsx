import { useEffect, useState } from 'react'

export default function Install() {
  const [installable, setInstallable] = useState(!!window.__vibeInstallPrompt)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const on = () => setInstallable(true)
    window.addEventListener('vibe-installable', on)
    return () => window.removeEventListener('vibe-installable', on)
  }, [])

  const install = async () => {
    const p = window.__vibeInstallPrompt
    if (!p) return
    p.prompt()
    const { outcome } = await p.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
      window.__vibeInstallPrompt = null
      setInstallable(false)
    }
  }

  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&bgcolor=0b0614&color=ff2d78&data=${encodeURIComponent(location.origin)}`

  return (
    <div className="install">
      <h1>📱 Get VibeLive on your phone</h1>
      <p>
        VibeLive is a <b>Progressive Web App</b> — it installs straight from the browser like a real app.
        Full-screen, its own icon, works offline. No Play Store or App Store needed.
      </p>

      {installed && <p className="install-done">🎉 Installed! Check your home screen.</p>}
      {installable && !installed && (
        <button className="btn-primary btn-big" onClick={install}>
          ⬇️ Install VibeLive now
        </button>
      )}

      <div className="install-qr">
        <img src={qr} alt="QR code to open VibeLive" width="220" height="220" loading="lazy" />
        <p>Scan with your phone camera to open VibeLive</p>
      </div>

      <div className="install-cards">
        <div className="install-card">
          <h3>🤖 Android (Chrome)</h3>
          <ol>
            <li>Open this site in <b>Chrome</b> on your phone</li>
            <li>Tap the <b>⋮ menu</b> (top right)</li>
            <li>Tap <b>“Add to Home screen”</b> → <b>Install</b></li>
            <li>Launch <b>VibeLive</b> from your home screen 🚀</li>
          </ol>
        </div>
        <div className="install-card">
          <h3>🍎 iPhone (Safari)</h3>
          <ol>
            <li>Open this site in <b>Safari</b></li>
            <li>Tap the <b>Share</b> button (square with ↑)</li>
            <li>Scroll and tap <b>“Add to Home Screen”</b></li>
            <li>Tap <b>Add</b> — done! 🚀</li>
          </ol>
        </div>
      </div>

      <p className="privacy-link">
        <a href="#/privacy">Privacy Policy</a>
      </p>

      <div className="install-card install-tip">
        <h3>💡 Try this</h3>
        <p>
          Open <b>Go Live</b> on your laptop, then install the app on your phone and enter the room code —
          you'll watch your own live stream on mobile, with chat, hearts and gifts flying in real time.
        </p>
      </div>
    </div>
  )
}
