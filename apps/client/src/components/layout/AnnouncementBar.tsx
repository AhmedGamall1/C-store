export function AnnouncementBar() {
  const messages = [
    'Premium clothing — delivered across all of Egypt',
    'Cash on delivery available in all 27 governorates',
    'Pay securely online by card, or cash on delivery',
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
