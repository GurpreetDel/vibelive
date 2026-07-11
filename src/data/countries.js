export const COUNTRIES = [
  ['AF', 'Afghanistan'], ['AL', 'Albania'], ['DZ', 'Algeria'], ['AD', 'Andorra'], ['AO', 'Angola'],
  ['AG', 'Antigua & Barbuda'], ['AR', 'Argentina'], ['AM', 'Armenia'], ['AU', 'Australia'], ['AT', 'Austria'],
  ['AZ', 'Azerbaijan'], ['BS', 'Bahamas'], ['BH', 'Bahrain'], ['BD', 'Bangladesh'], ['BB', 'Barbados'],
  ['BY', 'Belarus'], ['BE', 'Belgium'], ['BZ', 'Belize'], ['BJ', 'Benin'], ['BT', 'Bhutan'],
  ['BO', 'Bolivia'], ['BA', 'Bosnia & Herzegovina'], ['BW', 'Botswana'], ['BR', 'Brazil'], ['BN', 'Brunei'],
  ['BG', 'Bulgaria'], ['BF', 'Burkina Faso'], ['BI', 'Burundi'], ['KH', 'Cambodia'], ['CM', 'Cameroon'],
  ['CA', 'Canada'], ['CV', 'Cape Verde'], ['CF', 'Central African Rep.'], ['TD', 'Chad'], ['CL', 'Chile'],
  ['CN', 'China'], ['CO', 'Colombia'], ['KM', 'Comoros'], ['CG', 'Congo'], ['CD', 'DR Congo'],
  ['CR', 'Costa Rica'], ['CI', 'Ivory Coast'], ['HR', 'Croatia'], ['CU', 'Cuba'], ['CY', 'Cyprus'],
  ['CZ', 'Czechia'], ['DK', 'Denmark'], ['DJ', 'Djibouti'], ['DM', 'Dominica'], ['DO', 'Dominican Rep.'],
  ['EC', 'Ecuador'], ['EG', 'Egypt'], ['SV', 'El Salvador'], ['GQ', 'Equatorial Guinea'], ['ER', 'Eritrea'],
  ['EE', 'Estonia'], ['SZ', 'Eswatini'], ['ET', 'Ethiopia'], ['FJ', 'Fiji'], ['FI', 'Finland'],
  ['FR', 'France'], ['GA', 'Gabon'], ['GM', 'Gambia'], ['GE', 'Georgia'], ['DE', 'Germany'],
  ['GH', 'Ghana'], ['GR', 'Greece'], ['GD', 'Grenada'], ['GT', 'Guatemala'], ['GN', 'Guinea'],
  ['GW', 'Guinea-Bissau'], ['GY', 'Guyana'], ['HT', 'Haiti'], ['HN', 'Honduras'], ['HK', 'Hong Kong'],
  ['HU', 'Hungary'], ['IS', 'Iceland'], ['IN', 'India'], ['ID', 'Indonesia'], ['IR', 'Iran'],
  ['IQ', 'Iraq'], ['IE', 'Ireland'], ['IL', 'Israel'], ['IT', 'Italy'], ['JM', 'Jamaica'],
  ['JP', 'Japan'], ['JO', 'Jordan'], ['KZ', 'Kazakhstan'], ['KE', 'Kenya'], ['KI', 'Kiribati'],
  ['KW', 'Kuwait'], ['KG', 'Kyrgyzstan'], ['LA', 'Laos'], ['LV', 'Latvia'], ['LB', 'Lebanon'],
  ['LS', 'Lesotho'], ['LR', 'Liberia'], ['LY', 'Libya'], ['LI', 'Liechtenstein'], ['LT', 'Lithuania'],
  ['LU', 'Luxembourg'], ['MO', 'Macau'], ['MG', 'Madagascar'], ['MW', 'Malawi'], ['MY', 'Malaysia'],
  ['MV', 'Maldives'], ['ML', 'Mali'], ['MT', 'Malta'], ['MH', 'Marshall Islands'], ['MR', 'Mauritania'],
  ['MU', 'Mauritius'], ['MX', 'Mexico'], ['FM', 'Micronesia'], ['MD', 'Moldova'], ['MC', 'Monaco'],
  ['MN', 'Mongolia'], ['ME', 'Montenegro'], ['MA', 'Morocco'], ['MZ', 'Mozambique'], ['MM', 'Myanmar'],
  ['NA', 'Namibia'], ['NR', 'Nauru'], ['NP', 'Nepal'], ['NL', 'Netherlands'], ['NZ', 'New Zealand'],
  ['NI', 'Nicaragua'], ['NE', 'Niger'], ['NG', 'Nigeria'], ['KP', 'North Korea'], ['MK', 'North Macedonia'],
  ['NO', 'Norway'], ['OM', 'Oman'], ['PK', 'Pakistan'], ['PW', 'Palau'], ['PS', 'Palestine'],
  ['PA', 'Panama'], ['PG', 'Papua New Guinea'], ['PY', 'Paraguay'], ['PE', 'Peru'], ['PH', 'Philippines'],
  ['PL', 'Poland'], ['PT', 'Portugal'], ['QA', 'Qatar'], ['RO', 'Romania'], ['RU', 'Russia'],
  ['RW', 'Rwanda'], ['KN', 'St Kitts & Nevis'], ['LC', 'St Lucia'], ['VC', 'St Vincent'], ['WS', 'Samoa'],
  ['SM', 'San Marino'], ['ST', 'São Tomé & Príncipe'], ['SA', 'Saudi Arabia'], ['SN', 'Senegal'], ['RS', 'Serbia'],
  ['SC', 'Seychelles'], ['SL', 'Sierra Leone'], ['SG', 'Singapore'], ['SK', 'Slovakia'], ['SI', 'Slovenia'],
  ['SB', 'Solomon Islands'], ['SO', 'Somalia'], ['ZA', 'South Africa'], ['KR', 'South Korea'], ['SS', 'South Sudan'],
  ['ES', 'Spain'], ['LK', 'Sri Lanka'], ['SD', 'Sudan'], ['SR', 'Suriname'], ['SE', 'Sweden'],
  ['CH', 'Switzerland'], ['SY', 'Syria'], ['TW', 'Taiwan'], ['TJ', 'Tajikistan'], ['TZ', 'Tanzania'],
  ['TH', 'Thailand'], ['TL', 'Timor-Leste'], ['TG', 'Togo'], ['TO', 'Tonga'], ['TT', 'Trinidad & Tobago'],
  ['TN', 'Tunisia'], ['TR', 'Turkey'], ['TM', 'Turkmenistan'], ['TV', 'Tuvalu'], ['UG', 'Uganda'],
  ['UA', 'Ukraine'], ['AE', 'United Arab Emirates'], ['GB', 'United Kingdom'], ['US', 'United States'], ['UY', 'Uruguay'],
  ['UZ', 'Uzbekistan'], ['VU', 'Vanuatu'], ['VA', 'Vatican City'], ['VE', 'Venezuela'], ['VN', 'Vietnam'],
  ['YE', 'Yemen'], ['ZM', 'Zambia'], ['ZW', 'Zimbabwe'],
]

export const flagOf = (code) =>
  String.fromCodePoint(...[...code].map((c) => c.charCodeAt(0) + 127397))

export const countryName = (code) => {
  const c = COUNTRIES.find(([cc]) => cc === code)
  return c ? c[1] : code
}

const NAMES = ['Ria', 'Zoya', 'Kabir', 'Luna', 'Marco', 'Yuki', 'Nina', 'Omar', 'Lara', 'Ivan', 'Chi', 'Amara', 'Sami', 'Elif', 'Diego', 'Hana', 'Tariq', 'Maya', 'Jin', 'Bella', 'Ravi', 'Sasha', 'Kofi', 'Ines']
const AVATARS = ['🎤', '💃', '🎸', '🎮', '🍜', '🧘‍♀️', '🎨', '📚', '☕', '🌅', '🎧', '⚽', '🛍️', '💄', '👨‍🍳', '🎹', '🐶', '🏋️']
const TITLES = [
  'Singing live, take a seat 🎶', 'Morning vibes & coffee ☕', 'Dance practice, join me 💃',
  'Ranked grind, wish me luck 🎮', 'Cooking something special 🍳', 'Ask me anything 💬',
  'Street walk tour 🚶', 'Late night chill 🌙', 'Guitar & requests 🎸',
  'Workout with me 💪', 'Art stream — painting live 🎨', 'Karaoke night!! 🎤',
]
const GRADS = [
  ['#ff2d78', '#7b2dff'], ['#00d4ff', '#7b2dff'], ['#ff9a2d', '#ff2d78'],
  ['#2dff9a', '#00d4ff'], ['#ff2d78', '#ff9a2d'], ['#7b2dff', '#00d4ff'],
]

const hashStr = (str) => {
  let h = 0
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h
}

// Deterministic pseudo-live streamers for a country.
export function countryStreamers(code, count = 6) {
  return Array.from({ length: count }, (_, i) => {
    const h = hashStr(code + i)
    return {
      id: `g-${code}-${i}`,
      name: NAMES[h % NAMES.length],
      country: flagOf(code),
      countryCode: code,
      g: h % 2 === 0 ? 'F' : 'M',
      title: TITLES[(h >> 3) % TITLES.length],
      tag: 'Nearby',
      viewers: 180 + (h % 8800),
      avatar: AVATARS[(h >> 5) % AVATARS.length],
      grad: GRADS[(h >> 7) % GRADS.length],
      level: 4 + (h % 58),
    }
  })
}

export const liveCountFor = (code) => 40 + (hashStr(code) % 940)

export function generatedStreamer(id) {
  const m = /^g-([A-Z]{2})-(\d+)$/.exec(id)
  if (!m) return null
  return countryStreamers(m[1], Number(m[2]) + 1)[Number(m[2])]
}
