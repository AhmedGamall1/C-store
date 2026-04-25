import { Link } from 'react-router'
import { useEffect, useState } from 'react'
import { Eye, Loader2, Search } from 'lucide-react'
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
import { Pagination } from '@/components/product/Pagination'
import { useAdminOrders } from '@/hooks/useOrders'
import { formatDate, formatEGP } from '@/lib/utils'

const PAGE_SIZE = 20

const STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]

const PAYMENT_STATUSES = ['UNPAID', 'PAID', 'REFUNDED', 'FAILED']
const PAYMENT_METHODS = ['COD', 'PAYMOB']

const titleCase = (s) => s.charAt(0) + s.slice(1).toLowerCase()

export default function AdminOrdersPage() {
  const [searchInput, setSearchInput] = useState('')
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [paymentStatus, setPaymentStatus] = useState('all')
  const [paymentMethod, setPaymentMethod] = useState('all')
  const [page, setPage] = useState(1)

  // Debounce search input → server query
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(searchInput.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  // Reset to page 1 whenever a server filter changes
  useEffect(() => {
    setPage(1)
  }, [status, paymentStatus, paymentMethod])

  const filters = {
    page,
    limit: PAGE_SIZE,
    ...(q && { q }),
    ...(status !== 'all' && { status }),
    ...(paymentStatus !== 'all' && { paymentStatus }),
    ...(paymentMethod !== 'all' && { paymentMethod }),
  }

  const { data, isLoading, isFetching } = useAdminOrders(filters)
  const orders = data?.orders ?? []
  const pagination = data?.pagination

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
            {pagination
              ? `${orders.length} of ${pagination.total} orders`
              : 'Loading…'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-background p-4">
        <div className="relative min-w-55 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order #, name, email, or phone…"
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {titleCase(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={paymentStatus} onValueChange={setPaymentStatus}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payments</SelectItem>
            {PAYMENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {titleCase(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All methods</SelectItem>
            {PAYMENT_METHODS.map((m) => (
              <SelectItem key={m} value={m}>
                {m === 'PAYMOB' ? 'Paymob' : 'COD'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isFetching && !isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : null}
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
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-16 text-center text-sm text-muted-foreground"
                >
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No orders match your filters.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => {
                const name = o.user
                  ? `${o.user.firstName} ${o.user.lastName}`
                  : (o.guestName ?? '—')
                const email = o.user?.email ?? o.guestEmail ?? ''
                const ref = `#${o.orderNumber ?? o.id.slice(0, 8)}`
                return (
                  <TableRow key={o.id}>
                    <TableCell>
                      <Link
                        to={`/admin/orders/${o.id}`}
                        className="font-semibold tabular hover:underline"
                      >
                        {ref}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {o.items.length}{' '}
                        {o.items.length === 1 ? 'item' : 'items'}
                        {!o.user ? ' · guest' : ''}
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
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 ? (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onChange={setPage}
        />
      ) : null}
    </div>
  )
}
