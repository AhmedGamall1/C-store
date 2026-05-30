import { api } from '@/lib/api'
import type { Category } from '@/types/api'

interface CreateCategoryInput {
  name: string
  description?: string
  imageFile: File
}

interface UpdateCategoryInput {
  name?: string
  description?: string
  imageFile?: File | null
}

// GET /api/categories
export async function getCategories(): Promise<Category[]> {
  const res = await api.get<{ data: { categories: Category[] } }>('/categories')
  return res.data.categories
}

// GET /api/categories/admin — includes inactive
export async function getAdminCategories(): Promise<Category[]> {
  const res = await api.get<{ data: { categories: Category[] } }>(
    '/categories/admin'
  )
  return res.data.categories
}

// PATCH /api/categories/:id — toggle isActive
export async function toggleCategoryActive(
  id: string,
  isActive: boolean
): Promise<Category> {
  const res = await api.patch<{ data: { category: Category } }>(
    `/categories/${id}`,
    { isActive }
  )
  return res.data.category
}

// POST /api/categories (admin)
export async function createCategory({
  name,
  description,
  imageFile,
}: CreateCategoryInput): Promise<Category> {
  const form = new FormData()
  form.append('name', name)
  if (description) form.append('description', description)
  form.append('image', imageFile)

  const res = await api.post<{ data: { category: Category } }>(
    '/categories',
    form
  )
  return res.data.category
}

// PATCH /api/categories/:id (admin)
export async function updateCategory(
  id: string,
  { name, description, imageFile }: UpdateCategoryInput
): Promise<Category> {
  const form = new FormData()
  if (name !== undefined) form.append('name', name)
  if (description !== undefined) form.append('description', description)
  if (imageFile) form.append('image', imageFile)

  const res = await api.patch<{ data: { category: Category } }>(
    `/categories/${id}`,
    form
  )
  return res.data.category
}

// DELETE /api/categories/:id (admin)
export async function deleteCategory(id: string): Promise<string> {
  await api.delete(`/categories/${id}`)
  return id // return id so mutation callers can optimistically update
}
