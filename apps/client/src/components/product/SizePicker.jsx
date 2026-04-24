import { cn } from '@/lib/utils'

export function SizePicker({ sizes = [], value, onChange = () => {} }) {
  const selected = sizes.find((s) => s.id === value) ?? null

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.2em]">
          Size
          {selected ? (
            <span className="text-muted-foreground"> · {selected.size}</span>
          ) : null}
        </span>
        <button className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">
          Size guide
        </button>
      </div>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {sizes.map((s) => {
          const isActive = value === s.id
          const isOut = s.stock === 0
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => !isOut && onChange(s.id)}
              disabled={isOut}
              title={isOut ? 'Out of stock' : `${s.stock} in stock`}
              className={cn(
                'relative h-11 overflow-hidden rounded-md border text-sm font-semibold uppercase tracking-wide transition-colors',
                isActive
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border hover:border-foreground',
                isOut &&
                  'cursor-not-allowed text-muted-foreground hover:border-border'
              )}
            >
              <span className="relative z-10">{s.size}</span>
              {isOut ? (
                <svg
                  aria-hidden
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="100"
                    y2="100"
                    stroke="#dc2626"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              ) : null}
            </button>
          )
        })}
      </div>
      {selected ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {selected.stock > 0
            ? `${selected.stock} in stock`
            : 'Out of stock'}
        </p>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">Select a size</p>
      )}
    </div>
  )
}
