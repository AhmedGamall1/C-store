import { Link, useParams } from 'react-router'
import { ArrowLeft, Check, Package, Truck, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from '@/components/common/OrderStatusBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { getMyOrderById } from '@/data/orders'
import { formatDate, formatEGP, cn } from '@/lib/utils'

const STAGES = [
  { key: 'CONFIRMED', label: 'Confirmed', icon: Check },
  { key: 'PROCESSING', label: 'Processing', icon: Package },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: Check },
]

const STAGE_INDEX = {
  PENDING: -1,
  CONFIRMED: 0,
  PROCESSING: 1,
  SHIPPED: 2,
  DELIVERED: 3,
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const order = getMyOrderById(id)

  if (!order) {
    return (
      <EmptyState
        icon={Package}
        title="Order not found"
        description="We couldn't locate an order with that ID."
        action={
          <Button asChild variant="outline">
            <Link to="/account/orders">
              <ArrowLeft className="h-4 w-4" />
              Back to orders
            </Link>
          </Button>
        }
      />
    )
  }

  const cancelled = order.status === 'CANCELLED'
  const current = STAGE_INDEX[order.status] ?? -1

  return (
    <div className="space-y-10">
      <div>
        <Link
          to="/account/orders"
          className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All orders
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-2xl font-bold tabular">
                {order.id}
              </h2>
              <OrderStatusBadge status={order.status} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Placed {formatDate(order.createdAt)}
            </p>
          </div>
          {!cancelled && ['PENDING', 'CONFIRMED'].includes(order.status) ? (
            <Button variant="outline" size="sm">
              <XCircle className="h-4 w-4" />
              Cancel order
            </Button>
          ) : null}
        </div>
      </div>

      {/* Timeline */}
      {cancelled ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="font-medium text-destructive">This order was cancelled.</p>
          <p className="mt-1 text-destructive/80">
            No further action needed. Any authorized payment has been released.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border p-6">
          <div className="grid grid-cols-4 gap-3">
            {STAGES.map((s, i) => {
              const done = i < current
              const active = i === current
              const Icon = s.icon
              return (
                <div key={s.key} className="flex flex-col items-center text-center">
                  <span
                    className={cn(
                      'grid h-10 w-10 place-items-center rounded-full border',
                      done || active
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border text-muted-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span
                    className={cn(
                      'mt-2 text-[10px] font-semibold uppercase tracking-[0.15em]',
                      done || active ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
          {order.status === 'PENDING' && order.reservedUntil ? (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Payment reserved until{' '}
              {new Date(order.reservedUntil).toLocaleString('en-GB')}.
            </p>
          ) : null}
        </div>
      )}

      {/* Items */}
      <section>
        <h3 className="font-display text-lg font-semibold uppercase tracking-wide">
          Items
        </h3>
        <ul className="mt-4 divide-y">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-4 py-4 first:pt-0">
              <Link
                to={`/product/${item.product.slug}`}
                className="relative block h-24 w-20 shrink-0 overflow-hidden rounded-md bg-secondary"
              >
                <img
                  src={item.product.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </Link>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {item.product.category.name}
                </p>
                <Link
                  to={`/product/${item.product.slug}`}
                  className="mt-1 block font-medium hover:underline"
                >
                  {item.product.name}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  Size {item.size} · Qty {item.quantity}
                </p>
              </div>
              <p className="text-sm font-semibold tabular">
                {formatEGP(Number(item.price) * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Totals + Address */}
      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-lg border p-6">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Summary
          </h3>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Subtotal" value={formatEGP(order.subtotal)} />
            <Row label="Shipping" value={formatEGP(order.shippingCost)} />
            <Separator className="my-2" />
            <Row
              label="Total"
              value={formatEGP(order.total)}
              className="text-base font-semibold"
            />
          </dl>
        </section>
        <section className="rounded-lg border p-6">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Shipping & payment
          </h3>
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <p className="font-medium">
                {order.address.city}, {order.address.governorate}
              </p>
              <p className="text-muted-foreground">{order.address.street}</p>
            </div>
            <Separator />
            <div>
              <p className="font-medium">
                {order.paymentMethod === 'PAYMOB'
                  ? 'Paymob (online card)'
                  : 'Cash on Delivery'}
              </p>
              {order.paymobOrderId ? (
                <p className="text-xs text-muted-foreground">
                  Paymob ref: {order.paymobOrderId}
                </p>
              ) : null}
            </div>
            {order.notes ? (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Notes
                  </p>
                  <p className="mt-1 text-sm">{order.notes}</p>
                </div>
              </>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  )
}

function Row({ label, value, className }) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular">{value}</dd>
    </div>
  )
}
