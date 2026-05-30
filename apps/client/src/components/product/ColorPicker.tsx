import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export function ColorPicker({ colors = [], value, onChange = () => {} }) {
  const selected = colors.find((c) => c.id === value) ?? null

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.2em]">
          Color
          {selected ? (
            <span className="text-muted-foreground"> · {selected.name}</span>
          ) : null}
        </span>
        <span className="text-xs text-muted-foreground">
          {colors.length} {colors.length === 1 ? 'option' : 'options'}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {colors.map((c) => {
          const isActive = value === c.id
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange(c.id)}
              title={c.name}
              aria-label={c.name}
              className={cn(
                'relative h-12 w-12 overflow-hidden rounded-md border-2 transition-all',
                isActive
                  ? 'border-foreground ring-2 ring-foreground ring-offset-2'
                  : 'border-border hover:border-foreground'
              )}
            >
              {c.imageUrl ? (
                <img
                  src={c.imageUrl}
                  alt={c.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span
                  className="block h-full w-full"
                  style={{ backgroundColor: c.hex || '#ddd' }}
                />
              )}
              {isActive ? (
                <span className="pointer-events-none absolute inset-0 grid place-items-center bg-black/30">
                  <Check className="h-4 w-4 text-white" />
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
