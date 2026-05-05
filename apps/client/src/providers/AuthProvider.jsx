import { createContext, useContext } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
// The global error handler will toast the actual API error; we just don't
// rethrow so login itself succeeds either way.
async function mergeGuestIntoServer(queryClient) {
  const items = getGuestItems()
  if (items.length === 0) return
  try {
    const cart = await mergeCart(items)
    clearGuestCart()
    queryClient.setQueryData(['cart'], cart)
  } catch {
    /* handled globally */
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
    // 401 here is the normal guest path — don't toast or redirect.
    meta: { silent401: true, silentError: true },
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
