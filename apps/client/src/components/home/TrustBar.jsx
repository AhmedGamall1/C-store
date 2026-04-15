import { CreditCard, MapPin, RotateCcw, Truck } from 'lucide-react'

const ITEMS = [
  {
    icon: Truck,
    title: 'Egypt-wide shipping',
    body: 'All 27 governorates. Free on orders over 2,000 EGP in Cairo & Giza.',
  },
  {
    icon: CreditCard,
    title: 'Cash on delivery',
    body: 'Pay the driver when you receive your order, anywhere in Egypt.',
  },
  {
    icon: RotateCcw,
    title: '14-day returns',
    body: 'Didn’t fit right? Return it in 14 days, no questions asked.',
  },
  {
    icon: MapPin,
    title: 'Made in Cairo',
    body: 'Designed, cut and sewn locally. Supporting Egyptian workshops.',
  },
]

export function TrustBar() {
  return (
    <section className="border-y bg-secondary/40">
      <div className="container-page grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
        {ITEMS.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-background">
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">{item.title}</h4>
              <p className="mt-1 text-xs text-muted-foreground">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
