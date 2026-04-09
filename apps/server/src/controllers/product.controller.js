import * as productService from '../services/product.service.js'

// GET /api/products/
export const getAllProducts = async (req, res) => {
  const result = await productService.getAllProducts(req.query)
  res.json({
    status: 'success',
    ...result,
  })
}

// GET /api/products/:slug
export const getProductBySlug = async (req, res) => {
  const product = await productService.getProductBySlug(req.params.slug)
  res.json({
    status: 'success',
    data: { product },
  })
}

//POST /api/products/
export const createProduct = async (req, res) => {
  const files = req.files ?? {}
  const product = await productService.createProduct(req.body, {
    imageBuffer: files.image?.[0]?.buffer ?? null,
    galleryBuffers: files.images?.map((f) => f.buffer) ?? [],
  })
  res.status(201).json({ status: 'success', data: { product } })
}

// PATCH /api/products/:id
export const updateProduct = async (req, res) => {
  const files = req.files ?? {}
  const product = await productService.updateProduct(req.params.id, req.body, {
    imageBuffer: files.image?.[0]?.buffer ?? null,
    galleryBuffers: files.images?.map((f) => f.buffer) ?? [],
  })
  res.json({ status: 'success', data: { product } })
}

// DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  await productService.deleteProduct(req.params.id)
  res.status(204).send()
}
