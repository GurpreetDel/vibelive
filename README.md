# VibeLive 🔴 — Go Live. Get Famous.

A Bigo Live–style live streaming web app **and installable mobile app (PWA)** — built with React + Vite, deployed on Vercel.

## Features

- 🏠 **Discover feed** — Bigo-style grid of live rooms with viewer counts, levels, country flags and category chips
- 📹 **Go Live** — real camera + mic broadcasting from your browser (WebRTC via PeerJS), with a shareable 6-letter room code
- 👀 **Watch** — join any live room by code from any device; video, chat, hearts and gifts arrive in real time
- 💬 **Live chat** — star-topology chat relayed through the broadcaster
- ❤️ **Floating hearts** and 🎁 **animated gifts** (Rose → Crown) with a 💎 diamond balance
- 📱 **Mobile app via PWA** — installs from the browser (Add to Home Screen), full-screen with its own icon, offline shell via service worker. No app store needed.

## How the streaming works

The broadcaster's browser captures camera/mic with `getUserMedia` and streams peer-to-peer (WebRTC) to each viewer. Signaling uses the free public PeerJS cloud broker; chat/hearts/gifts ride on WebRTC data channels relayed by the host.

> This is a P2P demo architecture — great for a handful of viewers per room. A production Bigo-scale app would swap the P2P layer for an SFU service (LiveKit, Agora, Mux) without changing the UI.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Static Vite build — auto-detected by Vercel:

```bash
vercel --prod
```

## Install on your phone

Open the deployed site → **Get App** tab → follow the Android/iPhone steps (Add to Home Screen). Or scan the QR code on that page.
