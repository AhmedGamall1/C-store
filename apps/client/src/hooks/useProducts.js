import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getProducts, getProduct, deleteProduct } from '@/api/products'

/**
 * Fetch paginated product list with filters.
 * filters — { page, limit, category, minPrice, maxPrice, search, sortBy, order }
 */
export function useProducts(filters = {}) {
  return useQuery({
    // The key includes every filter — TanStack auto-refetches when any filter changes
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
    // Keep showing the previous page while the next page loads (no flicker)
    placeholderData: (prev) => prev,
  })
}

/**
 * Fetch a single product by slug (detail page).
 */
export function useProduct(slug) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProduct(slug),
    enabled: Boolean(slug), // don't fire if slug is undefined
  })
}

/**
 * Soft-delete a product (admin). Invalidates every ['products', ...] list.
 */
export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      // Invalidate all ['products', <any filters>] entries — partial key match.
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product deleted')
    },
    onError: (err) => toast.error(err.message),
  })
}
