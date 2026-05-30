import type { Request, Response } from 'express'
import * as cartService from '../services/cart.service.js'

// GET /api/cart
export const getCart = async (req: Request, res: Response) => {
  const cart = await cartService.getCart(req.user!.id)
  res.json({ status: 'success', data: { cart } })
}

// POST /api/cart/items
export const addItem = async (req: Request, res: Response) => {
  const cart = await cartService.addItem(req.user!.id, req.body)
  res.status(201).json({ status: 'success', data: { cart } })
}

// PATCH /api/cart/items/:productSizeId
export const updateItem = async (req: Request, res: Response) => {
  const cart = await cartService.updateItem(
    req.user!.id,
    req.params.productSizeId as string,
    req.body.quantity
  )
  res.json({ status: 'success', data: { cart } })
}

// DELETE /api/cart/items/:productSizeId
export const removeItem = async (req: Request, res: Response) => {
  const cart = await cartService.removeItem(req.user!.id, req.params.productSizeId as string)
  res.json({ status: 'success', data: { cart } })
}

// DELETE /api/cart
export const clearCart = async (req: Request, res: Response) => {
  const cart = await cartService.clearCart(req.user!.id)
  res.json({ status: 'success', data: { cart } })
}

// POST /api/cart/merge
export const mergeCart = async (req: Request, res: Response) => {
  const cart = await cartService.mergeGuestCart(req.user!.id, req.body.items)
  res.json({ status: 'success', data: { cart } })
}
