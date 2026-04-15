import { SectionHeader } from '@/components/common/SectionHeader'
import { ProductGrid } from '@/components/product/ProductGrid'
import { getFeaturedProducts } from '@/data/products'

export function BestSellers() {
  const products = getFeaturedProducts(8)
  return (
    <section className="container-page py-20">
      <SectionHeader
        eyebrow="Most Wanted"
        title="Bestsellers"
        description="The pieces flying off the shelves this month."
        linkLabel="View all"
        linkTo="/shop?sort=bestsellers"
      />

      <ProductGrid products={products} className="mt-10" />
    </section>
  )
}
