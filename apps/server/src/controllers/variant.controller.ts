import type { Request, Response } from 'express'
import * as variantService from '../services/variant.service.js'

// POST /api/products/:id/colors
export const addColor = async (req: Request, res: Response) => {
  const files = (req.files ?? {}) as Record<string, Express.Multer.File[]>
  const color = await variantService.addColor(req.params.id as string, req.body, {
    imageBuffer: files.image?.[0]?.buffer,
    galleryBuffers: files.images?.map((f) => f.buffer) ?? [],
  })
  res.status(201).json({ status: 'success', data: { color } })
}

// PATCH /api/products/:id/colors/:colorId
export const updateColor = async (req: Request, res: Response) => {
  const files = (req.files ?? {}) as Record<string, Express.Multer.File[]>
  const color = await variantService.updateColor(req.params.colorId as string, req.body, {
    imageBuffer: files.image?.[0]?.buffer,
    galleryBuffers: files.images?.map((f) => f.buffer) ?? [],
  })
  res.json({ status: 'success', data: { color } })
}

// DELETE /api/products/:id/colors/:colorId
export const deleteColor = async (req: Request, res: Response) => {
  await variantService.deleteColor(req.params.colorId as string)
  res.status(204).send()
}

// POST /api/products/:id/colors/:colorId/sizes
export const addSize = async (req: Request, res: Response) => {
  const size = await variantService.addSize(req.params.colorId as string, req.body)
  res.status(201).json({ status: 'success', data: { size } })
}

// PATCH /api/products/:id/colors/:colorId/sizes/:sizeId
export const updateSize = async (req: Request, res: Response) => {
  const size = await variantService.updateSize(
    { colorId: req.params.colorId as string, sizeId: req.params.sizeId as string },
    req.body
  )
  res.json({ status: 'success', data: { size } })
}

// DELETE /api/products/:id/colors/:colorId/sizes/:sizeId
export const deleteSize = async (req: Request, res: Response) => {
  await variantService.deleteSize(req.params.sizeId as string)
  res.status(204).send()
}

// GET /api/variants/bulk?ids=<csv>
export const getVariantsBulk = async (req: Request, res: Response) => {
  const variants = await variantService.getVariantsBulk(
    req.query.ids as unknown as string[]
  )
  res.json({ status: 'success', data: { variants } })
}
