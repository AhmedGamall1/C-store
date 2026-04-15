import { useState } from 'react'
import { cn } from '@/lib/utils'

export function ProductGallery({ images, alt }) {
  const [active, setActive] = useState(0)
  const main = images?.[active] || images?.[0]

  return (
    <div className="grid gap-3 lg:grid-cols-[80px_1fr]">
      {/* Thumbs */}
      <div className="order-2 flex gap-2 overflow-x-auto no-scrollbar lg:order-1 lg:flex-col">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              'relative shrink-0 overflow-hidden rounded-md bg-secondary transition-all',
              'h-20 w-16 lg:h-24 lg:w-full',
              i === active
                ? 'ring-2 ring-foreground ring-offset-2'
                : 'opacity-70 hover:opacity-100'
            )}
            aria-label={`View image ${i + 1}`}
          >
            <img src={src} alt="" className="aspect-product h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {/* Main */}
      <div className="order-1 overflow-hidden rounded-lg bg-secondary lg:order-2">
        <img
          src={main}
          alt={alt}
          className="aspect-product w-full object-cover"
        />
      </div>
    </div>
  )
}
