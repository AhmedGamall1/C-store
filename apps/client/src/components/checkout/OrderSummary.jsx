import { Separator } from '@/components/ui/separator'
import { cn, formatEGP } from '@/lib/utils'

export function OrderSummary({ items, shipping = 0, className }) {
  // Prefer server-computed subtotal per line; fall back for callers that
  // haven't computed it yet (e.g. an order-items list later).
  const subtotal = items.reduce(
    (sum, item) =>
      sum + (item.subtotal ?? Number(item.product.price) * item.quantity),
    0
  )
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
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
              <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-foreground text-[10px] font-semibold text-background">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 text-sm">
              <p className="line-clamp-1 font-medium">{item.product.name}</p>
              {item.color?.name || item.size ? (
                <p className="text-xs text-muted-foreground">
                  {[item.color?.name, item.size && `Size ${item.size}`]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              ) : null}
            </div>
            <p className="text-sm font-semibold tabular">
              {formatEGP(item.subtotal ?? item.unitPrice * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <Separator className="my-5" />

      <div className="space-y-2 text-sm">
        <Row label="Subtotal" value={formatEGP(subtotal)} />
        <Row
          label="Shipping"
          value={
            shipping > 0 ? (
              formatEGP(shipping)
            ) : (
              <span className="text-muted-foreground">—</span>
            )
          }
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
