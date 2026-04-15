import { Link } from 'react-router'
import { Heart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, formatEGP } from '@/lib/utils'

export function ProductCard({ product, className }) {
  const soldOut = product.stock === 0
  const onSale = product.comparePrice && Number(product.comparePrice) > Number(product.price)
  const discountPct = onSale
    ? Math.round(
        ((Number(product.comparePrice) - Number(product.price)) /
          Number(product.comparePrice)) *
          100
      )
    : 0

  return (
    <article className={cn('group relative flex flex-col', className)}>
      <Link
        to={`/product/${product.slug}`}
        className="relative block overflow-hidden rounded-md bg-secondary"
        aria-label={product.name}
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="aspect-product w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />

        {/* tag badge */}
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {product.tag ? (
            <Badge
              variant={
                product.tag === 'Sold Out'
                  ? 'secondary'
                  : product.tag === 'Low Stock'
                    ? 'warning'
                    : product.tag === 'New'
                      ? 'accent'
                      : 'default'
              }
            >
              {product.tag}
            </Badge>
          ) : null}
          {onSale && !soldOut ? (
            <Badge variant="destructive">-{discountPct}%</Badge>
          ) : null}
        </div>

        {/* wishlist */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-3 top-3 h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
          aria-label="Add to wishlist"
          onClick={(e) => e.preventDefault()}
        >
          <Heart className="h-4 w-4" />
        </Button>

        {/* Add to cart overlay */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
          <Button
            className="w-full"
            disabled={soldOut}
            onClick={(e) => e.preventDefault()}
          >
            {soldOut ? 'Sold Out' : 'Quick Add'}
          </Button>
        </div>
      </Link>

      <div className="mt-3 flex flex-1 flex-col gap-1 px-0.5">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {product.category.name}
        </p>
        <Link
          to={`/product/${product.slug}`}
          className="line-clamp-1 text-sm font-medium hover:underline"
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-sm font-semibold tabular">
            {formatEGP(product.price)}
          </span>
          {onSale ? (
            <span className="text-xs text-muted-foreground line-through tabular">
              {formatEGP(product.comparePrice)}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  )
}
