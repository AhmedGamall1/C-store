import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CheckoutSteps({ steps, current }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-4">
      {steps.map((label, i) => {
        const active = i === current
        const done = i < current
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'grid h-7 w-7 place-items-center rounded-full border-[1.5px] text-xs font-semibold tabular',
                  done && 'border-foreground bg-foreground text-background',
                  active && !done && 'border-foreground text-foreground',
                  !active && !done && 'border-border text-muted-foreground'
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  'hidden text-xs font-semibold uppercase tracking-[0.15em] sm:inline',
                  active || done ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 ? (
              <span
                className={cn(
                  'h-px w-8 sm:w-12',
                  done ? 'bg-foreground' : 'bg-border'
                )}
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
