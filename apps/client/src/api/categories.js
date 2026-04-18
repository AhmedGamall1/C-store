import { api } from '@/lib/api'

// GET /api/categories
export async function getCategories() {
  const res = await api.get('/categories')
  return res.data.categories
}

// POST /api/categories (admin)
export async function createCategory({ name, description, imageFile }) {
  // eslint-disable-next-line no-undef
  const form = new FormData()
  form.append('name', name)
  if (description) form.append('description', description)
  form.append('image', imageFile)

  const res = await api.post('/categories', form)
  return res.data.category
}

// PATCH /api/categories/:id (admin)
export async function updateCategory(id, { name, description, imageFile }) {
  // eslint-disable-next-line no-undef
  const form = new FormData()
  if (name !== undefined) form.append('name', name)
  if (description !== undefined) form.append('description', description)
  if (imageFile) form.append('image', imageFile)

  const res = await api.patch(`/categories/${id}`, form)
  return res.data.category
}

// DELETE /api/categories/:id (admin)
export async function deleteCategory(id) {
  await api.delete(`/categories/${id}`)
  return id // return id so mutation callers can optimistically update
}
