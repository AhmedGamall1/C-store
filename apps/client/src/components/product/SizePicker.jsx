import { useState } from 'react'
import { cn } from '@/lib/utils'

export function SizePicker({ sizes = [], onChange = () => {} }) {
  const [size, setSize] = useState(null)

  const pick = (s) => {
    setSize(s)
    onChange(s)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.2em]">
          Size {size ? <span className="text-muted-foreground">· {size}</span> : null}
        </span>
        <button className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">
          Size guide
        </button>
      </div>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {sizes.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => pick(s)}
            className={cn(
              'h-11 rounded-md border text-sm font-semibold uppercase tracking-wide transition-colors',
              size === s
                ? 'border-foreground bg-foreground text-background'
                : 'border-border hover:border-foreground'
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
