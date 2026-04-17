import { api } from '@/lib/api'

// GET /api/cart
export async function getCart() {
  const res = await api.get('/cart')
  return res.data.cart
}

// POST /api/cart/items
export async function addCartItem({ productId, quantity = 1 }) {
  const res = await api.post('/cart/items', { productId, quantity })
  return res.data.cart
}

// PATCH /api/cart/items/:productId
export async function updateCartItem({ productId, quantity }) {
  const res = await api.patch(`/cart/items/${productId}`, { quantity })
  return res.data.cart
}

// DELETE /api/cart/items/:productId
export async function removeCartItem(productId) {
  const res = await api.delete(`/cart/items/${productId}`)
  return res.data.cart
}

// DELETE /api/cart
export async function clearCart() {
  const res = await api.delete('/cart')
  return res.data.cart
}
