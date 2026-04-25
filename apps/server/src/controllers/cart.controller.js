import * as cartService from '../services/cart.service.js'

// GET /api/cart
export const getCart = async (req, res) => {
  const cart = await cartService.getCart(req.user.id)
  res.json({ status: 'success', data: { cart } })
}

// POST /api/cart/items — body: { productSizeId, quantity }
export const addItem = async (req, res) => {
  const cart = await cartService.addItem(req.user.id, req.body)
  res.status(201).json({ status: 'success', data: { cart } })
}

// PATCH /api/cart/items/:productSizeId — body: { quantity }
export const updateItem = async (req, res) => {
  const cart = await cartService.updateItem(
    req.user.id,
    req.params.productSizeId,
    req.body.quantity
  )
  res.json({ status: 'success', data: { cart } })
}

// DELETE /api/cart/items/:productSizeId
export const removeItem = async (req, res) => {
  const cart = await cartService.removeItem(
    req.user.id,
    req.params.productSizeId
  )
  res.json({ status: 'success', data: { cart } })
}

// DELETE /api/cart
export const clearCart = async (req, res) => {
  const cart = await cartService.clearCart(req.user.id)
  res.json({ status: 'success', data: { cart } })
}

// POST /api/cart/merge — body: { items: [{ productSizeId, quantity }] }
export const mergeCart = async (req, res) => {
  const cart = await cartService.mergeGuestCart(req.user.id, req.body.items)
  res.json({ status: 'success', data: { cart } })
}
