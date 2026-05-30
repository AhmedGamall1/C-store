import { Loader2 } from 'lucide-react'
import { SectionHeader } from '@/components/common/SectionHeader'
import { ProductGrid } from '@/components/product/ProductGrid'
import { useProducts } from '@/hooks/useProducts'

export function BestSellers() {
  // Fetch newest 8 products — closest to "bestsellers" without a sales-count field
  const { data, isLoading } = useProducts({
    limit: 8,
    sortBy: 'createdAt',
    order: 'desc',
  })
  const products = data?.products ?? []

  return (
    <section className="container-page py-20">
      <SectionHeader
        eyebrow="Most Wanted"
        title="Bestsellers"
        description="The pieces flying off the shelves this month."
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
