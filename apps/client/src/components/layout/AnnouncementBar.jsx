export function AnnouncementBar() {
  const messages = [
    'Free shipping in Cairo & Giza on orders over 2,000 EGP',
    'New Drop: The Nile Collection — now live',
    'Cash on delivery available across all 27 governorates',
  ]
  return (
    <div className="bg-foreground text-background text-xs font-medium">
      <div className="marquee">
        <div className="marquee-track py-2 whitespace-nowrap">
          {[...messages, ...messages, ...messages].map((m, i) => (
            <span key={i} className="flex items-center gap-12 uppercase tracking-[0.2em]">
              <span>{m}</span>
              <span aria-hidden className="opacity-50">
                ✦
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
