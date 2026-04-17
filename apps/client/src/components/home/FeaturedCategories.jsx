import { Link } from 'react-router'
import { ArrowRight, Loader2 } from 'lucide-react'
import { SectionHeader } from '@/components/common/SectionHeader'
import { useCategories } from '@/hooks/useCategories'

export function FeaturedCategories() {
  const { data: categories = [], isLoading } = useCategories()

  return (
    <section className="container-page py-20">
      <SectionHeader
        eyebrow="Shop by"
        title="Categories"
        description="Three staples. Built to layer, mix, wear out."
        linkLabel="Shop all"
        linkTo="/shop"
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {categories.map((c, i) => (
            <Link
              key={c.id}
              to={`/shop?category=${c.slug}`}
              className="group relative overflow-hidden rounded-lg bg-secondary"
            >
              <img
                src={c.imageUrl}
                alt={c.name}
                loading={i === 0 ? 'eager' : 'lazy'}
                className="aspect-4/5 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-background">
                <h3 className="font-display text-2xl font-bold uppercase tracking-tight">
                  {c.name}
                </h3>
                <p className="mt-1 max-w-xs text-sm text-background/80">
                  {c.description}
                </p>
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em]">
                  Shop {c.name}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
