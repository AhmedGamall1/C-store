import { api } from '@/lib/api'

// ── Colors ──────────────────────────────────────────────

export async function addColor(productId, { name, hex, sizes, imageFile, galleryFiles }) {
  const form = new FormData()
  form.append('name', name)
  if (hex) form.append('hex', hex)
  if (sizes) form.append('sizes', JSON.stringify(sizes))
  if (imageFile) form.append('image', imageFile)
  if (galleryFiles) {
    galleryFiles.forEach((f) => form.append('images', f))
  }

  const res = await api.post(`/products/${productId}/colors`, form)
  return res.data.color
}

export async function updateColor(productId, colorId, { name, hex, isActive, imageFile, galleryFiles }) {
  const form = new FormData()
  if (name !== undefined) form.append('name', name)
  if (hex !== undefined) form.append('hex', hex)
  if (isActive !== undefined) form.append('isActive', isActive)
  if (imageFile) form.append('image', imageFile)
  if (galleryFiles) {
    galleryFiles.forEach((f) => form.append('images', f))
  }

  const res = await api.patch(`/products/${productId}/colors/${colorId}`, form)
  return res.data.color
}

export async function deleteColor(productId, colorId) {
  await api.delete(`/products/${productId}/colors/${colorId}`)
}

// ── Sizes ───────────────────────────────────────────────

export async function addSize(productId, colorId, { size, stock, sku, price }) {
  const res = await api.post(`/products/${productId}/colors/${colorId}/sizes`, {
    size,
    stock,
    sku,
    price,
  })
  return res.data.size
}

export async function updateSize(productId, colorId, sizeId, data) {
  const res = await api.patch(
    `/products/${productId}/colors/${colorId}/sizes/${sizeId}`,
    data
  )
  return res.data.size
}

export async function deleteSize(productId, colorId, sizeId) {
  await api.delete(`/products/${productId}/colors/${colorId}/sizes/${sizeId}`)
}

// ── Bulk lookup ─────────────────────────────────────────
// GET /api/variants/bulk?ids=<csv>
// Missing ids are absent from the response; inactive variants come back with
// isActive:false so the UI can flag them instead of silently dropping them.
export async function getVariantsBulk(ids) {
  if (!ids?.length) return []
  const res = await api.get('/variants/bulk', {
    params: { ids: ids.join(',') },
  })
  return res.data.variants ?? []
}
