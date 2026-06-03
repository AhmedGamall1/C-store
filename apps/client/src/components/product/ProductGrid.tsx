import { ProductCard } from './ProductCard'
import { cn } from '@/lib/utils'

export function ProductGrid({ products, expandColors, className }) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4',
        className
      )}
    >
      {products.flatMap((p) =>
        // Shop All shows one card per color; every other grid shows one per
        // product. Products without colors always fall back to a single card.
        expandColors && p.colors?.length
          ? p.colors.map((c) => (
              <ProductCard key={`${p.id}-${c.id}`} product={p} color={c} />
            ))
          : [<ProductCard key={p.id} product={p} />]
      )}
    </div>
  )
}
