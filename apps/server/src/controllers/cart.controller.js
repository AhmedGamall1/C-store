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
