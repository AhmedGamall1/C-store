import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '@/api/cart'
import { useAuth } from '@/providers/AuthProvider'

const EMPTY_CART = { items: [], total: 0, totalItems: 0 }

export function useCart() {
  const { isAuthenticated } = useAuth()

  const query = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
    enabled: isAuthenticated,
    staleTime: 30_000, // cart changes often, but not every render
  })

  return {
    ...query,
    cart: query.data ?? EMPTY_CART,
  }
}

function useCartMutation(mutationFn, { successMsg } = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (cart) => {
      qc.setQueryData(['cart'], cart)
      if (successMsg) toast.success(successMsg)
    },
    onError: (err) => toast.error(err.message),
  })
}

export function useAddToCart() {
  return useCartMutation(addCartItem, { successMsg: 'Added to cart' })
}

export function useUpdateCartItem() {
  return useCartMutation(updateCartItem)
}

export function useRemoveCartItem() {
  return useCartMutation(removeCartItem, { successMsg: 'Removed from cart' })
}

export function useClearCart() {
  return useCartMutation(clearCart, { successMsg: 'Cart cleared' })
}
