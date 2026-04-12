import * as orderService from '../services/order.service.js'

// POST /api/orders
export const createOrder = async (req, res) => {
  const order = await orderService.createOrder(req.user.id, req.body)
  res.status(201).json({ status: 'success', data: { order } })
}
