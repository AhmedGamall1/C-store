import { useQuery } from '@tanstack/react-query'
import { getProducts, getProduct } from '@/api/products'

/**
 * Fetch paginated product list with filters.
 * —filters - { page, category, minPrice, maxPrice, search, sortBy, order }
 */
export function useProducts(filters = {}) {
  return useQuery({
    // The key includes every filter — TanStack auto-refetches when any filter changes
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
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
