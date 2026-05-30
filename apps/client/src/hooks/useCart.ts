import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '@/api/cart'
import { getVariantsBulk } from '@/api/variants'
import { useAuth } from '@/providers/AuthProvider'
import {
  getGuestItems,
  subscribeGuestCart,
  addGuestItem,
  updateGuestItem,
  removeGuestItem,
  clearGuestCart,
  type GuestCartItem,
} from '@/lib/guestCart'
import type {
  Cart,
  CartLine,
  ServerCart,
  ServerCartItem,
  BulkVariant,
} from '@/types/api'

const EMPTY_CART: Cart = { items: [], total: 0, totalItems: 0 }

// ── Normalizers ────────────────────────────────────────
// Both server-cart items and guest-cart items are flattened into the same
// line-item shape so the rest of the app doesn't care which one backs it.

function serverItemToLine(item: ServerCartItem): CartLine {
  const ps = item.productSize
  const color = ps.color
  const product = color.product
  return {
    id: item.id,
    productSizeId: item.productSizeId,
    quantity: item.quantity,
    size: ps.size,
    stock: ps.stock,
    isActive: ps.isActive && color.isActive && product.isActive,
    unitPrice: Number(item.unitPrice),
    subtotal: Number(item.subtotal),
    product: { id: product.id, name: product.name, slug: product.slug },
    color: { id: color.id, name: color.name, imageUrl: color.imageUrl },
    imageUrl: color.imageUrl,
  }
}

function normalizeServerCart(raw: ServerCart | null | undefined): Cart {
  if (!raw) return EMPTY_CART
  return {
    items: (raw.items ?? []).map(serverItemToLine),
    total: Number(raw.total ?? 0),
    totalItems: Number(raw.totalItems ?? 0),
  }
}

function normalizeGuestCart(
  items: GuestCartItem[],
  variants: BulkVariant[]
): Cart {
  const byId = new Map(variants.map((v) => [v.id, v]))
  const lines = items
    .map(({ productSizeId, quantity }): CartLine | null => {
      const v = byId.get(productSizeId)
      if (!v) return null // variant was deleted on the server — hide silently
      const unitPrice = Number(v.price) || 0
      return {
        id: v.id,
        productSizeId: v.id,
        quantity,
        size: v.size,
        stock: v.stock,
        isActive: v.isActive,
        unitPrice,
        subtotal: unitPrice * quantity,
        product: { id: v.productId, name: v.productName, slug: v.productSlug },
        color: { id: v.colorId, name: v.colorName, imageUrl: v.colorImage },
        imageUrl: v.colorImage,
      }
    })
    .filter((line): line is CartLine => line !== null)
  const total = lines.reduce((s, i) => s + (i.isActive ? i.subtotal : 0), 0)
  const totalItems = lines.reduce((s, i) => s + (i.isActive ? i.quantity : 0), 0)
  return { items: lines, total, totalItems }
}

// ── Guest storage subscription ─────────────────────────

function useGuestItems(): GuestCartItem[] {
  const [items, setItems] = useState<GuestCartItem[]>(() => getGuestItems())
  useEffect(() => subscribeGuestCart(setItems), [])
  return items
}

// ── Main hook ──────────────────────────────────────────

export function useCart() {
  const { isAuthenticated } = useAuth()
  const guestItems = useGuestItems()
  const guestIds = guestItems.map((i) => i.productSizeId).sort()
  const guestKey = guestIds.join(',')

  const serverQuery = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
    enabled: isAuthenticated,
    staleTime: 30_000,
  })

  const guestQuery = useQuery({
    queryKey: ['cart', 'guest', guestKey],
    queryFn: () => getVariantsBulk(guestIds),
    enabled: !isAuthenticated && guestIds.length > 0,
    staleTime: 30_000,
  })

  if (isAuthenticated) {
    return {
      ...serverQuery,
      cart: normalizeServerCart(serverQuery.data),
    }
  }

  const variants = guestQuery.data ?? []
  return {
    ...guestQuery,
    isLoading: guestQuery.isLoading && guestIds.length > 0,
    cart:
      guestItems.length === 0
        ? EMPTY_CART
        : normalizeGuestCart(guestItems, variants),
  }
}

// ── Mutations (branching on auth) ──────────────────────

interface CartMutationArgs {
  productSizeId: string
  quantity?: number
  stock?: number
}

function useCartMutation<V>(
  mutationFn: (vars: V) => Promise<ServerCart | null>,
  { successMsg }: { successMsg?: string } = {}
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (cart) => {
      if (cart) qc.setQueryData(['cart'], cart)
      if (successMsg) toast.success(successMsg)
    },
  })
}

export function useAddToCart() {
  const { isAuthenticated } = useAuth()
  return useCartMutation(
    async ({
      productSizeId,
      quantity = 1,
      stock,
    }: CartMutationArgs): Promise<ServerCart | null> => {
      if (isAuthenticated) {
        return addCartItem({ productSizeId, quantity })
      }
      // Guest mode: the server isn't in the loop, so we enforce the stock cap
      // locally. Mirror the server's rule: existing_in_cart + add ≤ stock.
      if (typeof stock === 'number') {
        const existing =
          getGuestItems().find((i) => i.productSizeId === productSizeId)
            ?.quantity ?? 0
        const remaining = Math.max(0, stock - existing)
        if (remaining <= 0) {
          throw new Error(
            existing > 0
              ? `You already have ${existing} in your cart — stock limit reached.`
              : 'Out of stock.'
          )
        }
        if (quantity > remaining) {
          throw new Error(
            `Only ${remaining} more can be added (${existing} already in cart, ${stock} in stock).`
          )
        }
      }
      addGuestItem(productSizeId, quantity)
      return null
    },
    { successMsg: 'Added to cart' }
  )
}

export function useUpdateCartItem() {
  const { isAuthenticated } = useAuth()
  return useCartMutation(
    async ({
      productSizeId,
      quantity,
      stock,
    }: {
      productSizeId: string
      quantity: number
      stock?: number
    }): Promise<ServerCart | null> => {
      if (isAuthenticated) {
        return updateCartItem({ productSizeId, quantity })
      }
      if (typeof stock === 'number' && quantity > stock) {
        throw new Error(`Only ${stock} in stock.`)
      }
      updateGuestItem(productSizeId, quantity)
      return null
    }
  )
}

export function useRemoveCartItem() {
  const { isAuthenticated } = useAuth()
  return useCartMutation(
    async (productSizeId: string): Promise<ServerCart | null> => {
      if (isAuthenticated) {
        return removeCartItem(productSizeId)
      }
      removeGuestItem(productSizeId)
      return null
    },
    { successMsg: 'Removed from cart' }
  )
}

export function useClearCart() {
  const { isAuthenticated } = useAuth()
  return useCartMutation(
    async (): Promise<ServerCart | null> => {
      if (isAuthenticated) {
        return clearCart()
      }
      clearGuestCart()
      return null
    },
    { successMsg: 'Cart cleared' }
  )
}
