export const STREAMS = [
  { id: 'aisha', name: 'Aisha ✨', g: 'F', country: '🇮🇳', title: 'Singing your requests 🎤', tag: 'Music', viewers: 12483, avatar: '👩‍🎤', grad: ['#ff2d78', '#7b2dff'], level: 36 },
  { id: 'meera', name: 'Meera Dance', g: 'F', country: '🇮🇳', title: 'Bollywood dance party 💃', tag: 'Dance', viewers: 15230, avatar: '💃', grad: ['#ff9a2d', '#ff2d78'], level: 52 },
  { id: 'rockyg', name: 'Rocky G', g: 'M', country: '🇮🇳', title: 'Late night gaming grind 🎮', tag: 'Gaming', viewers: 8921, avatar: '🎮', grad: ['#00d4ff', '#7b2dff'], level: 41 },
  { id: 'sofia', name: 'Sofia', g: 'F', country: '🇧🇷', title: 'Just chatting, come say hi 💬', tag: 'Chat', viewers: 20112, avatar: '💁‍♀️', grad: ['#ff2d78', '#ff9a2d'], level: 60 },
  { id: 'kevin', name: 'Kevin', g: 'M', country: '🇺🇸', title: 'Guitar covers & chill 🎸', tag: 'Music', viewers: 5310, avatar: '🎸', grad: ['#2dff9a', '#00d4ff'], level: 28 },
  { id: 'arjun', name: 'Arjun Beats', g: 'M', country: '🇮🇳', title: 'Live beatboxing 🔥', tag: 'Music', viewers: 3480, avatar: '🎧', grad: ['#7b2dff', '#00d4ff'], level: 22 },
  { id: 'lin', name: 'Lin', g: 'F', country: '🇸🇬', title: 'Cooking midnight ramen 🍜', tag: 'Food', viewers: 6752, avatar: '🍜', grad: ['#ff9a2d', '#2dff9a'], level: 33 },
  { id: 'zara', name: 'Zara', g: 'F', country: '🇦🇪', title: 'Desert drive vlog 🌆', tag: 'Travel', viewers: 9834, avatar: '🚘', grad: ['#00d4ff', '#ff2d78'], level: 45 },
]

export const TAGS = ['Popular', 'Music', 'Dance', 'Gaming', 'Chat', 'Food', 'Travel']

export const CHAT_USERS = ['Rahul', 'Priya', 'Dev', 'Tanya', 'Ali', 'Jenny', 'Vik', 'Sana', 'Leo', 'Mia', 'Noor', 'Karan']

export const CHAT_LINES = [
  'hiii from Delhi 👋',
  'omg you are so good 😍',
  'first time here, already a fan',
  'sending hearts ❤️❤️❤️',
  'can you give me a shoutout?',
  'this is fire 🔥🔥',
  'lol 😂😂',
  'greetings from Dubai 🇦🇪',
  'followed! ✅',
  'play my request next pls 🙏',
  'the vibes are immaculate ✨',
  'who else watching at 2am 💀',
  'legend!!',
  'gifted you a rose 🌹',
  'wow 20k watching!!',
]

export const GIFT_CATEGORIES = [
  {
    id: 'popular',
    name: '🔥 Popular',
    gifts: [
      { id: 'rose', emoji: '🌹', name: 'Rose', cost: 1 },
      { id: 'heart', emoji: '💖', name: 'Heart', cost: 5 },
      { id: 'lolly', emoji: '🍭', name: 'Lolly', cost: 10 },
      { id: 'clover', emoji: '🍀', name: 'Lucky Clover', cost: 15 },
      { id: 'cake', emoji: '🍰', name: 'Cake', cost: 20 },
      { id: 'beer', emoji: '🍺', name: 'Cheers', cost: 33 },
      { id: 'mic', emoji: '🎤', name: 'Golden Mic', cost: 50 },
      { id: 'guitar', emoji: '🎸', name: 'Guitar', cost: 88 },
      { id: 'rocket', emoji: '🚀', name: 'Rocket', cost: 100 },
      { id: 'loveletter', emoji: '💌', name: 'Love Letter', cost: 150 },
    ],
  },
  {
    id: 'luxury',
    name: '💎 Luxury',
    gifts: [
      { id: 'teddy', emoji: '🧸', name: 'Teddy', cost: 199 },
      { id: 'perfume', emoji: '🌺', name: 'Perfume', cost: 299 },
      { id: 'ring', emoji: '💍', name: 'Diamond Ring', cost: 500 },
      { id: 'handbag', emoji: '👜', name: 'Handbag', cost: 777 },
      { id: 'watch', emoji: '⌚', name: 'Gold Watch', cost: 888 },
      { id: 'car', emoji: '🏎️', name: 'Super Car', cost: 1500 },
      { id: 'peacock', emoji: '🦚', name: 'Peacock', cost: 2500 },
      { id: 'lion', emoji: '🦁', name: 'Lion', cost: 2999 },
      { id: 'plane', emoji: '✈️', name: 'Private Jet', cost: 3999 },
      { id: 'crown', emoji: '👑', name: 'Crown', cost: 5000 },
      { id: 'yacht', emoji: '🛥️', name: 'Mega Yacht', cost: 6666 },
      { id: 'castle', emoji: '🏰', name: 'Castle', cost: 8888 },
    ],
  },
  {
    id: 'epic',
    name: '🐉 Epic',
    gifts: [
      { id: 'dragon', emoji: '🐉', name: 'Dragon', cost: 12888 },
      { id: 'goldendragon', emoji: '🐲', name: 'Golden Dragon', cost: 16888 },
      { id: 'kraken', emoji: '🐙', name: 'Kraken', cost: 18888 },
      { id: 'whale', emoji: '🐳', name: 'Cosmic Whale', cost: 20000 },
      { id: 'phoenix', emoji: '🐦‍🔥', name: 'Phoenix', cost: 21888 },
      { id: 'unicorn', emoji: '🦄', name: 'Unicorn', cost: 25888 },
      { id: 'trex', emoji: '🦖', name: 'T-Rex', cost: 28888 },
    ],
  },
  {
    id: 'mythic',
    name: '⚡ Mythic',
    gifts: [
      { id: 'angel', emoji: '🪽', name: 'Guardian Angel', cost: 30000 },
      { id: 'demonking', emoji: '👹', name: 'Demon King', cost: 38888 },
      { id: 'genie', emoji: '🧞', name: 'Genie', cost: 45000 },
      { id: 'galaxy', emoji: '🌌', name: 'Galaxy', cost: 50000 },
      { id: 'thundergod', emoji: '⚡', name: 'Thunder God', cost: 66666 },
      { id: 'poseidon', emoji: '🔱', name: 'Poseidon', cost: 88888 },
    ],
  },
]

export const GIFTS = GIFT_CATEGORIES.flatMap((c) => c.gifts)

export const EPIC_GIFT_COST = 1000 // >= this: full-screen flyover animation
export const MYTHIC_GIFT_COST = 10000 // >= this: mythic takeover (swarm + shockwave)

export const FRIENDS = [
  { name: 'Priya', avatar: '👧', lv: 22 },
  { name: 'Rahul', avatar: '🧑', lv: 35 },
  { name: 'Sana', avatar: '👩', lv: 18 },
  { name: 'Dev', avatar: '👨', lv: 41 },
  { name: 'Tanya', avatar: '👱‍♀️', lv: 27 },
  { name: 'Ali', avatar: '🧔', lv: 30 },
  { name: 'Mia', avatar: '👩‍🦰', lv: 15 },
  { name: 'Karan', avatar: '👨‍🦱', lv: 38 },
  { name: 'Noor', avatar: '🧕', lv: 24 },
  { name: 'Leo', avatar: '👦', lv: 12 },
  { name: 'Jenny', avatar: '💁‍♀️', lv: 45 },
  { name: 'Vik', avatar: '🕺', lv: 29 },
]

export const giftById = (id) => GIFTS.find((g) => g.id === id)
