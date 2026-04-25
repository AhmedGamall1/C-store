import { Link } from 'react-router'
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { EmptyState } from '@/components/common/EmptyState'
import { useCart, useUpdateCartItem, useRemoveCartItem } from '@/hooks/useCart'
import { cn, formatEGP } from '@/lib/utils'

export function CartDrawer({ children }) {
  const { cart, isLoading } = useCart()
  const { items, total, totalItems } = cart

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[420px]"
      >
        {/* Header — pr-12 keeps the title clear of the sheet's absolute X */}
        <SheetHeader className="flex-row items-center justify-between gap-3 border-b px-6 py-4 pr-12">
          <SheetTitle className="truncate font-display text-base uppercase tracking-wide">
            Your Cart
            {totalItems > 0 ? (
              <span className="ml-2 rounded-full bg-foreground px-2 py-0.5 text-[11px] font-semibold text-background">
                {totalItems}
              </span>
            ) : null}
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 p-6">
            <EmptyState
              icon={ShoppingBag}
              title="Your cart is empty"
              description="Start shopping and add your favourites here."
              action={
                <SheetClose asChild>
                  <Button asChild>
                    <Link to="/shop">Shop now</Link>
                  </Button>
                </SheetClose>
              }
            />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="divide-y">
                {items.map((item) => (
                  <CartLineItem key={item.id} item={item} />
                ))}
              </ul>
            </div>

            {/* Footer — a plain div so we don't inherit flex-col-reverse from SheetFooter */}
            <div className="border-t bg-background px-5 py-5">
              <div className="space-y-1.5">
                <Row label="Subtotal" value={formatEGP(total)} />
                <Row
                  label="Shipping"
                  value={
                    <span className="text-muted-foreground">
                      At checkout
                    </span>
                  }
                />
                <Separator className="my-2" />
                <Row
                  label="Total"
                  value={formatEGP(total)}
                  className="text-base font-semibold"
                />
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <SheetClose asChild>
                  <Button asChild size="lg" className="w-full">
                    <Link to="/checkout">Checkout</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/cart">View cart</Link>
                  </Button>
                </SheetClose>
              </div>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                Taxes & shipping calculated at checkout
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function CartLineItem({ item }) {
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()

  const busy = updateItem.isPending || removeItem.isPending
  const unavailable = !item.isActive
  const overStock = item.quantity > item.stock

  const inc = () => {
    if (item.quantity >= item.stock) return
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
    <li className="flex gap-3 py-4 first:pt-1 last:pb-1">
      <Link
        to={`/product/${item.product.slug}`}
        className="relative block h-24 w-[72px] shrink-0 overflow-hidden rounded-md bg-secondary"
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

      {/* Body column — min-w-0 is required so flex children can truncate */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/product/${item.product.slug}`}
            className="line-clamp-2 break-words pr-1 text-sm font-medium leading-snug hover:underline"
            title={item.product.name}
          >
            {item.product.name}
          </Link>
          <p className="shrink-0 text-sm font-semibold tabular">
            {formatEGP(item.subtotal)}
          </p>
        </div>

        <p
          className="mt-1 truncate text-xs text-muted-foreground"
          title={`${item.color.name} · Size ${item.size}`}
        >
          {item.color.name} · Size {item.size}
        </p>

        {unavailable ? (
          <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            <span className="truncate">No longer available</span>
          </p>
        ) : overStock ? (
          <p className="mt-1 flex items-center gap-1 text-xs text-amber-700">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            <span className="truncate">Only {item.stock} in stock</span>
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <QuantityStepper
            value={item.quantity}
            onDecrement={dec}
            onIncrement={inc}
            disabled={busy || unavailable}
            canIncrement={item.quantity < item.stock}
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-destructive"
            aria-label="Remove item"
            onClick={remove}
            disabled={busy}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </Button>
        </div>
      </div>
    </li>
  )
}

function QuantityStepper({
  value,
  onIncrement,
  onDecrement,
  disabled,
  canIncrement = true,
}) {
  return (
    <div className="inline-flex h-8 items-center rounded-md border">
      <button
        type="button"
        className="grid h-full w-8 place-items-center text-muted-foreground hover:text-foreground disabled:opacity-50"
        aria-label="Decrease quantity"
        onClick={onDecrement}
        disabled={disabled || value <= 1}
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="min-w-[2ch] px-1 text-center text-sm tabular">
        {value}
      </span>
      <button
        type="button"
        className="grid h-full w-8 place-items-center text-muted-foreground hover:text-foreground disabled:opacity-50"
        aria-label="Increase quantity"
        onClick={onIncrement}
        disabled={disabled || !canIncrement}
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  )
}

function Row({ label, value, className }) {
  return (
    <div className={cn('flex items-center justify-between gap-3 text-sm', className)}>
      <span className="truncate text-muted-foreground">{label}</span>
      <span className="shrink-0 tabular">{value}</span>
    </div>
  )
}
