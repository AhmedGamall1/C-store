import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="container-page grid gap-10 py-16 md:grid-cols-2 md:gap-16 md:py-24 lg:py-28">
        {/* Copy */}
        <div className="flex flex-col justify-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-foreground/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            New Drop · The Nile Collection
          </span>

          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            Cairo built.
            <br />
            <span className="relative inline-block">
              City proven.
              <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-accent" />
            </span>
          </h1>

          <p className="mt-6 max-w-md text-base text-muted-foreground sm:text-lg">
            Heavyweight tees, raw selvedge denim and heavy knits — cut and sewn
            in Egypt for the way you actually live.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="xl">
              <Link to="/shop">
                Shop Collection <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link to="/lookbook">Lookbook</Link>
            </Button>
          </div>

          {/* Trust */}
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span>Free Cairo & Giza shipping</span>
            <span>Cash on delivery</span>
            <span>Made in Egypt</span>
          </div>
        </div>

        {/* Image stack */}
        <div className="relative grid grid-cols-5 gap-3">
          <div className="col-span-3 overflow-hidden rounded-lg bg-secondary">
            <img
              src="https://picsum.photos/seed/cstore-hero-main/900/1200"
              alt=""
              className="aspect-[3/4] w-full object-cover"
            />
          </div>
          <div className="col-span-2 flex flex-col gap-3">
            <div className="overflow-hidden rounded-lg bg-secondary">
              <img
                src="https://picsum.photos/seed/cstore-hero-b/600/600"
                alt=""
                className="aspect-square w-full object-cover"
              />
            </div>
            <div className="flex-1 overflow-hidden rounded-lg bg-foreground p-6 text-background">
              <p className="font-display text-2xl font-semibold leading-tight">
                5,000+
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-background/70">
                pieces shipped across Egypt
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
