import { useSyncExternalStore } from 'react'

const KEY = 'vibelive-diamonds'
const listeners = new Set()

function read() {
  const v = Number(localStorage.getItem(KEY))
  return Number.isFinite(v) && localStorage.getItem(KEY) !== null ? v : 500
}

function write(v) {
  localStorage.setItem(KEY, String(Math.max(0, Math.round(v))))
  listeners.forEach((l) => l())
}

export const getDiamonds = read
export const spendDiamonds = (n) => write(read() - n)
export const topUpDiamonds = (n = 1000) => write(read() + n)

export function useDiamonds() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    read
  )
}
