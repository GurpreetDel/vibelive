export default function Privacy() {
  return (
    <div className="install privacy">
      <h1>Privacy Policy</h1>
      <p className="privacy-date">Effective: 11 July 2026 · App: VibeLive</p>

      <div className="install-card">
        <h3>Camera & Microphone</h3>
        <p>
          VibeLive uses your camera and microphone <b>only while you broadcast</b> ("Go Live"). Video and
          audio stream <b>peer-to-peer (WebRTC)</b> directly from your device to your viewers. We do not
          record, store, or upload your streams to any server.
        </p>
      </div>

      <div className="install-card">
        <h3>Data we store</h3>
        <p>
          Your display name and demo diamond balance are stored <b>only on your own device</b>
          (browser localStorage). VibeLive has no user accounts, no databases, and collects no personal
          information. Chat messages, hearts and gifts travel over encrypted WebRTC data channels between
          participants and vanish when the room closes.
        </p>
      </div>

      <div className="install-card">
        <h3>Third-party services</h3>
        <p>
          <b>PeerJS cloud broker</b> is used only to negotiate peer connections (it sees connection
          metadata, never your media). <b>Vercel</b> hosts the app and may log standard web requests.
          The QR code on the Get App page is rendered by <b>qrserver.com</b>. None of these receive your
          streams or chats.
        </p>
      </div>

      <div className="install-card">
        <h3>Children</h3>
        <p>VibeLive is not directed at children under 13 and does not knowingly collect data from anyone.</p>
      </div>

      <div className="install-card">
        <h3>Contact</h3>
        <p>Questions? Email <b>gurpreetkaurchadhafan@gmail.com</b>.</p>
      </div>

      <a className="setup-back" href="#/">← Back to VibeLive</a>
    </div>
  )
}
