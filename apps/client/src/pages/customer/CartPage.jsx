import { Link } from 'react-router'
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/common/EmptyState'
import { useCart, useUpdateCartItem, useRemoveCartItem } from '@/hooks/useCart'
import { cn, formatEGP } from '@/lib/utils'

export default function CartPage() {
  const { cart, isLoading } = useCart()
  const { items, total, totalItems } = cart

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

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
        {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Items */}
        <ul className="divide-y">
          {items.map((item) => (
            <CartLineItem key={item.id} item={item} />
          ))}
        </ul>

        {/* Summary */}
        <aside className="h-fit lg:sticky lg:top-24">
          <div className="rounded-lg border bg-secondary/30 p-6">
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
              Order Summary
            </h2>

            <div className="mt-5 space-y-2 text-sm">
              <Row label="Subtotal" value={formatEGP(total)} />
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
                value={formatEGP(total)}
                className="text-base font-semibold"
              />
            </div>

            {/* Promo — not wired yet */}
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

function CartLineItem({ item }) {
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()

  const busy = updateItem.isPending || removeItem.isPending
  const maxQty = item.stock
  const unavailable = !item.isActive
  const overStock = item.quantity > item.stock

  const inc = () => {
    if (item.quantity >= maxQty) return
    updateItem.mutate({
      productSizeId: item.productSizeId,
      quantity: item.quantity + 1,
      stock: item.stock,
    })
  }
  const dec = () => {
    if (item.quantity <= 1) return
    updateItem.mutate({
      productSizeId: item.productSizeId,
      quantity: item.quantity - 1,
      stock: item.stock,
    })
  }
  const remove = () => removeItem.mutate(item.productSizeId)

  return (
    <li className="flex gap-4 py-6 first:pt-0">
      <Link
        to={`/product/${item.product.slug}`}
        className="relative block h-32 w-24 shrink-0 overflow-hidden rounded-md bg-secondary sm:h-40 sm:w-32"
      >
        <img
          src={item.imageUrl}
          alt={item.product.name}
          className={cn(
            'aspect-product h-full w-full object-cover',
            unavailable && 'opacity-50 grayscale'
          )}
        />
      </Link>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={`/product/${item.product.slug}`}
              className="block text-sm font-medium hover:underline sm:text-base"
            >
              {item.product.name}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.color.name} · Size {item.size}
            </p>
            {unavailable ? (
              <Badge variant="destructive" className="mt-2 gap-1">
                <AlertTriangle className="h-3 w-3" />
                No longer available
              </Badge>
            ) : overStock ? (
              <Badge variant="warning" className="mt-2 gap-1">
                <AlertTriangle className="h-3 w-3" />
                Only {item.stock} in stock
              </Badge>
            ) : item.stock < 5 ? (
              <p className="mt-1 text-xs text-amber-700">
                Only {item.stock} left
              </p>
            ) : null}
          </div>
          <p className="text-sm font-semibold tabular sm:text-base">
            {formatEGP(item.subtotal)}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="inline-flex items-center rounded-md border">
            <button
              type="button"
              className="grid h-9 w-9 place-items-center text-muted-foreground hover:text-foreground disabled:opacity-50"
              aria-label="Decrease"
              onClick={dec}
              disabled={busy || item.quantity <= 1 || unavailable}
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="min-w-[2ch] px-2 text-center text-sm tabular">
              {item.quantity}
            </span>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center text-muted-foreground hover:text-foreground disabled:opacity-50"
              aria-label="Increase"
              onClick={inc}
              disabled={busy || item.quantity >= maxQty || unavailable}
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={remove}
            disabled={busy}
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        </div>
      </div>
    </li>
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
