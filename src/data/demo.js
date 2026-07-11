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

export const GIFTS = [
  { id: 'rose', emoji: '🌹', name: 'Rose', cost: 1 },
  { id: 'heart', emoji: '💖', name: 'Heart', cost: 5 },
  { id: 'cake', emoji: '🍰', name: 'Cake', cost: 20 },
  { id: 'mic', emoji: '🎤', name: 'Golden Mic', cost: 50 },
  { id: 'rocket', emoji: '🚀', name: 'Rocket', cost: 100 },
  { id: 'teddy', emoji: '🧸', name: 'Teddy', cost: 199 },
  { id: 'ring', emoji: '💍', name: 'Ring', cost: 500 },
  { id: 'car', emoji: '🏎️', name: 'Super Car', cost: 1500 },
  { id: 'peacock', emoji: '🦚', name: 'Peacock', cost: 2500 },
  { id: 'lion', emoji: '🦁', name: 'Lion', cost: 2999 },
  { id: 'plane', emoji: '✈️', name: 'Private Jet', cost: 3999 },
  { id: 'crown', emoji: '👑', name: 'Crown', cost: 5000 },
  { id: 'yacht', emoji: '🛥️', name: 'Mega Yacht', cost: 6666 },
  { id: 'castle', emoji: '🏰', name: 'Castle', cost: 8888 },
  { id: 'dragon', emoji: '🐉', name: 'Dragon', cost: 12888 },
  { id: 'whale', emoji: '🐳', name: 'Cosmic Whale', cost: 20000 },
]

export const EPIC_GIFT_COST = 1000 // gifts at/above this trigger the full-screen animation

export const giftById = (id) => GIFTS.find((g) => g.id === id)
