import { Link } from 'react-router'
import { ArrowRight, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/common/EmptyState'
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from '@/components/common/OrderStatusBadge'
import { MY_ORDERS } from '@/data/orders'
import { formatDate, formatEGP } from '@/lib/utils'

export default function OrdersPage() {
  const orders = MY_ORDERS

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        description="Your orders will show up here once you make your first purchase."
        action={
          <Button asChild>
            <Link to="/shop">Start shopping</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">Order history</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} total.
          </p>
        </div>
      </div>

      <ul className="mt-6 space-y-4">
        {orders.map((o) => (
          <li key={o.id}>
            <Link
              to={`/account/orders/${o.id}`}
              className="group block rounded-lg border p-5 transition-colors hover:border-foreground"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold tabular">{o.id}</p>
                    <OrderStatusBadge status={o.status} />
                    <PaymentStatusBadge status={o.paymentStatus} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Placed {formatDate(o.createdAt)} ·{' '}
                    {o.items.length} {o.items.length === 1 ? 'item' : 'items'} ·{' '}
                    {o.paymentMethod === 'PAYMOB'
                      ? 'Paymob'
                      : 'Cash on Delivery'}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <p className="font-semibold tabular">{formatEGP(o.total)}</p>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                {o.items.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="relative h-14 w-11 shrink-0 overflow-hidden rounded-md bg-secondary"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
                {o.items.length > 4 ? (
                  <div className="grid h-14 w-11 shrink-0 place-items-center rounded-md border text-xs text-muted-foreground">
                    +{o.items.length - 4}
                  </div>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
