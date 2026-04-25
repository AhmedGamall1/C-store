import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getAdminOrders,
  getAdminOrder,
  updateOrderStatus,
  getMyOrders,
  getMyOrder,
  cancelMyOrder,
} from '@/api/orders'

/**
 * Admin: paginated list of all orders.
 * filters — { page, limit, status, paymentStatus, paymentMethod }
 */
export function useAdminOrders(filters = {}) {
  return useQuery({
    queryKey: ['orders', 'admin', filters],
    queryFn: () => getAdminOrders(filters),
    placeholderData: (prev) => prev,
  })
}

/**
 * Admin: single order detail.
 */
export function useAdminOrder(id) {
  return useQuery({
    queryKey: ['order', 'admin', id],
    queryFn: () => getAdminOrder(id),
    enabled: Boolean(id),
  })
}

/**
 * Admin: update order status. Server validates the transition.
 */
export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => updateOrderStatus(id, status),
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['order', 'admin', order.id] })
      toast.success(`Order moved to ${order.status.toLowerCase()}`)
    },
    onError: (err) => toast.error(err.message),
  })
}

/**
 * Customer: my orders list.
 */
export function useMyOrders() {
  return useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: getMyOrders,
  })
}

/**
 * Customer: my order detail (server checks ownership).
 */
export function useMyOrder(id) {
  return useQuery({
    queryKey: ['order', 'mine', id],
    queryFn: () => getMyOrder(id),
    enabled: Boolean(id),
  })
}

/**
 * Customer: cancel a PENDING order.
 */
export function useCancelMyOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: cancelMyOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['order'] })
      toast.success('Order cancelled')
    },
    onError: (err) => toast.error(err.message),
  })
}
