import { Prisma } from '@prisma/client'
import AppError from '../utils/AppError.js'
import { deleteImage, uploadImage } from '../utils/cloudinary.util.js'
import { withTransaction } from '../repositories/transaction.js'
import * as variantRepo from '../repositories/variant.repository.js'
import * as productRepo from '../repositories/product.repository.js'
import type {
  AddColorInput,
  UpdateColorInput,
  AddSizeInput,
  UpdateSizeInput,
} from '../schemas/variant.schema.js'

const COLORS_FOLDER = 'c-store/products/colors'

interface ColorFiles {
  imageBuffer?: Buffer
  galleryBuffers?: Buffer[]
}

export const addColor = async (
  productId: string,
  data: AddColorInput,
  files: ColorFiles = {}
) => {
  const { imageBuffer, galleryBuffers = [] } = files

  if (!imageBuffer) {
    throw new AppError('Color cover image is required', 400)
  }

  const product = await productRepo.findById(productId)
  if (!product) throw new AppError('Product not found', 404)

  const duplicate = await variantRepo.findColorByProductAndName(
    productId,
    data.name
  )
  if (duplicate) {
    throw new AppError('This color already exists for this product', 409)
  }

  const cover = await uploadImage(imageBuffer, COLORS_FOLDER)

  let images: string[] = []
  let imagePublicIds: string[] = []
  if (galleryBuffers.length) {
    const results = await Promise.all(
      galleryBuffers.map((buf) => uploadImage(buf, COLORS_FOLDER))
    )
    images = results.map((r) => r.secure_url)
    imagePublicIds = results.map((r) => r.public_id)
  }

  return variantRepo.createColor({
    productId,
    name: data.name,
    hex: data.hex ?? null,
    imageUrl: cover.secure_url,
    imagePublicId: cover.public_id,
    images,
    imagePublicIds,
    sizes: data.sizes?.length
      ? {
          create: data.sizes.map((s) => ({
            size: s.size,
            stock: s.stock,
            sku: s.sku ?? null,
            price: s.price ?? null,
          })),
        }
      : undefined,
  })
}

export const updateColor = async (
  colorId: string,
  data: UpdateColorInput,
  files: ColorFiles = {}
) => {
  const color = await variantRepo.findColorById(colorId)
  if (!color) throw new AppError('Color not found', 404)

  const { imageBuffer, galleryBuffers = [] } = files
  const updateData: Prisma.ProductColorUncheckedUpdateInput = {}

  if (data.name !== undefined && data.name !== color.name) {
    const duplicate = await variantRepo.findColorByProductAndName(
      color.productId,
      data.name
    )
    if (duplicate) {
      throw new AppError('This color already exists for this product', 409)
    }
    updateData.name = data.name
  }
  if (data.hex !== undefined) updateData.hex = data.hex ?? null
  if (data.isActive !== undefined) updateData.isActive = data.isActive

  if (imageBuffer) {
    await deleteImage(color.imagePublicId)
    const result = await uploadImage(imageBuffer, COLORS_FOLDER)
    updateData.imageUrl = result.secure_url
    updateData.imagePublicId = result.public_id
  }

  if (galleryBuffers.length) {
    await Promise.all(color.imagePublicIds.map(deleteImage))
    const results = await Promise.all(
      galleryBuffers.map((buf) => uploadImage(buf, COLORS_FOLDER))
    )
    updateData.images = results.map((r) => r.secure_url)
    updateData.imagePublicIds = results.map((r) => r.public_id)
  }

  return variantRepo.updateColorById(colorId, updateData)
}

export const deleteColor = async (colorId: string) => {
  const color = await variantRepo.findColorByIdWithSizes(colorId)
  if (!color) throw new AppError('Color not found', 404)

  const sizeIds = color.sizes.map((s) => s.id)

  // Refuse hard delete if any of these sizes appear in an order.
  if (sizeIds.length > 0) {
    const orderItemCount = await productRepo.countOrderItemsBySizeIds(sizeIds)
    if (orderItemCount > 0) {
      throw new AppError(
        `Cannot delete this color — it's been ordered. Disable it via PATCH isActive=false instead.`,
        409
      )
    }
  }

  // Last-sellable guard: don't strand an active product with no buyable color.
  if (color.isActive) {
    const product = await productRepo.findById(color.productId)
    if (product?.isActive) {
      const otherSellable = await variantRepo.findOtherSellableColor(
        color.productId,
        colorId
      )
      if (!otherSellable) {
        throw new AppError(
          `Cannot delete the last sellable color of an active product. Deactivate the product first, or add another color.`,
          409
        )
      }
    }
  }

  await withTransaction(async (tx) => {
    if (sizeIds.length > 0) {
      await productRepo.cleanupCartItemsBySizeIds(sizeIds, tx)
    }
    await variantRepo.removeColorById(colorId, tx) // cascades to sizes
  })

  // Cloudinary cleanup AFTER the DB commit — if the DB rolls back, images stay.
  await deleteImage(color.imagePublicId)
  await Promise.all((color.imagePublicIds ?? []).map(deleteImage))
}

export const addSize = async (colorId: string, data: AddSizeInput) => {
  const color = await variantRepo.findColorById(colorId)
  if (!color) throw new AppError('Color not found', 404)

  const duplicate = await variantRepo.findSizeByColorAndLabel(colorId, data.size)
  if (duplicate) {
    throw new AppError('This size already exists for this color', 409)
  }

  return variantRepo.createSize({
    colorId,
    size: data.size,
    stock: data.stock,
    sku: data.sku ?? null,
    price: data.price ?? null,
  })
}

export const updateSize = async (
  { colorId, sizeId }: { colorId: string; sizeId: string },
  data: UpdateSizeInput
) => {
  const size = await variantRepo.findSizeById(sizeId)
  if (!size) throw new AppError('Size not found', 404)

  const updateData: Prisma.ProductSizeUncheckedUpdateInput = {}
  if (data.size !== undefined && data.size !== size.size) {
    const duplicate = await variantRepo.findSizeByColorAndLabel(
      colorId,
      data.size
    )
    if (duplicate) {
      throw new AppError('This size already exists for this color', 409)
    }
    updateData.size = data.size
  }
  if (data.stock !== undefined) updateData.stock = data.stock
  if (data.sku !== undefined) updateData.sku = data.sku ?? null
  if (data.price !== undefined) updateData.price = data.price ?? null
  if (data.isActive !== undefined) updateData.isActive = data.isActive

  return variantRepo.updateSizeById(sizeId, updateData)
}

export const deleteSize = async (sizeId: string) => {
  const size = await variantRepo.findSizeWithContext(sizeId)
  if (!size) throw new AppError('Size not found', 404)

  const orderItemCount = await productRepo.countOrderItemsBySizeIds([sizeId])
  if (orderItemCount > 0) {
    throw new AppError(
      `Cannot delete this size — it's been ordered. Disable it via PATCH isActive=false instead.`,
      409
    )
  }

  // Last-sellable guard, two-step:
  //   1. Is there another active size under THIS color?
  //   2. If not, is any OTHER color on the product still sellable?
  if (size.isActive && size.color.isActive && size.color.product.isActive) {
    const otherSizeInColor = await variantRepo.findOtherActiveSizeInColor(
      size.colorId,
      sizeId
    )
    if (!otherSizeInColor) {
      const otherSellableColor = await variantRepo.findOtherSellableColor(
        size.color.productId,
        size.colorId
      )
      if (!otherSellableColor) {
        throw new AppError(
          `Cannot delete the last sellable size of an active product. Deactivate the product first, or add another size.`,
          409
        )
      }
    }
  }

  await withTransaction(async (tx) => {
    await productRepo.cleanupCartItemsBySizeIds([sizeId], tx)
    await variantRepo.removeSizeById(sizeId, tx)
  })
}

export const getVariantsBulk = async (ids: string[]) => {
  if (!Array.isArray(ids) || ids.length === 0) return []

  const sizes = await variantRepo.findProductSizesForBulk(ids)

  return sizes.map((s) => ({
    id: s.id,
    size: s.size,
    stock: s.stock,
    isActive: s.isActive && s.color.isActive && s.color.product.isActive,
    price: Number(s.price ?? s.color.product.price),
    productId: s.color.product.id,
    productName: s.color.product.name,
    productSlug: s.color.product.slug,
    colorId: s.color.id,
    colorName: s.color.name,
    colorImage: s.color.imageUrl,
  }))
}
