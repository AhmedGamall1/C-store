import { api } from '@/lib/api'

/**
 * GET /api/products?page=&category=&minPrice=&maxPrice=&search=&sortBy=&order=
 * Returns { products, pagination }
 */
export async function getProducts(params = {}) {
  const res = await api.get('/products', { params })
  return { products: res.products, pagination: res.pagination }
}

/**
 * GET /api/products/:slug
 * Returns the full product object (with reviews, category, _count)
 */
export async function getProduct(slug) {
  const res = await api.get(`/products/${slug}`)
  return res.data.product
}
