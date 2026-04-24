import { api } from '@/lib/api'

// GET /api/cart
export async function getCart() {
  const res = await api.get('/cart')
  return res.data.cart
}

// POST /api/cart/items
export async function addCartItem({ productSizeId, quantity = 1 }) {
  const res = await api.post('/cart/items', { productSizeId, quantity })
  return res.data.cart
}

// PATCH /api/cart/items/:productSizeId
export async function updateCartItem({ productSizeId, quantity }) {
  const res = await api.patch(`/cart/items/${productSizeId}`, { quantity })
  return res.data.cart
}

// DELETE /api/cart/items/:productSizeId
export async function removeCartItem(productSizeId) {
  const res = await api.delete(`/cart/items/${productSizeId}`)
  return res.data.cart
}

// DELETE /api/cart
export async function clearCart() {
  const res = await api.delete('/cart')
  return res.data.cart
}
