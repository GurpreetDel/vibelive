import { getState, levelOf } from './store.js'
import { rankById } from '../data/items.js'
import { myName } from './util.js'

export const TOPIC_CHIPS = ['Account', 'Live', 'Top up', 'Coins & currency', 'Privileges', 'Settings', 'Features']

const fmtDate = (t) => new Date(t).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export function botReply(input) {
  const t = (input || '').toLowerCase()
  const s = getState()
  const has = (...words) => words.some((w) => t.includes(w))

  // Top up / did my coins arrive?
  if (has('top up', 'topup', 'recharge', 'payment', 'paid', 'purchase', 'buy coin', 'coins came', 'coin came', 'not received', 'arrive')) {
    const last = s.recharges[s.recharges.length - 1]
    if (last) {
      return {
        text: `✅ Yes — your recharge arrived! Last top-up: ${last.coins.toLocaleString()} coins on ${fmtDate(last.at)} (+${last.points.toLocaleString()} points credited to your Points Center). You have made ${s.recharges.length} recharge(s) in total. Current balance: 🪙 ${s.coins.toLocaleString()} coins. Need more? Go to Profile → Recharge Coins.`,
        chips: ['Coins & currency', 'Privileges'],
      }
    }
    return {
      text: `You haven't recharged yet, so no coins are pending — your current balance is 🪙 ${s.coins.toLocaleString()} coins. To top up: Profile → 💳 Recharge Coins → pick a package. Coins arrive instantly and every coin also gives you 1 ⭐ point in the Points Center.`,
      chips: ['Top up', 'Coins & currency'],
    }
  }

  // Currency explainer
  if (has('coin', 'currency', 'bean', 'point', 'diamond', 'wallet', 'balance', 'money')) {
    return {
      text: `Your wallet right now → 🪙 Coins: ${s.coins.toLocaleString()} · 🫘 Beans: ${s.beans.toLocaleString()} · ⭐ Points: ${s.points.toLocaleString()}.\n\n🪙 Coins — buy gifts, games, backpack items, SVIP & Aristocracy. Get them via Recharge.\n🫘 Beans — earned when viewers send YOU gifts while streaming. Exchange to coins in Live Streamer Center (100 🫘 → 30 🪙).\n⭐ Points — free bonus, 1 point per coin recharged. Redeem in Points Center.`,
      chips: ['Top up', 'Features'],
    }
  }

  // Account
  if (has('account', 'profile', 'name', 'my id', 'level', 'password', 'login', 'delete')) {
    const idItem = s.equipped.id
    return {
      text: `Your account 📇\n• Name: ${myName()}\n• VibeLive ID: ${idItem ? (idItem === 'id-gold' ? '🥇 88888 (Gold)' : '🥈 66666 (Silver)') : s.userId}\n• Level: Lv${levelOf(s.xp)} (levels grow as you spend coins)\n• SVIP: ${s.svip ? 'SVIP' + s.svip : 'not active'} · Rank: ${s.rank ? rankById(s.rank).name : 'not activated'}\n\nEdit your name and avatar at the top of the Profile page. VibeLive stores your account only on this device — no password needed.`,
      chips: ['Privileges', 'Settings'],
    }
  }

  // Live streaming
  if (has('live', 'stream', 'broadcast', 'camera', 'mic', 'room code', 'viewer')) {
    return {
      text: `Going live is easy 🎥\n1. Tap the pink Go Live button\n2. Allow camera & microphone\n3. Set a title → tap 🔴 Go LIVE\n4. Share your 6-letter room code — anyone can watch from a phone or laptop!\n\nYou have streamed ${s.liveMinutes} minute(s) so far and received ${s.giftsReceived} gift(s). Track earnings & tasks in Profile → 🎥 Live Streamer Center.`,
      chips: ['Features', 'Coins & currency'],
    }
  }

  // Privileges: SVIP / aristocracy
  if (has('svip', 'vip', 'privile', 'noble', 'aristocra', 'rank', 'baron', 'duke', 'king')) {
    return {
      text: `Your privileges 👑\n• SVIP: ${s.svip ? 'SVIP' + s.svip + ' active ✅' : 'not active — activate in Profile → 💠 SVIP'}\n• Aristocracy: ${s.rank ? rankById(s.rank).emoji + ' ' + rankById(s.rank).name + ' active ✅' : 'not activated — visit Profile → 👑 Aristocracy Center'}\n\nRanks go Baron → Viscount → Count → Marquis → Duke → King → Super King → Legendary King 🐲. Higher ranks unlock entry effects, badges, gift discounts and exclusive gifts like the Dragon.`,
      chips: ['Top up', 'Account'],
    }
  }

  // Settings
  if (has('setting', 'install', 'notification', 'privacy', 'app', 'phone', 'android', 'iphone')) {
    return {
      text: `Settings & app ⚙️\n• 📱 Install on phone: Profile → Get Mobile App (Android: Chrome ⋮ → Add to Home screen · iPhone: Safari Share → Add to Home Screen)\n• 🔒 Privacy policy: Profile → Privacy (we store data only on your device)\n• ✏️ Change name/avatar: tap them on your Profile\n• 🔄 Reset everything: clear this site's data in your browser settings.`,
      chips: ['Account', 'Features'],
    }
  }

  // Gifts
  if (has('gift', 'dragon', 'rose', 'backpack', 'frame', 'entry effect', 'ornament')) {
    return {
      text: `Gifts & backpack 🎁\n• In any live room tap 🎁 to send gifts — from 🌹 Rose (1 coin) to 🐉 Dragon (12,888 coins). Big gifts trigger full-screen animations!\n• Your 🎒 Backpack (Profile → Backpack) holds cars, entry effects, avatar frames, gold/silver IDs and noble ornaments. Buy them with coins and tap Equip to decorate your profile and room entries.`,
      chips: ['Coins & currency', 'Privileges'],
    }
  }

  // Games
  if (has('game', 'greedy', 'lucky', 'fish', 'rocket', 'soccer', 'play')) {
    return {
      text: `Games lobby 🎮 (bottom bar → Games)\n• 🐱 Lucky Cat — draws with rare backpack drops\n• 🍰 Greedy — the Bigo classic wheel, King pays 45×\n• ⚽ Penalty Star — beat the keeper for 2.4×\n• 🎣 Deep Fishing — whales pay 1000 coins\n• 🚀 Rocket Flyer — cash out before it explodes!\nAll games use 🪙 coins. Check the 📅 Activity calendar for bonus days.`,
      chips: ['Top up', 'Features'],
    }
  }

  // Human agent
  if (has('human', 'agent', 'person', 'real', 'complain', 'refund')) {
    return {
      text: `You can reach a human at 📧 gurpreetkaurchadhafan@gmail.com — replies within 24h. But try me first, I resolve most questions instantly 🤖`,
      chips: TOPIC_CHIPS.slice(0, 4),
    }
  }

  // Features overview
  if (has('feature', 'function', 'what can', 'help', 'menu', 'everything')) {
    return {
      text: `Here's everything VibeLive can do ✨\n🏠 Home — live rooms & demo streams\n🌍 Explore — streamers from 190+ countries\n📹 Go Live — real WebRTC broadcasting with room codes\n💬 Inbox — message friends & this service bot\n🎮 Games — Lucky Cat, Greedy, Soccer, Fishing, Rocket\n👤 Profile — backpack, recharge, points, SVIP, Aristocracy, streamer center, visitors, watch history\nAsk me about any of these!`,
      chips: TOPIC_CHIPS,
    }
  }

  // Greetings
  if (has('hi', 'hello', 'hey', 'namaste', 'salam')) {
    return {
      text: `Hello ${myName()}! 👋 I'm the VibeLive service bot, online 24×7. I can check your recharges, explain coins/beans/points, help you go live, or activate privileges. What do you need?`,
      chips: TOPIC_CHIPS,
    }
  }

  return {
    text: `I'm not sure about that one 🤔 — but I can help with these topics. Tap one below or ask in your own words (e.g. "did my coins come?", "how to go live", "what is SVIP").`,
    chips: TOPIC_CHIPS,
  }
}

export const HUMAN_REPLIES = [
  'haha nice 😄', 'thanks for the message! 💖', 'see you in my next live 🎥',
  '😂😂', 'aww thank you 🥰', 'sure, done deal!', 'send me a dragon next time 🐉😜',
]
