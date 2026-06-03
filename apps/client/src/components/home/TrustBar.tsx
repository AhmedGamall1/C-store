import { Banknote, CreditCard, ShieldCheck, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEMS = [
  {
    icon: Truck,
    title: 'Egypt-wide shipping',
    body: 'We deliver to all 27 governorates across Egypt.',
  },
  {
    icon: Banknote,
    title: 'Cash on delivery',
    body: 'Pay the driver when your order arrives, anywhere in Egypt.',
  },
  {
    icon: CreditCard,
    title: 'Pay by card',
    body: 'Prefer to pay online? Use your card safely at checkout.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality you can trust',
    body: 'Carefully selected premium pieces, made to last.',
  },
]

export function TrustBar({ className }) {
  return (
    <section className={cn('border-y bg-secondary/40', className)}>
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
