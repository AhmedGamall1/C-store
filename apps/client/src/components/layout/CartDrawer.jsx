import { Link } from 'react-router'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { EmptyState } from '@/components/common/EmptyState'
import { CART_ITEMS, cartItemCount, cartSubtotal } from '@/data/cart'
import { cn, formatEGP } from '@/lib/utils'

export function CartDrawer({ children }) {
  const items = CART_ITEMS
  const count = cartItemCount(items)
  const subtotal = cartSubtotal(items)

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="flex-row items-center justify-between border-b p-6">
          <SheetTitle className="font-display uppercase tracking-wide">
            Your Cart ({count})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
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
            <div className="flex-1 overflow-y-auto p-6">
              <ul className="space-y-5">
                {items.map((item) => (
                  <CartLineItem key={item.id} item={item} />
                ))}
              </ul>
            </div>

            <SheetFooter className="flex-col gap-0 border-t p-6">
              <div className="space-y-2 w-full">
                <Row label="Subtotal" value={formatEGP(subtotal)} />
                <Row
                  label="Shipping"
                  value={<span className="text-muted-foreground">Calculated at checkout</span>}
                />
                <Separator className="my-2" />
                <Row
                  label="Total"
                  value={formatEGP(subtotal)}
                  className="text-base font-semibold"
                />
              </div>
              <div className="mt-6 flex w-full flex-col gap-2">
                <SheetClose asChild>
                  <Button asChild size="lg" className="w-full">
                    <Link to="/checkout">Checkout</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild variant="outline" size="lg" className="w-full">
                    <Link to="/cart">View cart</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function CartLineItem({ item }) {
  return (
    <li className="flex gap-4">
      <Link
        to={`/product/${item.product.slug}`}
        className="relative block h-24 w-20 shrink-0 overflow-hidden rounded-md bg-secondary"
      >
        <img
          src={item.product.imageUrl}
          alt={item.product.name}
          className="aspect-product h-full w-full object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              to={`/product/${item.product.slug}`}
              className="line-clamp-2 text-sm font-medium hover:underline"
            >
              {item.product.name}
            </Link>
            <p className="text-xs text-muted-foreground">Size {item.size}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Remove">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <QuantityStepper value={item.quantity} />
          <p className="text-sm font-semibold tabular">
            {formatEGP(Number(item.product.price) * item.quantity)}
          </p>
        </div>
      </div>
    </li>
  )
}

function QuantityStepper({ value }) {
  return (
    <div className="inline-flex h-8 items-center rounded-md border">
      <button
        type="button"
        className="grid h-full w-8 place-items-center text-muted-foreground hover:text-foreground"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="min-w-[2ch] px-1 text-center text-sm tabular">{value}</span>
      <button
        type="button"
        className="grid h-full w-8 place-items-center text-muted-foreground hover:text-foreground"
        aria-label="Increase quantity"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  )
}

function Row({ label, value, className }) {
  return (
    <div className={cn('flex items-center justify-between text-sm', className)}>
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular">{value}</span>
    </div>
  )
}
