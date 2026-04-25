import { Link, useLocation, useParams } from 'react-router'
import { Check, Loader2, Package, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/providers/AuthProvider'
import { useMyOrder } from '@/hooks/useOrders'
import { formatEGP } from '@/lib/utils'

export default function OrderConfirmationPage() {
  const { id } = useParams()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  // Order pushed via navigate state on placement (works for guests too).
  // We also receive a lineSnapshots map captured from the cart pre-clear,
  // so we can show real product imagery (the order response only carries
  // OrderItem snapshot fields).
  const stateOrder = location.state?.order ?? null
  const lineSnapshots = location.state?.lineSnapshots ?? []
  const snapshotById = Object.fromEntries(
    lineSnapshots.map((s) => [s.productSizeId, s])
  )

  // Authenticated users can refetch on reload; guests rely on state.
  const { data: fetched, isLoading } = useMyOrder(
    isAuthenticated && !stateOrder ? id : undefined
  )

  const order = stateOrder ?? fetched

  if (!order && isLoading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Guest reload or unknown order — show a generic acknowledgement
  if (!order) {
    return (
      <div className="container-page max-w-2xl py-14 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent text-accent-foreground">
          <Check className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Thanks for your order!
        </h1>
        <p className="mt-3 text-muted-foreground">
          We've recorded your order. Please check your email for confirmation
          details.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link to="/shop">Keep shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  const ref = order.orderNumber ? `#${order.orderNumber}` : id
  const street = order.address?.street ?? order.shippingStreet
  const city = order.address?.city ?? order.shippingCity
  const governorate = order.address?.governorate ?? order.shippingGovernorate

  return (
    <div className="container-page max-w-3xl py-14">
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent text-accent-foreground">
          <Check className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Order placed!
        </h1>
        <p className="mt-3 text-muted-foreground">
          {order.guestEmail || isAuthenticated
            ? "Thanks for the order. A confirmation is on its way to your inbox."
            : "Thanks for the order. We'll be in touch on the phone you provided."}
        </p>
        <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm">
          <span className="text-muted-foreground">Order</span>
          <span className="font-semibold tabular">{ref}</span>
        </p>
      </div>

      {/* Status timeline */}
      <div className="mt-12 grid grid-cols-3 gap-4">
        <Stage icon={Check} label="Confirmed" active />
        <Stage icon={Package} label="Processing" />
        <Stage icon={Truck} label="Shipped" />
      </div>

      {/* Summary */}
      <div className="mt-12 rounded-lg border">
        <div className="p-6">
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
            Order summary
          </h2>
          <ul className="mt-5 space-y-4">
            {order.items.map((item) => {
              const lineTotal = Number(item.price) * item.quantity
              const snap = snapshotById[item.productSizeId]
              const title = snap?.productName ?? item.colorName
              return (
                <li key={item.id} className="flex items-start gap-4">
                  <div className="aspect-product w-14 shrink-0 overflow-hidden rounded-md border bg-secondary">
                    {snap?.imageUrl ? (
                      <img
                        src={snap.imageUrl}
                        alt={title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="h-full w-full"
                        style={{ backgroundColor: item.colorHex || '#f4f4f4' }}
                        aria-hidden
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.colorName} · Size {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold tabular">
                    {formatEGP(lineTotal)}
                  </p>
                </li>
              )
            })}
          </ul>
        </div>

        <Separator />

        <div className="space-y-2 p-6 text-sm">
          <Row label="Subtotal" value={formatEGP(order.subtotal)} />
          <Row label="Shipping" value={formatEGP(order.shippingCost)} />
          <Separator className="my-2" />
          <Row
            label="Total"
            value={formatEGP(order.total)}
            className="text-base font-semibold"
          />
        </div>

        <Separator />

        <div className="grid gap-6 p-6 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Shipping to
            </p>
            <p className="mt-1 font-medium">
              {city}
              {governorate ? `, ${governorate}` : ''}
            </p>
            {street ? (
              <p className="text-muted-foreground">{street}</p>
            ) : null}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Payment method
            </p>
            <p className="mt-1 font-medium">
              {order.paymentMethod === 'PAYMOB'
                ? 'Paymob (online card)'
                : 'Cash on Delivery'}
            </p>
            <p className="text-muted-foreground">
              {order.paymentStatus === 'PAID'
                ? 'Paid · Confirmed'
                : order.paymentMethod === 'COD'
                  ? 'Pay on delivery'
                  : 'Awaiting payment'}
            </p>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        {isAuthenticated ? (
          <Button asChild size="lg">
            <Link to={`/account/orders/${order.id}`}>View order</Link>
          </Button>
        ) : null}
        <Button asChild size="lg" variant="outline">
          <Link to="/shop">Keep shopping</Link>
        </Button>
      </div>
    </div>
  )
}

function Stage({ icon: Icon, label, active }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span
        className={
          'grid h-11 w-11 place-items-center rounded-full border ' +
          (active
            ? 'border-foreground bg-foreground text-background'
            : 'border-border text-muted-foreground')
        }
      >
        <Icon className="h-5 w-5" />
      </span>
      <span
        className={
          'text-xs font-semibold uppercase tracking-[0.2em] ' +
          (active ? 'text-foreground' : 'text-muted-foreground')
        }
      >
        {label}
      </span>
    </div>
  )
}

function Row({ label, value, className }) {
  return (
    <div className={'flex items-center justify-between ' + (className || '')}>
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular">{value}</span>
    </div>
  )
}
