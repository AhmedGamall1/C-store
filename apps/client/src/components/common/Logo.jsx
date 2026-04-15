import { Link } from 'react-router'
import { cn } from '@/lib/utils'

export function Logo({ className, to = '/' }) {
  return (
    <Link
      to={to}
      className={cn(
        'group inline-flex items-center gap-1 font-display text-xl font-bold tracking-tight',
        className
      )}
    >
      <span className="inline-grid h-7 w-7 place-items-center rounded-sm bg-foreground text-background transition-transform group-hover:-rotate-6">
        C
      </span>
      <span className="uppercase">-Store</span>
    </Link>
  )
}
