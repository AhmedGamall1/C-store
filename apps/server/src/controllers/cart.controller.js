import * as cartService from '../services/cart.service.js'

// GET /api/cart
export const getCart = async (req, res) => {
  const cart = await cartService.getCart(req.user.id)
  res.json({ status: 'success', data: { cart } })
}

// POST /api/cart/items  — body: { productId, quantity }
export const addItem = async (req, res) => {
  const cart = await cartService.addItem(req.user.id, req.body)
  res.status(201).json({ status: 'success', data: { cart } })
}

// PATCH /api/cart/items/:productId  — body: { quantity }
export const updateItem = async (req, res) => {
  const cart = await cartService.updateItem(
    req.user.id,
    req.params.productId,
    req.body.quantity
  )
  res.json({ status: 'success', data: { cart } })
}

// DELETE /api/cart/items/:productId
export const removeItem = async (req, res) => {
  const cart = await cartService.removeItem(req.user.id, req.params.productId)
  res.json({ status: 'success', data: { cart } })
}

// DELETE /api/cart
export const clearCart = async (req, res) => {
  const cart = await cartService.clearCart(req.user.id)
  res.json({ status: 'success', data: { cart } })
}
