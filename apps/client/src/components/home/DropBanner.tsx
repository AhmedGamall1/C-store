import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'

export function DropBanner() {
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
            {/* Fixed brand asset */}
            <img
              src="/DROP-BANNER.webp"
              alt="New arrivals — just dropped"
              className="aspect-4/3 w-full object-cover md:aspect-auto md:h-full"
            />
          </div>
        </div>
      </Link>
    </section>
  )
}
