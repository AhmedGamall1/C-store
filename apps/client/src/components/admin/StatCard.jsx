import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StatCard({ label, value, change, icon: Icon }) {
  const trendUp = change != null && change >= 0
  return (
    <div className="rounded-lg border bg-background p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          {label}
        </p>
        {Icon ? (
          <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary">
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-3xl font-bold tabular">{value}</p>
      {change != null ? (
        <div
          className={cn(
            'mt-2 inline-flex items-center gap-1 text-xs font-medium',
            trendUp ? 'text-emerald-600' : 'text-red-600'
          )}
        >
          {trendUp ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {Math.abs(change)}% vs last month
        </div>
      ) : null}
    </div>
  )
}
