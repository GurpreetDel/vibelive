import { useEffect, useRef, useState } from 'react'
import { GAMES, BACKPACK } from '../data/items.js'
import { useStore, spendCoins, addCoins, grantItem, getState } from '../lib/store.js'
import { fmt } from '../lib/util.js'
import { PageHead } from './Backpack.jsx'

export default function Games({ game }) {
  if (game === 'luckycat') return <LuckyCat />
  if (game === 'greedy') return <Greedy />
  if (game === 'soccer') return <Soccer />
  if (game === 'fishing') return <Fishing />
  if (game === 'rocket') return <Rocket />
  return <Lobby />
}

function Lobby() {
  const s = useStore()
  return (
    <div className="page">
      <PageHead title="🎮 Games Lobby" sub={`Balance 🪙 ${fmt(s.coins)} · win coins & rare items`} back="#/" />
      <div className="games-grid">
        {GAMES.map((g) => (
          <a
            key={g.id}
            className="game-card"
            href={`#/games/${g.id}`}
            style={{ background: `linear-gradient(135deg, ${g.grad[0]}, ${g.grad[1]})` }}
          >
            <span className="game-emoji">{g.emoji}</span>
            <b>{g.name}</b>
            <span className="game-tag">{g.tag}</span>
            <small>{g.desc}</small>
          </a>
        ))}
      </div>
      <p className="disclaimer">
        All games use demo coins — recharge or win more anytime. Check <a href="#/activity">📅 Activities</a> for
        bonus days!
      </p>
    </div>
  )
}

function GameShell({ title, children }) {
  const s = useStore()
  return (
    <div className="page game-page">
      <PageHead title={title} sub={`Balance 🪙 ${fmt(s.coins)}`} back="#/games" />
      {children}
    </div>
  )
}

/* ---------------- Lucky Cat ---------------- */
const CAT_TIERS = [
  { cost: 10, name: 'Basic Draw', rewards: [[0, 30], [5, 35], [15, 20], [30, 10], [100, 5]] },
  { cost: 100, name: 'Deluxe Draw', rewards: [[20, 30], [60, 30], [150, 25], [400, 12], [1500, 3]] },
  { cost: 500, name: 'Royal Draw', rewards: [[100, 28], [350, 30], [800, 25], [2500, 13], [8000, 4]] },
]

function LuckyCat() {
  const [shaking, setShaking] = useState(false)
  const [result, setResult] = useState(null)

  const draw = (tier) => {
    if (shaking || !spendCoins(tier.cost)) return
    setShaking(true)
    setResult(null)
    setTimeout(() => {
      // Royal tier: 5% chance of a backpack item drop instead of coins
      if (tier.cost === 500 && Math.random() < 0.05) {
        const owned = getState().inventory
        const candidates = BACKPACK.filter((i) => !owned.includes(i.id) && i.cost > 0)
        if (candidates.length) {
          const item = candidates[Math.floor(Math.random() * candidates.length)]
          grantItem(item.id)
          setResult({ item })
          setShaking(false)
          return
        }
      }
      const total = tier.rewards.reduce((a, [, w]) => a + w, 0)
      let r = Math.random() * total
      let win = 0
      for (const [amt, w] of tier.rewards) {
        r -= w
        if (r <= 0) { win = amt; break }
      }
      if (win > 0) addCoins(win)
      setResult({ win, cost: tier.cost })
      setShaking(false)
    }, 1300)
  }

  return (
    <GameShell title="🐱 Lucky Cat">
      <div className={shaking ? 'cat shake' : 'cat'}>🐱</div>
      {result && (
        <div className="game-result">
          {result.item
            ? <>🎁 JACKPOT! You won <b>{result.item.emoji} {result.item.name}</b> — check your Backpack!</>
            : result.win > result.cost
              ? <>🎉 You won <b>🪙 {fmt(result.win)}</b>!</>
              : result.win > 0
                ? <>You got 🪙 {result.win} back — try again!</>
                : <>😿 Empty paw… the cat keeps your coins. Again?</>}
        </div>
      )}
      <div className="game-actions">
        {CAT_TIERS.map((t) => (
          <button key={t.cost} className="btn-primary game-btn" disabled={shaking} onClick={() => draw(t)}>
            {t.name}<small>🪙 {t.cost}</small>
          </button>
        ))}
      </div>
      <p className="disclaimer">Royal Draw has a rare chance to drop backpack items — cars, frames, even the Dragon Ride!</p>
    </GameShell>
  )
}

/* ---------------- Greedy ---------------- */
const GREEDY_ITEMS = [
  { e: '🍇', name: 'Grapes', m: 5, w: 26 },
  { e: '🍔', name: 'Burger', m: 5, w: 26 },
  { e: '🍰', name: 'Cake', m: 10, w: 16 },
  { e: '🍗', name: 'Chicken', m: 15, w: 11 },
  { e: '🍾', name: 'Champagne', m: 20, w: 8 },
  { e: '🦞', name: 'Lobster', m: 25, w: 6 },
  { e: '💎', name: 'Diamond', m: 30, w: 5 },
  { e: '👑', name: 'King', m: 45, w: 2 },
]
const CHIPS = [10, 50, 100, 500]

function Greedy() {
  const [chip, setChip] = useState(10)
  const [bets, setBets] = useState({})
  const [spinning, setSpinning] = useState(false)
  const [lit, setLit] = useState(-1)
  const [history, setHistory] = useState([])
  const [msg, setMsg] = useState('Place bets, then GO!')

  const bet = (i) => {
    if (spinning || !spendCoins(chip)) return
    setBets((b) => ({ ...b, [i]: (b[i] || 0) + chip }))
  }

  const go = () => {
    if (spinning || Object.keys(bets).length === 0) return
    setSpinning(true)
    setMsg('Spinning…')
    const total = GREEDY_ITEMS.reduce((a, x) => a + x.w, 0)
    let r = Math.random() * total
    let winIdx = 0
    for (let i = 0; i < GREEDY_ITEMS.length; i++) {
      r -= GREEDY_ITEMS[i].w
      if (r <= 0) { winIdx = i; break }
    }
    let pos = 0
    let steps = 24 + winIdx + 8 // land on winIdx after full loops
    const tick = (delay) => {
      setLit(pos % 8)
      pos++
      steps--
      if (steps <= 0) {
        const item = GREEDY_ITEMS[winIdx]
        const payout = (bets[winIdx] || 0) * item.m
        if (payout > 0) addCoins(payout)
        setMsg(payout > 0 ? `${item.e} ${item.name} wins — you got 🪙 ${fmt(payout)}! 🎉` : `${item.e} ${item.name} wins — no bet there 😿`)
        setHistory((h) => [item.e, ...h].slice(0, 10))
        setBets({})
        setSpinning(false)
        return
      }
      setTimeout(() => tick(Math.min(260, delay * 1.09)), delay)
    }
    tick(60)
  }

  return (
    <GameShell title="🍰 Greedy">
      <div className="greedy-board">
        {GREEDY_ITEMS.map((it, i) => (
          <button key={it.e} className={lit === i ? 'greedy-cell lit' : 'greedy-cell'} onClick={() => bet(i)}>
            <span className="greedy-emoji">{it.e}</span>
            <span className="greedy-mult">×{it.m}</span>
            {bets[i] && <span className="greedy-bet">🪙{bets[i]}</span>}
          </button>
        ))}
      </div>
      <div className="chips greedy-chips">
        {CHIPS.map((c) => (
          <button key={c} className={chip === c ? 'chip active' : 'chip'} onClick={() => setChip(c)}>🪙 {c}</button>
        ))}
        <button className="btn-primary greedy-go" disabled={spinning} onClick={go}>GO!</button>
      </div>
      <div className="game-result">{msg}</div>
      {history.length > 0 && <p className="greedy-history">Recent: {history.join(' ')}</p>}
    </GameShell>
  )
}

/* ---------------- Soccer ---------------- */
function Soccer() {
  const [stake, setStake] = useState(50)
  const [phase, setPhase] = useState('pick') // pick | shooting | done
  const [msg, setMsg] = useState('Pick a corner and beat the keeper! Goal pays 2.4×')
  const [ballPos, setBallPos] = useState(1)

  const shoot = (zone) => {
    if (phase === 'shooting' || !spendCoins(stake)) return
    setPhase('shooting')
    setBallPos(zone)
    setMsg('⚽ Shooting…')
    setTimeout(() => {
      const keeper = Math.floor(Math.random() * 3)
      if (keeper === zone) {
        setMsg(`🧤 SAVED! Keeper dove ${['left', 'center', 'right'][keeper]}. Lost 🪙 ${stake}.`)
      } else {
        const winAmt = Math.round(stake * 2.4)
        addCoins(winAmt)
        setMsg(`🥅 GOOOAL! Keeper went ${['left', 'center', 'right'][keeper]} — you win 🪙 ${fmt(winAmt)}! 🎉`)
      }
      setPhase('pick')
    }, 1200)
  }

  return (
    <GameShell title="⚽ Penalty Star">
      <div className="soccer-goal">
        <div className="soccer-net" />
        <span className={`soccer-ball pos-${ballPos} ${phase === 'shooting' ? 'kick' : ''}`}>⚽</span>
        <span className="soccer-keeper">🧤</span>
      </div>
      <div className="game-actions">
        {['⬅️ Left', '⬆️ Center', '➡️ Right'].map((z, i) => (
          <button key={z} className="btn-primary game-btn" disabled={phase === 'shooting'} onClick={() => shoot(i)}>
            {z}
          </button>
        ))}
      </div>
      <div className="chips greedy-chips">
        {[20, 50, 100, 500].map((c) => (
          <button key={c} className={stake === c ? 'chip active' : 'chip'} onClick={() => setStake(c)}>🪙 {c}</button>
        ))}
      </div>
      <div className="game-result">{msg}</div>
    </GameShell>
  )
}

/* ---------------- Fishing ---------------- */
const FISH = [
  ['🐟', 10, 34], ['🐠', 25, 24], ['🦀', 40, 16], ['🦑', 80, 10],
  ['👢', 0, 8], ['🦈', 300, 5], ['🐋', 1000, 3],
]

function Fishing() {
  const [casting, setCasting] = useState(false)
  const [log, setLog] = useState([])
  const COST = 20

  const cast = () => {
    if (casting || !spendCoins(COST)) return
    setCasting(true)
    setTimeout(() => {
      const total = FISH.reduce((a, [, , w]) => a + w, 0)
      let r = Math.random() * total
      let caught = FISH[0]
      for (const f of FISH) {
        r -= f[2]
        if (r <= 0) { caught = f; break }
      }
      if (caught[1] > 0) addCoins(caught[1])
      setLog((l) => [{ e: caught[0], v: caught[1] }, ...l].slice(0, 12))
      setCasting(false)
    }, 1100)
  }

  return (
    <GameShell title="🎣 Deep Fishing">
      <div className="fishing-sea">
        <span className={casting ? 'fishing-rod casting' : 'fishing-rod'}>🎣</span>
        <div className="fishing-waves">🌊🌊🌊🌊🌊</div>
        {log[0] && !casting && <span className="fishing-catch">{log[0].e}</span>}
      </div>
      <div className="game-result">
        {casting ? 'Waiting for a bite…' : log[0] ? (log[0].v > 0 ? `Caught ${log[0].e} — 🪙 ${fmt(log[0].v)}!` : `An old boot ${log[0].e}… nothing 😅`) : 'Cast your line! 🐋 pays 1000.'}
      </div>
      <div className="game-actions">
        <button className="btn-primary game-btn" disabled={casting} onClick={cast}>
          Cast line<small>🪙 {COST}</small>
        </button>
      </div>
      {log.length > 0 && <p className="greedy-history">Catches: {log.map((c) => c.e).join(' ')}</p>}
    </GameShell>
  )
}

/* ---------------- Rocket ---------------- */
function Rocket() {
  const [bet, setBet] = useState(50)
  const [mult, setMult] = useState(1)
  const [flying, setFlying] = useState(false)
  const [msg, setMsg] = useState('Place your bet and launch. Eject before the boom! 💥')
  const crashAt = useRef(0)
  const timer = useRef(null)
  const multRef = useRef(1)

  useEffect(() => () => clearInterval(timer.current), [])

  const launch = () => {
    if (flying || !spendCoins(bet)) return
    crashAt.current = Math.min(60, Math.max(1.01, 0.99 / (1 - Math.random())))
    multRef.current = 1
    setMult(1)
    setFlying(true)
    setMsg('🚀 Climbing… eject anytime!')
    timer.current = setInterval(() => {
      multRef.current *= 1.014
      if (multRef.current >= crashAt.current) {
        clearInterval(timer.current)
        setMult(crashAt.current)
        setFlying(false)
        setMsg(`💥 BOOM at ${crashAt.current.toFixed(2)}× — lost 🪙 ${bet}. Faster fingers next time!`)
      } else {
        setMult(multRef.current)
      }
    }, 90)
  }

  const eject = () => {
    if (!flying) return
    clearInterval(timer.current)
    const winAmt = Math.round(bet * multRef.current)
    addCoins(winAmt)
    setFlying(false)
    setMsg(`🪂 Ejected at ${multRef.current.toFixed(2)}× — you win 🪙 ${fmt(winAmt)}! 🎉`)
  }

  return (
    <GameShell title="🚀 Rocket Flyer">
      <div className="rocket-sky">
        <span className={flying ? 'rocket flying' : 'rocket'}>🚀</span>
        <div className={flying ? 'rocket-mult hot' : 'rocket-mult'}>{mult.toFixed(2)}×</div>
      </div>
      <div className="chips greedy-chips">
        {[20, 50, 100, 500].map((c) => (
          <button key={c} className={bet === c ? 'chip active' : 'chip'} disabled={flying} onClick={() => setBet(c)}>🪙 {c}</button>
        ))}
      </div>
      <div className="game-actions">
        {flying ? (
          <button className="btn-primary game-btn eject" onClick={eject}>🪂 EJECT · 🪙 {fmt(Math.round(bet * mult))}</button>
        ) : (
          <button className="btn-primary game-btn" onClick={launch}>Launch · 🪙 {bet}</button>
        )}
      </div>
      <div className="game-result">{msg}</div>
    </GameShell>
  )
}
