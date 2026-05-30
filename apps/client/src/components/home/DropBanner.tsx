import { Link } from 'react-router'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'

export function DropBanner() {
  // Use the newest product's real image as the banner visual.
  const { data, isLoading } = useProducts({
    limit: 1,
    sortBy: 'createdAt',
    order: 'desc',
  })
  const product = data?.products?.[0]

  // Nothing to show yet — hide the banner instead of a broken image.
  if (!isLoading && !product) return null

  return (
    <section className="container-page py-10">
      <Link
        to="/shop?sort=newest"
        className="group relative block overflow-hidden rounded-lg border bg-secondary"
      >
        <div className="grid items-center gap-0 md:grid-cols-[1.2fr_1fr]">
          <div className="p-8 sm:p-12">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Just dropped
            </span>
            <h3 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
              New in store
              <br />
              — shop the latest.
            </h3>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Fresh pieces, added regularly. Premium quality, delivered across
              Egypt with card or cash on delivery.
            </p>
            <div className="mt-6 inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wider">
              Shop new arrivals
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
          <div className="relative">
            {isLoading ? (
              <div className="grid aspect-[4/3] w-full place-items-center md:h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="aspect-[4/3] w-full object-cover md:aspect-auto md:h-full"
              />
            )}
          </div>
        </div>
      </Link>
    </section>
  )
}
