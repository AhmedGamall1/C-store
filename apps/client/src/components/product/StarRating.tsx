import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StarRating({ value = 0, size = 14, className }) {
  const full = Math.floor(value)
  return (
    <div className={cn('inline-flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          width={size}
          height={size}
          className={cn(
            'shrink-0',
            i <= full
              ? 'fill-foreground text-foreground'
              : 'text-muted-foreground'
          )}
        />
      ))}
    </div>
  )
}
