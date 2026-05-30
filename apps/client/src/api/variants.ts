import { api } from '@/lib/api'
import type { ProductColor, ProductSize, BulkVariant } from '@/types/api'

interface AddColorInput {
  name: string
  hex?: string
  sizes?: unknown
  imageFile?: File | null
  galleryFiles?: File[]
}

interface UpdateColorInput {
  name?: string
  hex?: string
  isActive?: boolean
  imageFile?: File | null
  galleryFiles?: File[]
}

interface AddSizeInput {
  size: string
  stock: number | string
  sku?: string
  price?: number | string
}

// ── Colors ──────────────────────────────────────────────

export async function addColor(
  productId: string,
  { name, hex, sizes, imageFile, galleryFiles }: AddColorInput
): Promise<ProductColor> {
  const form = new FormData()
  form.append('name', name)
  if (hex) form.append('hex', hex)
  if (sizes) form.append('sizes', JSON.stringify(sizes))
  if (imageFile) form.append('image', imageFile)
  if (galleryFiles) {
    galleryFiles.forEach((f) => form.append('images', f))
  }

  const res = await api.post<{ data: { color: ProductColor } }>(
    `/products/${productId}/colors`,
    form
  )
  return res.data.color
}

export async function updateColor(
  productId: string,
  colorId: string,
  { name, hex, isActive, imageFile, galleryFiles }: UpdateColorInput
): Promise<ProductColor> {
  const form = new FormData()
  if (name !== undefined) form.append('name', name)
  if (hex !== undefined) form.append('hex', hex)
  if (isActive !== undefined) form.append('isActive', String(isActive))
  if (imageFile) form.append('image', imageFile)
  if (galleryFiles) {
    galleryFiles.forEach((f) => form.append('images', f))
  }

  const res = await api.patch<{ data: { color: ProductColor } }>(
    `/products/${productId}/colors/${colorId}`,
    form
  )
  return res.data.color
}

export async function deleteColor(
  productId: string,
  colorId: string
): Promise<void> {
  await api.delete(`/products/${productId}/colors/${colorId}`)
}

// ── Sizes ───────────────────────────────────────────────

export async function addSize(
  productId: string,
  colorId: string,
  { size, stock, sku, price }: AddSizeInput
): Promise<ProductSize> {
  const res = await api.post<{ data: { size: ProductSize } }>(
    `/products/${productId}/colors/${colorId}/sizes`,
    { size, stock, sku, price }
  )
  return res.data.size
}

export async function updateSize(
  productId: string,
  colorId: string,
  sizeId: string,
  data: Record<string, unknown>
): Promise<ProductSize> {
  const res = await api.patch<{ data: { size: ProductSize } }>(
    `/products/${productId}/colors/${colorId}/sizes/${sizeId}`,
    data
  )
  return res.data.size
}

export async function deleteSize(
  productId: string,
  colorId: string,
  sizeId: string
): Promise<void> {
  await api.delete(`/products/${productId}/colors/${colorId}/sizes/${sizeId}`)
}

// ── Bulk lookup ─────────────────────────────────────────
// GET /api/variants/bulk?ids=<csv>
// Missing ids are absent from the response; inactive variants come back with
// isActive:false so the UI can flag them instead of silently dropping them.
export async function getVariantsBulk(ids: string[]): Promise<BulkVariant[]> {
  if (!ids?.length) return []
  const res = await api.get<{ data: { variants: BulkVariant[] } }>(
    '/variants/bulk',
    { params: { ids: ids.join(',') } }
  )
  return res.data.variants ?? []
}
