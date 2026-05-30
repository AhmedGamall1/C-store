import { api } from '@/lib/api'
import type { ServerCart } from '@/types/api'
import type { GuestCartItem } from '@/lib/guestCart'

interface AddCartItemInput {
  productSizeId: string
  quantity?: number
}

interface UpdateCartItemInput {
  productSizeId: string
  quantity: number
}

// GET /api/cart
export async function getCart(): Promise<ServerCart> {
  const res = await api.get<{ data: { cart: ServerCart } }>('/cart')
  return res.data.cart
}

// POST /api/cart/items
export async function addCartItem({
  productSizeId,
  quantity = 1,
}: AddCartItemInput): Promise<ServerCart> {
  const res = await api.post<{ data: { cart: ServerCart } }>('/cart/items', {
    productSizeId,
    quantity,
  })
  return res.data.cart
}

// PATCH /api/cart/items/:productSizeId
export async function updateCartItem({
  productSizeId,
  quantity,
}: UpdateCartItemInput): Promise<ServerCart> {
  const res = await api.patch<{ data: { cart: ServerCart } }>(
    `/cart/items/${productSizeId}`,
    { quantity }
  )
  return res.data.cart
}

// DELETE /api/cart/items/:productSizeId
export async function removeCartItem(
  productSizeId: string
): Promise<ServerCart> {
  const res = await api.delete<{ data: { cart: ServerCart } }>(
    `/cart/items/${productSizeId}`
  )
  return res.data.cart
}

// DELETE /api/cart
export async function clearCart(): Promise<ServerCart> {
  const res = await api.delete<{ data: { cart: ServerCart } }>('/cart')
  return res.data.cart
}

// POST /api/cart/merge — body: { items: [{ productSizeId, quantity }] }
export async function mergeCart(items: GuestCartItem[]): Promise<ServerCart> {
  const res = await api.post<{ data: { cart: ServerCart } }>('/cart/merge', {
    items,
  })
  return res.data.cart
}
