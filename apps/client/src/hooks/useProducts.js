import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getProducts,
  getAdminProducts,
  getAdminProduct,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  forceDeleteProduct,
  toggleProductActive,
} from '@/api/products'

/**
 * Fetch paginated product list with filters.
 * filters — { page, limit, category, minPrice, maxPrice, search, sortBy, order }
 */
export function useProducts(filters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
    placeholderData: (prev) => prev,
  })
}

/**
 * Fetch paginated product list for admin (includes inactive).
 */
export function useAdminProducts(filters = {}) {
  return useQuery({
    queryKey: ['products', 'admin', filters],
    queryFn: () => getAdminProducts(filters),
    placeholderData: (prev) => prev,
  })
}

/**
 * Fetch a single product by ID for admin editing.
 */
export function useAdminProduct(id) {
  return useQuery({
    queryKey: ['product', 'admin', id],
    queryFn: () => getAdminProduct(id),
    enabled: Boolean(id),
  })
}

/**
 * Fetch a single product by slug (detail page).
 */
export function useProduct(slug) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProduct(slug),
    enabled: Boolean(slug),
  })
}

function useProductMutation(mutationFn, { successMsg } = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['product'] })
      if (successMsg) toast.success(successMsg)
    },
    onError: (err) => toast.error(err.message),
  })
}

export function useCreateProduct() {
  return useProductMutation(createProduct, { successMsg: 'Product created' })
}

export function useUpdateProduct() {
  return useProductMutation(
    ({ id, ...data }) => updateProduct(id, data),
    { successMsg: 'Product updated' }
  )
}

/**
 * Soft-delete a product (admin).
 */
export function useDeleteProduct() {
  return useProductMutation(deleteProduct, { successMsg: 'Product deleted' })
}

/**
 * Force (hard) delete a product (admin).
 */
export function useForceDeleteProduct() {
  return useProductMutation(forceDeleteProduct, { successMsg: 'Product permanently deleted' })
}

/**
 * Toggle product active status.
 */
export function useToggleProductActive() {
  return useProductMutation(
    ({ id, isActive }) => toggleProductActive(id, isActive),
    { successMsg: 'Product status updated' }
  )
}
