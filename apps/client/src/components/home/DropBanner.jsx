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
              Exclusive
            </span>
            <h3 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
              Raw Selvedge 501
              <br />
              — back in stock.
            </h3>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Our signature selvedge denim, woven on shuttle looms and cut right.
              Limited run — once they’re gone they’re gone.
            </p>
            <div className="mt-6 inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wider">
              Shop the drop
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
          <div className="relative">
            <img
              src="https://picsum.photos/seed/cstore-drop/900/700"
              alt=""
              className="aspect-[4/3] w-full object-cover md:aspect-auto md:h-full"
            />
          </div>
        </div>
      </Link>
    </section>
  )
}
