import { Link } from 'react-router'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/common/EmptyState'
import { CART_ITEMS, cartSubtotal } from '@/data/cart'
import { cn, formatEGP } from '@/lib/utils'

export default function CartPage() {
  const items = CART_ITEMS
  const subtotal = cartSubtotal(items)

  if (items.length === 0) {
    return (
      <div className="container-page py-20">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Start with our bestsellers."
          action={
            <Button asChild>
              <Link to="/shop">Shop now</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
        Cart
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {items.length} {items.length === 1 ? 'item' : 'items'} in your cart.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Items */}
        <ul className="divide-y">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4 py-6 first:pt-0">
              <Link
                to={`/product/${item.product.slug}`}
                className="relative block h-32 w-24 shrink-0 overflow-hidden rounded-md bg-secondary sm:h-40 sm:w-32"
              >
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="aspect-product h-full w-full object-cover"
                />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {item.product.category.name}
                    </p>
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="mt-1 block text-sm font-medium hover:underline sm:text-base"
                    >
                      {item.product.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Size {item.size}
                    </p>
                  </div>
                  <p className="text-sm font-semibold tabular sm:text-base">
                    {formatEGP(Number(item.product.price) * item.quantity)}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <div className="inline-flex items-center rounded-md border">
                    <button
                      type="button"
                      className="grid h-9 w-9 place-items-center text-muted-foreground hover:text-foreground"
                      aria-label="Decrease"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-[2ch] px-2 text-center text-sm tabular">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="grid h-9 w-9 place-items-center text-muted-foreground hover:text-foreground"
                      aria-label="Increase"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <aside className="h-fit lg:sticky lg:top-24">
          <div className="rounded-lg border bg-secondary/30 p-6">
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
              Order Summary
            </h2>

            <div className="mt-5 space-y-2 text-sm">
              <Row label="Subtotal" value={formatEGP(subtotal)} />
              <Row
                label="Shipping"
                value={
                  <span className="text-muted-foreground">
                    Calculated at checkout
                  </span>
                }
              />
              <Separator className="my-4" />
              <Row
                label="Total"
                value={formatEGP(subtotal)}
                className="text-base font-semibold"
              />
            </div>

            {/* Promo */}
            <div className="mt-5">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">
                Promo code
              </label>
              <div className="mt-2 flex gap-2">
                <Input placeholder="Enter code" />
                <Button variant="outline">Apply</Button>
              </div>
            </div>

            <Button asChild size="lg" className="mt-6 w-full">
              <Link to="/checkout">Proceed to Checkout</Link>
            </Button>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              Secure checkout · Paymob or Cash on Delivery
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Row({ label, value, className }) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular">{value}</span>
    </div>
  )
}
