import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ProductGallery({ images = [], alt }) {
  const [active, setActive] = useState(0)
  const safeIndex = Math.min(active, Math.max(images.length - 1, 0))
  const main = images[safeIndex]

  const prev = () =>
    setActive((i) => (i - 1 + images.length) % Math.max(images.length, 1))
  const next = () => setActive((i) => (i + 1) % Math.max(images.length, 1))

  if (!images.length) {
    return <div className="aspect-product w-full rounded-lg bg-secondary" />
  }

  return (
    <div className="grid gap-3 lg:grid-cols-[88px_1fr]">
      {/* Thumbs */}
      <div className="order-2 flex gap-2 overflow-x-auto no-scrollbar lg:order-1 lg:flex-col">
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              'relative shrink-0 overflow-hidden rounded-md border bg-secondary transition-all',
              'h-20 w-16 lg:h-24 lg:w-full',
              i === safeIndex
                ? 'border-foreground ring-2 ring-foreground ring-offset-2'
                : 'border-border hover:border-foreground'
            )}
            aria-label={`View image ${i + 1}`}
            aria-current={i === safeIndex}
          >
            <img
              src={src}
              alt=""
              className="aspect-product h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main */}
      <div className="order-1 group relative overflow-hidden rounded-lg border bg-secondary lg:order-2">
        <img
          src={main}
          alt={alt}
          className="aspect-product w-full  object-cover"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur-sm transition hover:bg-background lg:opacity-0 lg:group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur-sm transition hover:bg-background lg:opacity-0 lg:group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium tabular backdrop-blur-sm">
              {safeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
