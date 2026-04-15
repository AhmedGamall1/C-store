import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function Lookbook() {
  return (
    <section className="bg-foreground py-20 text-background">
      <div className="container-page grid items-center gap-10 md:grid-cols-2">
        <div className="order-2 md:order-1">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-background/60">
            Spring / Summer 26
          </span>
          <h2 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">
            The Streets
            <br />
            of Downtown.
          </h2>
          <p className="mt-4 max-w-md text-base text-background/70">
            Shot on 35mm between Talaat Harb and Ataba. The feel of a city that
            never really slows down. See the full lookbook.
          </p>
          <Button asChild size="xl" variant="accent" className="mt-8">
            <Link to="/lookbook">View Lookbook</Link>
          </Button>
        </div>

        <div className="order-1 grid grid-cols-2 gap-3 md:order-2">
          <div className="overflow-hidden rounded-lg">
            <img
              src="https://picsum.photos/seed/cstore-look-1/700/900"
              alt=""
              className="aspect-[3/4] w-full object-cover"
            />
          </div>
          <div className="mt-10 overflow-hidden rounded-lg">
            <img
              src="https://picsum.photos/seed/cstore-look-2/700/900"
              alt=""
              className="aspect-[3/4] w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
