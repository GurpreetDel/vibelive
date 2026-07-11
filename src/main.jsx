import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(<App />)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  window.__vibeInstallPrompt = e
  window.dispatchEvent(new Event('vibe-installable'))
})
