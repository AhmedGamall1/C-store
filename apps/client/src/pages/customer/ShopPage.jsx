import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductFilters } from '@/components/product/ProductFilters'
import { Pagination } from '@/components/product/Pagination'
import { PRODUCTS } from '@/data/products'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'bestsellers', label: 'Bestsellers' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Alphabetical' },
]

export default function ShopPage() {
  const [page, setPage] = useState(1)
  const products = PRODUCTS

  return (
    <>
      {/* Page header */}
      <section className="border-b bg-secondary/30">
        <div className="container-page py-10">
          <nav className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span className="text-foreground">Shop</span>
          </nav>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Shop All
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {products.length} pieces. Shirts, jeans and sweaters built to wear
            through seasons.
          </p>
        </div>
      </section>

      <div className="container-page py-10">
        <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
          {/* Desktop filters */}
          <div className="hidden lg:block">
            <ProductFilters />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* Mobile filters */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <ProductFilters />
                    </div>
                  </SheetContent>
                </Sheet>

                <ActiveFilters />
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden text-xs uppercase tracking-wider text-muted-foreground sm:inline">
                  Sort by
                </span>
                <Select defaultValue="newest">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Grid */}
            <ProductGrid products={products} />

            {/* Pagination */}
            <div className="pt-8">
              <Pagination page={page} totalPages={3} onChange={setPage} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function ActiveFilters() {
  const chips = ['Shirts', 'Size: M', 'In stock']
  return (
    <div className="hidden items-center gap-2 sm:flex">
      {chips.map((chip) => (
        <Badge key={chip} variant="outline" className="gap-1.5 normal-case tracking-normal font-medium">
          {chip}
          <button aria-label={`Remove ${chip}`}>
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <button className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground">
        Clear all
      </button>
    </div>
  )
}
