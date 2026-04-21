import * as orderService from '../services/order.service.js'
import { initiatePaymobPayment } from '../services/paymob.service.js'

// POST /api/orders
// Accessible by both guests and logged-in users (optionalAuth middleware).
export const createOrder = async (req, res) => {
  const order = await orderService.createOrder(req.user ?? null, req.body)

  if (order.paymentMethod !== 'PAYMOB') {
    return res.status(201).json({ status: 'success', data: { order } })
  }

  const { iframeUrl, paymobOrderId } = await initiatePaymobPayment(
    order,
    req.user ?? null
  )

  await orderService.savePaymobOrderId(order.id, paymobOrderId)

  return res.status(201).json({
    status: 'success',
    data: {
      order: { ...order, paymobOrderId },
      iframeUrl,
    },
  })
}

// GET /api/orders
export const getMyOrders = async (req, res) => {
  const orders = await orderService.getMyOrders(req.user.id)
  res.json({ status: 'success', results: orders.length, data: { orders } })
}

// GET /api/orders/:id
export const getOrderById = async (req, res) => {
  const order = await orderService.getOrderById(req.user.id, req.params.id)
  res.json({ status: 'success', data: { order } })
}

// PATCH /api/orders/:id/cancel
export const cancelOrder = async (req, res) => {
  const order = await orderService.cancelOrder(req.user.id, req.params.id)
  res.json({ status: 'success', data: { order } })
}

// GET /api/orders/admin  (admin only)
export const getAllOrders = async (req, res) => {
  const result = await orderService.getAllOrders(req.query)
  res.json({
    status: 'success',
    results: result.orders.length,
    data: { orders: result.orders, pagination: result.pagination },
  })
}

// PATCH /api/orders/:id/status  (admin only)
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body
  const order = await orderService.updateOrderStatus(req.params.id, status)
  res.json({ status: 'success', data: { order } })
}
