import { Loader2 } from 'lucide-react'
import { SectionHeader } from '@/components/common/SectionHeader'
import { ProductGrid } from '@/components/product/ProductGrid'
import { useProducts } from '@/hooks/useProducts'

export function NewArrivals() {
  // Show the newest 5 products (most recently added).
  const { data, isLoading } = useProducts({
    limit: 5,
    sortBy: 'createdAt',
    order: 'desc',
  })
  const products = data?.products ?? []

  return (
    <section className="container-page py-20">
      <SectionHeader
        eyebrow="Just In"
        title="New Arrivals"
        description="The latest pieces, fresh off the line."
        linkLabel="View all"
        linkTo="/shop"
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ProductGrid products={products} className="mt-10" />
      )}
    </section>
  )
}
