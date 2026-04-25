import { createContext, useContext } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getMe,
  login as loginApi,
  logout as logoutApi,
  register as registerApi,
} from '@/api/auth'
import { mergeCart } from '@/api/cart'
import { getGuestItems, clearGuestCart } from '@/lib/guestCart'

const AuthContext = createContext(null)

// Merge anything the user added as a guest into their server cart. Silent no-op
// when there's nothing to merge; on failure we keep the guest items in
// localStorage so the user can retry instead of losing their cart.
async function mergeGuestIntoServer(queryClient) {
  const items = getGuestItems()
  if (items.length === 0) return
  try {
    const cart = await mergeCart(items)
    clearGuestCart()
    queryClient.setQueryData(['cart'], cart)
  } catch (err) {
    toast.error(err.message || 'Failed to merge your cart')
  }
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()

  // The single source of truth for "who's logged in".
  // 401 is expected (guest); don't retry and don't surface it as an error to the UI.
  const {
    data: user,
    isLoading,
    isFetched,
  } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60_000, // 5 min — user identity doesn't change often
    // Treat 401 as "logged out" instead of an error state
    throwOnError: false,
  })

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: async (data) => {
      queryClient.setQueryData(['me'], data)
      await mergeGuestIntoServer(queryClient)
    },
  })

  const registerMutation = useMutation({
    mutationFn: registerApi,
    onSuccess: async (data) => {
      queryClient.setQueryData(['me'], data)
      await mergeGuestIntoServer(queryClient)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.setQueryData(['me'], null)
      queryClient.clear()
    },
  })

  const value = {
    user: user ?? null,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'ADMIN',
    isLoading: isLoading && !isFetched, // only true on the very first load
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    loginState: loginMutation,
    registerState: registerMutation,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
