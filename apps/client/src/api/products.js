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
 * GET /api/products/admin (includes inactive)
 */
export async function getAdminProducts(params = {}) {
  const res = await api.get('/products/admin', { params })
  return { products: res.products, pagination: res.pagination }
}

/**
 * GET /api/products/admin/:id (admin detail, no active filter)
 */
export async function getAdminProduct(id) {
  const res = await api.get(`/products/admin/${id}`)
  return res.data.product
}

/**
 * GET /api/products/:slug
 * Returns the full product object (with reviews, category, _count)
 */
export async function getProduct(slug) {
  const res = await api.get(`/products/${slug}`)
  return res.data.product
}

/**
 * POST /api/products (admin)
 */
export async function createProduct({ name, description, price, comparePrice, sku, categoryId, imageFile }) {
  const form = new FormData()
  form.append('name', name)
  if (description) form.append('description', description)
  form.append('price', price)
  if (comparePrice) form.append('comparePrice', comparePrice)
  if (sku) form.append('sku', sku)
  form.append('categoryId', categoryId)
  if (imageFile) form.append('image', imageFile)

  const res = await api.post('/products', form)
  return res.data.product
}

/**
 * PATCH /api/products/:id (admin)
 */
export async function updateProduct(id, { name, description, price, comparePrice, sku, categoryId, isActive, imageFile }) {
  const form = new FormData()
  if (name !== undefined) form.append('name', name)
  if (description !== undefined) form.append('description', description)
  if (price !== undefined) form.append('price', price)
  if (comparePrice !== undefined) form.append('comparePrice', comparePrice)
  if (sku !== undefined) form.append('sku', sku)
  if (categoryId !== undefined) form.append('categoryId', categoryId)
  if (isActive !== undefined) form.append('isActive', isActive)
  if (imageFile) form.append('image', imageFile)

  const res = await api.patch(`/products/${id}`, form)
  return res.data.product
}

/**
 * DELETE /api/products/:id (admin)
 * Server does a soft delete — sets isActive = false. Returns 204.
 */
export async function deleteProduct(id) {
  await api.delete(`/products/${id}`)
  return id
}

/**
 * DELETE /api/products/:id/force (admin — hard delete)
 */
export async function forceDeleteProduct(id) {
  await api.delete(`/products/${id}/force`)
  return id
}

/**
 * PATCH /api/products/:id — toggle isActive
 */
export async function toggleProductActive(id, isActive) {
  const res = await api.patch(`/products/${id}`, { isActive })
  return res.data.product
}
