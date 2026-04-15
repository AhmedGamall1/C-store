import { Link } from 'react-router'
import { useState } from 'react'
import { Eye, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from '@/components/common/OrderStatusBadge'
import { ALL_ORDERS } from '@/data/orders'
import { formatDate, formatEGP } from '@/lib/utils'

const STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]

export default function AdminOrdersPage() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')

  const filtered = ALL_ORDERS.filter((o) => {
    const name = o.user
      ? `${o.user.firstName} ${o.user.lastName}`
      : ''
    const matchQ =
      !q ||
      o.id.toLowerCase().includes(q.toLowerCase()) ||
      name.toLowerCase().includes(q.toLowerCase())
    const matchS = status === 'all' || o.status === status
    return matchQ && matchS
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Operations
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
            Orders
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} of {ALL_ORDERS.length} orders
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-background p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order ID or customer…"
            className="pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Placed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((o) => {
              const name = o.user
                ? `${o.user.firstName} ${o.user.lastName}`
                : '—'
              const email = o.user?.email ?? ''
              return (
                <TableRow key={o.id}>
                  <TableCell>
                    <Link
                      to={`/admin/orders/${o.id}`}
                      className="font-semibold tabular hover:underline"
                    >
                      {o.id}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {o.items.length}{' '}
                      {o.items.length === 1 ? 'item' : 'items'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">{email}</p>
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={o.status} />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <PaymentStatusBadge status={o.paymentStatus} />
                      <p className="text-xs text-muted-foreground">
                        {o.paymentMethod === 'PAYMOB' ? 'Paymob' : 'COD'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular">
                    {formatEGP(o.total)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(o.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        aria-label="View"
                      >
                        <Link to={`/admin/orders/${o.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No orders match your filters.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
