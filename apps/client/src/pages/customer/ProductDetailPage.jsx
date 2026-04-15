import { useParams, Link } from 'react-router'
import {
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  ShoppingBag,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductGallery } from '@/components/product/ProductGallery'
import { SizePicker } from '@/components/product/SizePicker'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Reviews } from '@/components/product/Reviews'
import { StarRating } from '@/components/product/StarRating'
import { SectionHeader } from '@/components/common/SectionHeader'
import {
  getProductBySlug,
  getRelatedProducts,
  PRODUCTS,
} from '@/data/products'
import { getReviewsForProduct } from '@/data/reviews'
import { formatEGP } from '@/lib/utils'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const product = getProductBySlug(slug) || PRODUCTS[0]
  const related = getRelatedProducts(product)
  const reviews = getReviewsForProduct(product.id)

  const onSale =
    product.comparePrice && Number(product.comparePrice) > Number(product.price)
  const soldOut = product.stock === 0

  return (
    <>
      <div className="container-page py-8">
        {/* Breadcrumb */}
        <nav className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-foreground">
            Shop
          </Link>
          <span className="mx-2">/</span>
          <Link
            to={`/shop?category=${product.category.slug}`}
            className="hover:text-foreground"
          >
            {product.category.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Main grid */}
        <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          {/* Gallery */}
          <ProductGallery images={product.images} alt={product.name} />

          {/* Info */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {product.category.name}
                </span>
                {product.tag ? <Badge variant="outline">{product.tag}</Badge> : null}
              </div>
              <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <StarRating value={product.rating} size={14} />
                <span className="text-sm text-muted-foreground">
                  {product.rating.toFixed(1)} · {product.reviewCount} reviews
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-display text-3xl font-bold tabular">
                {formatEGP(product.price)}
              </span>
              {onSale ? (
                <span className="text-muted-foreground line-through tabular">
                  {formatEGP(product.comparePrice)}
                </span>
              ) : null}
              {onSale ? (
                <Badge variant="destructive">
                  Save{' '}
                  {formatEGP(
                    Number(product.comparePrice) - Number(product.price)
                  )}
                </Badge>
              ) : null}
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <Separator />

            {/* Size */}
            <SizePicker sizes={product.sizes} />

            {/* Quantity + Add to cart */}
            <div className="flex items-stretch gap-3">
              <div className="inline-flex items-center rounded-md border">
                <button
                  type="button"
                  className="grid h-12 w-10 place-items-center text-muted-foreground hover:text-foreground"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-[3ch] px-2 text-center text-sm tabular">
                  1
                </span>
                <button
                  type="button"
                  className="grid h-12 w-10 place-items-center text-muted-foreground hover:text-foreground"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button size="xl" className="flex-1" disabled={soldOut}>
                <ShoppingBag className="h-4 w-4" />
                {soldOut ? 'Sold Out' : 'Add to Cart'}
              </Button>
              <Button size="xl" variant="outline" aria-label="Add to wishlist">
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            {/* Stock indicator */}
            {!soldOut && product.stock < 10 ? (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                Only {product.stock} left
              </p>
            ) : null}

            {/* Perks */}
            <ul className="space-y-2 rounded-lg border p-4 text-sm">
              <Perk icon={Truck} title="Free Cairo & Giza shipping" desc="On orders over 2,000 EGP" />
              <Perk icon={RotateCcw} title="14-day returns" desc="No questions asked" />
              <Perk icon={ShieldCheck} title="Secure checkout" desc="Paymob encrypted payments or COD" />
            </ul>
          </div>
        </div>

        {/* Details tabs */}
        <div className="mt-20">
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="sizing">Sizing</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              <ul className="space-y-2">
                <li>• 100% heavyweight combed cotton (280 gsm)</li>
                <li>• Pre-washed for minimal shrinkage</li>
                <li>• Ribbed collar with reinforced stitching</li>
                <li>• Boxy street fit — true to size</li>
                <li>• Cut and sewn in Cairo, Egypt</li>
              </ul>
            </TabsContent>
            <TabsContent value="sizing" className="mt-6 max-w-3xl text-sm text-muted-foreground">
              Model is 183cm / 78kg and wears size M. For a relaxed fit, size up.
            </TabsContent>
            <TabsContent value="shipping" className="mt-6 max-w-3xl text-sm text-muted-foreground">
              Ships within 1–2 business days. Cairo & Giza arrive in 2–3 days;
              other governorates 3–6 days. Cash on delivery available everywhere.
            </TabsContent>
            <TabsContent value="reviews" className="mt-8">
              <Reviews
                reviews={reviews}
                rating={product.rating}
                total={product.reviewCount}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Related */}
        <section className="mt-20">
          <SectionHeader
            eyebrow="You might also like"
            title="More in this drop"
            linkLabel="See all"
            linkTo={`/shop?category=${product.category.slug}`}
          />
          <ProductGrid products={related} className="mt-10" />
        </section>
      </div>
    </>
  )
}

function Perk({ icon: Icon, title, desc }) {
  return (
    <li className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </li>
  )
}
