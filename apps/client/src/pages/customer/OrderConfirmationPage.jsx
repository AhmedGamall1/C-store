import { Link, useParams } from 'react-router'
import { Check, Package, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CART_ITEMS, cartSubtotal } from '@/data/cart'
import { ADDRESSES } from '@/data/user'
import { formatEGP } from '@/lib/utils'

export default function OrderConfirmationPage() {
  const { id } = useParams()
  const items = CART_ITEMS
  const subtotal = cartSubtotal(items)
  const shipping = 30
  const total = subtotal + shipping

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
          Thanks for the order. Your confirmation is on its way to your inbox.
        </p>
        <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm">
          <span className="text-muted-foreground">Order</span>
          <span className="font-semibold tabular">{id || 'ord-demo'}</span>
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
            Order Summary
          </h2>
          <ul className="mt-5 space-y-4">
            {items.map((item) => (
              <li key={item.id} className="flex gap-4">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                  <img
                    src={item.product.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Size {item.size} · Qty {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold tabular">
                  {formatEGP(Number(item.product.price) * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        <div className="space-y-2 p-6 text-sm">
          <Row label="Subtotal" value={formatEGP(subtotal)} />
          <Row label="Shipping" value={formatEGP(shipping)} />
          <Separator className="my-2" />
          <Row
            label="Total"
            value={formatEGP(total)}
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
              {ADDRESSES[0].city}, {ADDRESSES[0].governorate}
            </p>
            <p className="text-muted-foreground">{ADDRESSES[0].street}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Payment method
            </p>
            <p className="mt-1 font-medium">Paymob (online card)</p>
            <p className="text-muted-foreground">Paid · Confirmed</p>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button asChild size="lg">
          <Link to={`/account/orders/${id || 'ord-demo-1234'}`}>View order</Link>
        </Button>
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
