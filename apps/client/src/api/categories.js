import { api } from '@/lib/api'

/**
 * GET /api/categories
 * Returns array of categories (each has _count.products)
 */
export async function getCategories() {
  const res = await api.get('/categories')
  return res.data.categories
}
