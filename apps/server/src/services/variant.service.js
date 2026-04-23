import prisma from '../config/database.js'
import AppError from '../utils/AppError.js'
import { deleteImage, uploadImage } from '../utils/cloudinary.util.js'

const COLORS_FOLDER = 'c-store/products/colors'

const parseSizes = (raw) => {
  if (!raw) return []
  let arr = raw
  if (typeof raw === 'string') {
    try {
      arr = JSON.parse(raw)
    } catch {
      throw new AppError('sizes must be valid JSON', 400)
    }
  }
  if (!Array.isArray(arr)) {
    throw new AppError('sizes must be an array', 400)
  }
  return arr.map((s) => {
    if (!s?.size) throw new AppError('Each size must have a size label', 400)
    return {
      size: String(s.size).trim(),
      stock: Number.isFinite(+s.stock) ? Math.max(0, Math.floor(+s.stock)) : 0,
      sku: s.sku?.trim() || null,
      price: s.price ? Number(s.price) : null,
    }
  })
}

export const addColor = async (productId, data, files = {}) => {
  const { name, hex, sizes } = data
  const { imageBuffer, galleryBuffers = [] } = files

  if (!name) throw new AppError('Color name is required', 400)
  if (!imageBuffer) throw new AppError('Color cover image is required', 400)

  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) throw new AppError('Product not found', 404)

  const trimmed = name.trim()
  const duplicate = await prisma.productColor.findUnique({
    where: { productId_name: { productId, name: trimmed } },
  })
  if (duplicate) {
    throw new AppError('This color already exists for this product', 409)
  }

  const parsedSizes = parseSizes(sizes)

  const cover = await uploadImage(imageBuffer, COLORS_FOLDER)

  let images = []
  let imagePublicIds = []
  if (galleryBuffers.length) {
    const results = await Promise.all(
      galleryBuffers.map((buf) => uploadImage(buf, COLORS_FOLDER))
    )
    images = results.map((r) => r.secure_url)
    imagePublicIds = results.map((r) => r.public_id)
  }

  return prisma.productColor.create({
    data: {
      productId,
      name: trimmed,
      hex: hex?.trim() || null,
      imageUrl: cover.secure_url,
      imagePublicId: cover.public_id,
      images,
      imagePublicIds,
      sizes: parsedSizes.length ? { create: parsedSizes } : undefined,
    },
    include: { sizes: true },
  })
}

export const updateColor = async (colorId, data, files = {}) => {
  const color = await prisma.productColor.findUnique({ where: { id: colorId } })
  if (!color) throw new AppError('Color not found', 404)

  const { productId } = color
  const { imageBuffer, galleryBuffers = [] } = files
  const updateData = {}

  if (data.name !== undefined) {
    const trimmed = data.name.trim()
    if (trimmed !== color.name) {
      const duplicate = await prisma.productColor.findUnique({
        where: { productId_name: { productId, name: trimmed } },
      })
      if (duplicate) {
        throw new AppError('This color already exists for this product', 409)
      }
    }
    updateData.name = trimmed
  }
  if (data.hex !== undefined) updateData.hex = data.hex?.trim() || null
  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive === true || data.isActive === 'true'
  }

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

  return prisma.productColor.update({
    where: { id: colorId },
    data: updateData,
    include: { sizes: true },
  })
}

export const deleteColor = async (colorId) => {
  const color = await prisma.productColor.findUnique({
    where: { id: colorId },
    include: { sizes: { select: { id: true } } },
  })
  if (!color) throw new AppError('Color not found', 404)

  const sizeIds = color.sizes.map((s) => s.id)

  if (sizeIds.length > 0) {
    const orderItemCount = await prisma.orderItem.count({
      where: { productSizeId: { in: sizeIds } },
    })
    if (orderItemCount > 0) {
      throw new AppError(
        `Cannot delete this color — it's been ordered. Disable it via PATCH isActive=false instead.`,
        409
      )
    }
  }

  // Last-sellable-variant guard: if this color is currently sellable AND
  // the product is active, make sure at least one OTHER sellable color exists.
  if (color.isActive) {
    const product = await prisma.product.findUnique({
      where: { id: color.productId },
      select: { isActive: true },
    })
    if (product?.isActive) {
      const otherSellableColor = await prisma.productColor.findFirst({
        where: {
          productId: color.productId,
          id: { not: colorId },
          isActive: true,
          sizes: { some: { isActive: true } },
        },
        select: { id: true },
      })
      if (!otherSellableColor) {
        throw new AppError(
          `Cannot delete the last sellable color of an active product. Deactivate the product first, or add another color.`,
          409
        )
      }
    }
  }

  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { productSizeId: { in: sizeIds } } }),
    prisma.productColor.delete({ where: { id: colorId } }),
  ])

  await deleteImage(color.imagePublicId)
  await Promise.all((color.imagePublicIds ?? []).map(deleteImage))
}

export const addSize = async (colorId, data) => {
  const color = await prisma.productColor.findUnique({ where: { id: colorId } })
  if (!color) throw new AppError('Color not found', 404)

  if (!data.size) throw new AppError('Size label is required', 400)

  const duplicate = await prisma.productSize.findUnique({
    where: { colorId_size: { colorId, size: String(data.size).trim() } },
  })
  if (duplicate) {
    throw new AppError('This size already exists for this color', 409)
  }

  return prisma.productSize.create({
    data: {
      colorId,
      size: String(data.size).trim(),
      stock: Number.isFinite(+data.stock)
        ? Math.max(0, Math.floor(+data.stock))
        : 0,
      sku: data.sku?.trim() || null,
      price: data.price ? Number(data.price) : null,
    },
  })
}

export const updateSize = async ({ colorId, sizeId }, data) => {
  const size = await prisma.productSize.findUnique({ where: { id: sizeId } })
  if (!size) throw new AppError('Size not found', 404)

  const updateData = {}
  if (data.size !== undefined) {
    const trimmed = String(data.size).trim()

    if (trimmed !== size.size) {
      const duplicate = await prisma.productSize.findUnique({
        where: { colorId_size: { colorId, size: trimmed } },
      })
      if (duplicate) {
        throw new AppError('This size already exists for this color', 409)
      }
    }

    updateData.size = trimmed
  }
  if (data.stock !== undefined) {
    updateData.stock = Math.max(0, Math.floor(Number(data.stock) || 0))
  }
  if (data.sku !== undefined) updateData.sku = data.sku?.trim() || null
  if (data.price !== undefined) {
    updateData.price = data.price ? Number(data.price) : null
  }
  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive === true || data.isActive === 'true'
  }

  return prisma.productSize.update({ where: { id: sizeId }, data: updateData })
}

export const deleteSize = async (sizeId) => {
  const size = await prisma.productSize.findUnique({
    where: { id: sizeId },
    include: {
      color: {
        select: {
          id: true,
          isActive: true,
          productId: true,
          product: { select: { id: true, isActive: true } },
        },
      },
    },
  })
  if (!size) throw new AppError('Size not found', 404)

  const orderItemCount = await prisma.orderItem.count({
    where: { productSizeId: sizeId },
  })
  if (orderItemCount > 0) {
    throw new AppError(
      `Cannot delete this size — it's been ordered. Disable it via PATCH isActive=false instead.`,
      409
    )
  }

  // Last-sellable-variant guard
  if (size.isActive && size.color.isActive && size.color.product.isActive) {
    // Is there another active size under the SAME color?
    const otherSizeInColor = await prisma.productSize.findFirst({
      where: {
        colorId: size.colorId,
        id: { not: sizeId },
        isActive: true,
      },
      select: { id: true },
    })

    if (!otherSizeInColor) {
      // This color would become unsellable — is any OTHER color still sellable?
      const otherSellableColor = await prisma.productColor.findFirst({
        where: {
          productId: size.color.productId,
          id: { not: size.colorId },
          isActive: true,
          sizes: { some: { isActive: true } },
        },
        select: { id: true },
      })
      if (!otherSellableColor) {
        throw new AppError(
          `Cannot delete the last sellable size of an active product. Deactivate the product first, or add another size.`,
          409
        )
      }
    }
  }

  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { productSizeId: sizeId } }),
    prisma.productSize.delete({ where: { id: sizeId } }),
  ])
}
