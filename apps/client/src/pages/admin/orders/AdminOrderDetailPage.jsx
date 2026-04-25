import { Link, useParams, useNavigate } from 'react-router'
import { useState } from 'react'
import { ArrowLeft, Loader2, Package, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
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
import { useAdminOrder, useUpdateOrderStatus } from '@/hooks/useOrders'
import { formatDate, formatEGP, cn } from '@/lib/utils'

// Mirrors backend VALID_TRANSITIONS in apps/server/src/services/order.service.js
const TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
}

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: order, isLoading, isError } = useAdminOrder(id)
  const updateStatus = useUpdateOrderStatus()
  const [nextStatus, setNextStatus] = useState('')

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !order) {
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
    : (order.guestName ?? 'Guest customer')
  const email = order.user?.email ?? order.guestEmail ?? ''
  const phone = order.guestPhone

  const ref = `#${order.orderNumber ?? order.id.slice(0, 8)}`

  // Address: saved address for users, snapshot fields for guests
  const street = order.address?.street ?? order.shippingStreet
  const city = order.address?.city ?? order.shippingCity
  const governorate = order.address?.governorate ?? order.shippingGovernorate

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!nextStatus) return
    updateStatus.mutate(
      { id: order.id, status: nextStatus },
      { onSuccess: () => setNextStatus('') }
    )
  }

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
              {ref}
            </h1>
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {formatDate(order.createdAt)} · {customer}
            {!order.user ? ' (guest)' : ''}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Main column */}
        <div className="space-y-6">
          {/* Items */}
          <Panel title="Items" subtitle={`${order.items.length} line items`}>
            <ul className="divide-y">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4 py-4 first:pt-0">
                  <div
                    className="h-10 w-10 shrink-0 rounded-md border"
                    style={{ backgroundColor: item.colorHex || '#e5e5e5' }}
                    aria-hidden
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.colorName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Size {item.size} · Qty {item.quantity}
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

          {order.notes ? (
            <Panel title="Customer notes">
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </Panel>
          ) : null}
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
              <form onSubmit={handleSubmit} className="grid gap-3">
                <Label htmlFor="new-status">Move to</Label>
                <Select
                  value={nextStatus}
                  onValueChange={setNextStatus}
                >
                  <SelectTrigger id="new-status">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    {nextStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!nextStatus || updateStatus.isPending}
                >
                  {updateStatus.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Update status
                </Button>
              </form>
            )}
          </Panel>

          {/* Customer */}
          <Panel title="Customer" compact>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{customer}</p>
              {email ? (
                <p className="text-muted-foreground">{email}</p>
              ) : null}
              {phone ? (
                <p className="text-muted-foreground">{phone}</p>
              ) : null}
              {!order.user ? (
                <p className="pt-2 text-xs uppercase tracking-wider text-muted-foreground">
                  Guest checkout
                </p>
              ) : null}
            </div>
          </Panel>

          {/* Shipping */}
          <Panel title="Shipping address" compact>
            {street || city || governorate ? (
              <>
                <p className="font-medium">
                  {[city, governorate].filter(Boolean).join(', ')}
                </p>
                {street ? (
                  <p className="mt-1 text-sm text-muted-foreground">{street}</p>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No address on file</p>
            )}
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
