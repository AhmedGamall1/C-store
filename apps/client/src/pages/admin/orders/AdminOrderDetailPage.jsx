import { Link, useParams, useNavigate } from 'react-router'
import { ArrowLeft, Printer, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from '@/components/common/OrderStatusBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { Package } from 'lucide-react'
import { getOrderById } from '@/data/orders'
import { formatDate, formatEGP, cn } from '@/lib/utils'

// Valid next statuses per backend state machine
const TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const order = getOrderById(id)

  if (!order) {
    return (
      <EmptyState
        icon={Package}
        title="Order not found"
        description="We couldn't locate an order with that ID."
        action={
          <Button asChild variant="outline">
            <Link to="/admin/orders">
              <ArrowLeft className="h-4 w-4" />
              Back to orders
            </Link>
          </Button>
        }
      />
    )
  }

  const nextStatuses = TRANSITIONS[order.status] ?? []
  const customer = order.user
    ? `${order.user.firstName} ${order.user.lastName}`
    : 'Customer'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl font-bold tracking-tight tabular">
              {order.id}
            </h1>
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {formatDate(order.createdAt)} · {customer}
          </p>
        </div>
        <Button variant="outline">
          <Printer className="h-4 w-4" />
          Print invoice
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Main column */}
        <div className="space-y-6">
          {/* Items */}
          <Panel title="Items" subtitle={`${order.items.length} line items`}>
            <ul className="divide-y">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4 py-4 first:pt-0">
                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                    <img
                      src={item.product.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {item.product.category.name}
                    </p>
                    <p className="mt-1 font-medium">{item.product.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Size {item.size} · SKU {item.product.sku}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm tabular">
                      {formatEGP(item.price)} × {item.quantity}
                    </p>
                    <p className="mt-1 font-semibold tabular">
                      {formatEGP(Number(item.price) * item.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <Separator className="my-4" />

            <dl className="space-y-2 text-sm">
              <Row label="Subtotal" value={formatEGP(order.subtotal)} />
              <Row label="Shipping" value={formatEGP(order.shippingCost)} />
              <Separator className="my-2" />
              <Row
                label="Total"
                value={formatEGP(order.total)}
                className="text-base font-semibold"
              />
            </dl>
          </Panel>

          {/* Internal notes */}
          <Panel
            title="Internal notes"
            subtitle="Only visible to admins"
          >
            <Textarea
              rows={3}
              placeholder="Add a note about this order…"
            />
            <div className="mt-3 flex justify-end">
              <Button size="sm" variant="outline">
                Save note
              </Button>
            </div>
          </Panel>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Status update */}
          <Panel title="Update status" compact>
            {nextStatuses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                This order is in a terminal state. No further transitions
                allowed.
              </p>
            ) : (
              <form
                onSubmit={(e) => e.preventDefault()}
                className="grid gap-3"
              >
                <Label htmlFor="new-status">Move to</Label>
                <Select defaultValue={nextStatuses[0]}>
                  <SelectTrigger id="new-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {nextStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" size="sm">
                  <Save className="h-4 w-4" />
                  Update status
                </Button>
              </form>
            )}
          </Panel>

          {/* Customer */}
          <Panel title="Customer" compact>
            {order.user ? (
              <div className="space-y-1 text-sm">
                <p className="font-medium">{customer}</p>
                <p className="text-muted-foreground">{order.user.email}</p>
                <p className="pt-2 text-xs">
                  <Link
                    to={`/admin/customers/${order.user.id}`}
                    className="text-foreground underline underline-offset-4 hover:no-underline"
                  >
                    View customer
                  </Link>
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">You</p>
            )}
          </Panel>

          {/* Shipping */}
          <Panel title="Shipping address" compact>
            <p className="font-medium">
              {order.address.city}, {order.address.governorate}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.address.street}
            </p>
          </Panel>

          {/* Payment */}
          <Panel title="Payment" compact>
            <p className="font-medium">
              {order.paymentMethod === 'PAYMOB'
                ? 'Paymob (online card)'
                : 'Cash on Delivery'}
            </p>
            {order.paymobOrderId ? (
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                Ref: {order.paymobOrderId}
              </p>
            ) : null}
          </Panel>
        </aside>
      </div>
    </div>
  )
}

function Panel({ title, subtitle, compact, children }) {
  return (
    <section
      className={cn(
        'rounded-lg border bg-background',
        compact ? 'p-4' : 'p-6'
      )}
    >
      <header>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </header>
      <div className={compact ? 'mt-3' : 'mt-4'}>{children}</div>
    </section>
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
