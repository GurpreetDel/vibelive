export const BACKPACK = [
  // Cars
  { id: 'car-scooter', slot: 'car', emoji: '🛵', name: 'City Scooter', cost: 800, desc: 'Zip into rooms in style' },
  { id: 'car-sports', slot: 'car', emoji: '🏎️', name: 'Neon Sports Car', cost: 5000, desc: 'Roar past everyone' },
  { id: 'car-limo', slot: 'car', emoji: '🚙', name: 'VIP Limo', cost: 12000, desc: 'Arrive like a celebrity' },
  { id: 'car-heli', slot: 'car', emoji: '🚁', name: 'Sky Helicopter', cost: 25000, desc: 'Land on the stage' },
  { id: 'car-yacht', slot: 'car', emoji: '🛥️', name: 'Royal Yacht', cost: 50000, desc: 'Sail into the spotlight' },
  // Entry effects
  { id: 'entry-sparkle', slot: 'entry', emoji: '✨', name: 'Sparkle Entry', cost: 500, desc: 'Glitter trail on entry' },
  { id: 'entry-flame', slot: 'entry', emoji: '🔥', name: 'Flame Walk', cost: 2500, desc: 'Burn a path into the room' },
  { id: 'entry-royal', slot: 'entry', emoji: '👑', name: 'Royal Carpet', cost: 12000, desc: 'Red carpet + trumpets' },
  { id: 'entry-dragon', slot: 'entry', emoji: '🐉', name: 'Dragon Ride', cost: 30000, desc: 'Enter riding a dragon' },
  // Avatar frames
  { id: 'frame-neon', slot: 'frame', emoji: '🟣', name: 'Neon Ring', cost: 0, css: 'fr-neon', desc: 'Starter frame' },
  { id: 'frame-gold', slot: 'frame', emoji: '🟡', name: 'Gold Aura', cost: 3000, css: 'fr-gold', desc: 'Shimmering gold ring' },
  { id: 'frame-fire', slot: 'frame', emoji: '🔥', name: 'Fire Halo', cost: 8000, css: 'fr-fire', desc: 'Blazing avatar halo' },
  { id: 'frame-ice', slot: 'frame', emoji: '❄️', name: 'Frost Crown', cost: 8000, css: 'fr-ice', desc: 'Icy crystal ring' },
  // Exclusive IDs
  { id: 'id-silver', slot: 'id', emoji: '🥈', name: 'Silver ID 66666', cost: 15000, value: '66666', desc: 'Rare 5-digit silver ID' },
  { id: 'id-gold', slot: 'id', emoji: '🥇', name: 'Gold ID 88888', cost: 60000, value: '88888', desc: 'Legendary gold ID' },
  // Noble ornaments
  { id: 'noble-scepter', slot: 'badge', emoji: '🪄', name: 'Noble Scepter', cost: 10000, desc: 'Symbol of nobility' },
  { id: 'noble-crown', slot: 'badge', emoji: '👑', name: 'Aristocrat Crown', cost: 25000, desc: 'Worn beside your name' },
  { id: 'noble-throne', slot: 'badge', emoji: '🪑', name: 'Golden Throne', cost: 40000, desc: 'Ultimate flex' },
]

export const SLOTS = [
  ['car', '🏎️ Cars'],
  ['entry', '✨ Entry Effects'],
  ['frame', '🖼️ Avatar Frames'],
  ['id', '🆔 Exclusive IDs'],
  ['badge', '👑 Noble Ornaments'],
]

export const itemById = (id) => BACKPACK.find((i) => i.id === id)

export const RANKS = [
  { id: 'baron', name: 'Baron', emoji: '🛡️', cost: 8000, color: '#9ad0ff', perks: ['Baron badge in chat', 'Sparkle entry effect', '5 free hearts daily'] },
  { id: 'viscount', name: 'Viscount', emoji: '⚔️', cost: 20000, color: '#8affea', perks: ['Viscount badge', 'Colored chat name', 'Gift discount 2%'] },
  { id: 'count', name: 'Count', emoji: '🏰', cost: 50000, color: '#a5ff9a', perks: ['Count badge', 'Entry announcement', 'Gift discount 5%'] },
  { id: 'marquis', name: 'Marquis', emoji: '💠', cost: 120000, color: '#ffd24d', perks: ['Marquis badge', 'Room broadcast entry', 'Exclusive gift: Peacock'] },
  { id: 'duke', name: 'Duke', emoji: '🦁', cost: 300000, color: '#ffb38a', perks: ['Duke badge', 'Golden entry carpet', 'Anti-kick shield'] },
  { id: 'king', name: 'King', emoji: '👑', cost: 800000, color: '#ff8fb8', perks: ['King badge', 'Full-screen entry effect', 'Exclusive gift: Dragon'] },
  { id: 'super-king', name: 'Super King', emoji: '🌟', cost: 2000000, color: '#d6a5ff', perks: ['Super King badge', 'Platform-wide entry banner', 'Invisible visit mode'] },
  { id: 'legendary-king', name: 'Legendary King', emoji: '🐲', cost: 5000000, color: '#ff2d78', perks: ['Legendary aura on avatar', 'Custom entry animation', 'Personal service manager'] },
]

export const rankById = (id) => RANKS.find((r) => r.id === id)
export const rankIndex = (id) => RANKS.findIndex((r) => r.id === id)

export const SVIP_LEVELS = Array.from({ length: 9 }, (_, i) => {
  const lv = i + 1
  return {
    lv,
    cost: lv * lv * 1500,
    perks: [
      `SVIP${lv} badge beside your name`,
      lv >= 2 ? 'Priority in chat lists' : 'Daily coin bonus',
      lv >= 4 ? 'Exclusive SVIP gifts' : 'Profile card glow',
      lv >= 6 ? 'Stealth entry (no announcement)' : 'Extra hearts',
      lv >= 8 ? 'Dedicated service manager' : 'Monthly backpack drop',
    ].slice(0, 4),
  }
})

export const GAMES = [
  { id: 'luckycat', emoji: '🐱', name: 'Lucky Cat', tag: 'Draw & win', grad: ['#ff9a2d', '#ff2d78'], desc: 'Shake the fortune cat — coins & rare backpack drops!' },
  { id: 'greedy', emoji: '🍰', name: 'Greedy', tag: 'Bigo classic', grad: ['#ff2d78', '#7b2dff'], desc: 'Bet on the food wheel. King pays 45×!' },
  { id: 'soccer', emoji: '⚽', name: 'Penalty Star', tag: 'Skill shot', grad: ['#2dff9a', '#00d4ff'], desc: 'Pick your corner, beat the keeper, 2.4× payout.' },
  { id: 'fishing', emoji: '🎣', name: 'Deep Fishing', tag: 'Catch & earn', grad: ['#00d4ff', '#7b2dff'], desc: 'Cast your line — whales pay 1000 coins!' },
  { id: 'rocket', emoji: '🚀', name: 'Rocket Flyer', tag: 'Cash out fast', grad: ['#7b2dff', '#ff2d78'], desc: 'Multiplier climbs until the rocket explodes. Eject in time!' },
]
