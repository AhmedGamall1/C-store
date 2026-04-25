import { api } from '@/lib/api'

/**
 * GET /api/orders/admin?page=&limit=&status=&paymentStatus=&paymentMethod=&q=
 * Admin-only. Returns { orders, pagination }.
 */
export async function getAdminOrders(params = {}) {
  const res = await api.get('/orders/admin', { params })
  return { orders: res.data.orders, pagination: res.data.pagination }
}

/**
 * GET /api/orders/admin/:id
 * Admin-only single order detail.
 */
export async function getAdminOrder(id) {
  const res = await api.get(`/orders/admin/${id}`)
  return res.data.order
}

/**
 * PATCH /api/orders/:id/status
 * Admin-only. Body: { status }. Server enforces valid transitions.
 */
export async function updateOrderStatus(id, status) {
  const res = await api.patch(`/orders/${id}/status`, { status })
  return res.data.order
}

/**
 * GET /api/orders
 * Current user's orders.
 */
export async function getMyOrders() {
  const res = await api.get('/orders')
  return res.data.orders
}

/**
 * GET /api/orders/:id
 * Current user's order. Server checks ownership.
 */
export async function getMyOrder(id) {
  const res = await api.get(`/orders/${id}`)
  return res.data.order
}

/**
 * PATCH /api/orders/:id/cancel
 * Cancel a PENDING order owned by the current user.
 */
export async function cancelMyOrder(id) {
  const res = await api.patch(`/orders/${id}/cancel`)
  return res.data.order
}
