import * as variantService from '../services/variant.service.js'

// POST /api/products/:id/colors
export const addColor = async (req, res) => {
  const files = req.files ?? {}
  const color = await variantService.addColor(req.params.id, req.body, {
    imageBuffer: files.image?.[0]?.buffer ?? null,
    galleryBuffers: files.images?.map((f) => f.buffer) ?? [],
  })
  res.status(201).json({ status: 'success', data: { color } })
}

// PATCH /api/products/:id/colors/:colorId
export const updateColor = async (req, res) => {
  const files = req.files ?? {}
  const color = await variantService.updateColor(req.params.colorId, req.body, {
    imageBuffer: files.image?.[0]?.buffer ?? null,
    galleryBuffers: files.images?.map((f) => f.buffer) ?? [],
  })
  res.json({ status: 'success', data: { color } })
}

// DELETE /api/products/:id/colors/:colorId
export const deleteColor = async (req, res) => {
  await variantService.deleteColor(req.params.colorId)
  res.status(204).send()
}

// POST /api/products/:id/colors/:colorId/sizes
export const addSize = async (req, res) => {
  const size = await variantService.addSize(req.params.colorId, req.body)
  res.status(201).json({ status: 'success', data: { size } })
}

// PATCH /api/products/:id/colors/:colorId/sizes/:sizeId
export const updateSize = async (req, res) => {
  const size = await variantService.updateSize(req.params, req.body)
  res.json({ status: 'success', data: { size } })
}

// DELETE /api/products/:id/colors/:colorId/sizes/:sizeId
export const deleteSize = async (req, res) => {
  await variantService.deleteSize(req.params.sizeId)
  res.status(204).send()
}

// GET /api/variants/bulk?ids=uuid1,uuid2,...
export const getVariantsBulk = async (req, res) => {
  const raw = (req.query.ids || '').toString()
  const ids = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const variants = await variantService.getVariantsBulk(ids)
  res.json({ status: 'success', data: { variants } })
}
