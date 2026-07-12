export default function GiftBanner({ banner }) {
  if (!banner) return null
  return (
    <div className={banner.tier ? `gift-banner tier-${banner.tier}` : 'gift-banner'} key={banner.key}>
      <span className="gift-banner-emoji">{banner.emoji}</span>
      <span>
        <b>{banner.from}</b> sent a {banner.name}!
      </span>
    </div>
  )
}
