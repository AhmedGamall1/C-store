import { Separator } from '@/components/ui/separator'
import { cartSubtotal } from '@/data/cart'
import { cn, formatEGP } from '@/lib/utils'

export function OrderSummary({ items, shipping = 0, className }) {
  const subtotal = cartSubtotal(items)
  const total = subtotal + shipping

  return (
    <aside
      className={cn(
        'rounded-lg border bg-secondary/30 p-6 lg:sticky lg:top-24',
        className
      )}
    >
      <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
        Order Summary
      </h2>

      <ul className="mt-5 space-y-4">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3">
            <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-background">
              <img
                src={item.product.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
              <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-foreground text-[10px] font-semibold text-background">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 text-sm">
              <p className="line-clamp-1 font-medium">{item.product.name}</p>
              <p className="text-xs text-muted-foreground">Size {item.size}</p>
            </div>
            <p className="text-sm font-semibold tabular">
              {formatEGP(Number(item.product.price) * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <Separator className="my-5" />

      <div className="space-y-2 text-sm">
        <Row label="Subtotal" value={formatEGP(subtotal)} />
        <Row
          label="Shipping"
          value={shipping > 0 ? formatEGP(shipping) : <span className="text-muted-foreground">—</span>}
        />
        <Separator className="my-2" />
        <Row
          label="Total"
          value={formatEGP(total)}
          className="text-base font-semibold"
        />
      </div>
    </aside>
  )
}

function Row({ label, value, className }) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular">{value}</span>
    </div>
  )
}
