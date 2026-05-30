import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SectionHeader({
  eyebrow,
  title,
  description,
  linkLabel,
  linkTo,
  align = 'left',
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'sm:flex-col sm:items-center sm:text-center',
        className
      )}
    >
      <div className="space-y-2">
        {eyebrow ? (
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {eyebrow}
          </span>
        ) : null}
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {linkTo && linkLabel ? (
        <Link
          to={linkTo}
          className="group inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  )
}
