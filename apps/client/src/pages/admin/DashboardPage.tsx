import { Link } from 'react-router'
import {
  ArrowRight,
  ShoppingBag,
  Users,
  Package,
  DollarSign,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/admin/StatCard'
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from '@/components/common/OrderStatusBadge'
import { ALL_ORDERS } from '@/data/orders'
import { PRODUCTS } from '@/data/products'
import { formatDate, formatEGP } from '@/lib/utils'

export default function DashboardPage() {
  const recent = [...ALL_ORDERS]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const lowStock = PRODUCTS.filter((p) => p.stock > 0 && p.stock <= 10).slice(
    0,
    5
  )

  const totalRevenue = ALL_ORDERS.filter(
    (o) => o.paymentStatus === 'PAID'
  ).reduce((s, o) => s + o.total, 0)

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Overview
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
        </div>
        <Button asChild variant="outline">
          <Link to="/admin/orders">
            View all orders
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue"
          value={formatEGP(totalRevenue)}
          change={12.4}
          icon={DollarSign}
        />
        <StatCard
          label="Orders"
          value={ALL_ORDERS.length}
          change={8.2}
          icon={ShoppingBag}
        />
        <StatCard
          label="Products"
          value={PRODUCTS.length}
          change={null}
          icon={Package}
        />
        <StatCard
          label="Customers"
          value={128}
          change={-3.1}
          icon={Users}
        />
      </div>

      {/* Recent orders + Low stock */}
      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-lg border bg-background xl:col-span-2">
          <header className="flex items-center justify-between border-b p-5">
            <div>
              <h2 className="font-display text-lg font-semibold">
                Recent orders
              </h2>
              <p className="text-xs text-muted-foreground">
                Latest 5 across all statuses
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/orders">
                All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </header>
          <ul className="divide-y">
            {recent.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-secondary/30"
              >
                <div>
                  <Link
                    to={`/admin/orders/${o.id}`}
                    className="font-semibold tabular hover:underline"
                  >
                    {o.id}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {o.user?.firstName
                      ? `${o.user.firstName} ${o.user.lastName}`
                      : 'You'}{' '}
                    · {formatDate(o.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={o.status} />
                  <PaymentStatusBadge status={o.paymentStatus} />
                </div>
                <p className="font-semibold tabular">{formatEGP(o.total)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border bg-background">
          <header className="flex items-center justify-between border-b p-5">
            <div>
              <h2 className="font-display text-lg font-semibold">Low stock</h2>
              <p className="text-xs text-muted-foreground">10 or fewer in stock</p>
            </div>
          </header>
          <ul className="divide-y">
            {lowStock.length === 0 ? (
              <li className="p-5 text-sm text-muted-foreground">
                All products well stocked.
              </li>
            ) : (
              lowStock.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 p-4 hover:bg-secondary/30"
                >
                  <div className="h-12 w-10 shrink-0 overflow-hidden rounded-md bg-secondary">
                    <img
                      src={p.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <Link
                      to={`/admin/products/${p.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {p.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      SKU {p.sku}
                    </p>
                  </div>
                  <span className="tabular text-sm font-semibold">
                    {p.stock}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      {/* Sales placeholder */}
      <section className="rounded-lg border bg-background p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">Sales</h2>
            <p className="text-xs text-muted-foreground">
              Last 30 days · EGP
            </p>
          </div>
          <div className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
            <TrendingUp className="h-3 w-3" />
            +12.4%
          </div>
        </div>
        <div className="mt-6 h-48 rounded-md bg-secondary/50 bg-[linear-gradient(to_top,var(--color-secondary)_0%,transparent_100%)]">
          <div className="grid h-full grid-cols-14 items-end gap-1 px-2 py-2">
            {Array.from({ length: 14 }).map((_, i) => {
              const heights = [40, 55, 35, 70, 50, 60, 80, 65, 72, 90, 55, 78, 85, 95]
              return (
                <div
                  key={i}
                  className="rounded-t-sm bg-foreground/80"
                  style={{ height: `${heights[i]}%` }}
                />
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
