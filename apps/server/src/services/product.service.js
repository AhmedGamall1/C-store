import prisma from '../config/database.js'
import AppError from '../utils/AppError.js'
import { deleteImage, uploadImage } from '../utils/cloudinary.util.js'
import slugify from '../utils/slugify.js'

const PRODUCTS_FOLDER = 'c-store/products'

// What a product card shows on listing pages
const productCardInclude = {
  category: { select: { id: true, name: true, slug: true } },
  colors: {
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      hex: true,
      imageUrl: true,
    },
  },
}

const hasSellableVariant = {
  colors: {
    some: {
      isActive: true,
      sizes: { some: { isActive: true } },
    },
  },
}
// Products are only "buyable" if they themselves are active, their category is
// active, AND they have at least one active color that has at least one active
// size with stock > 0. Used on all public reads.
// const buyableProductWhere = {
//   isActive: true,
//   category: { isActive: true },
//   colors: {
//     some: {
//       isActive: true,
//       sizes: {
//         some: { isActive: true, stock: { gt: 0 } },
//       },
//     },
//   },
// }

// Full detail shape for a single product page
const productDetailInclude = {
  category: { select: { id: true, name: true, slug: true } },
  colors: {
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
    include: {
      sizes: {
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  },
  reviews: {
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  },
  _count: { select: { reviews: true } },
}

// getAllProductsAdmin — no active filters, shows everything
export const getAllProductsAdmin = async (query) => {
  const {
    page = 1,
    limit = 20,
    category,
    search,
    sortBy = 'createdAt',
    order = 'desc',
  } = query

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const where = {}
  if (category) {
    where.category = { slug: category }
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  const allowedSortFields = ['createdAt', 'price', 'name']
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt'
  const sortOrder = order === 'asc' ? 'asc' : 'desc'

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: { [sortField]: sortOrder },
      include: productCardInclude,
    }),
    prisma.product.count({ where }),
  ])
  return {
    products,
    pagination: {
      total,
      page: Number(page),
      limit: take,
      totalPages: Math.ceil(total / take),
      hasNextPage: skip + take < total,
      hasPrevPage: Number(page) > 1,
    },
  }
}

// getProductByIdAdmin — fetch by ID, no active filter (for admin edit)
export const getProductByIdAdmin = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      colors: {
        orderBy: { createdAt: 'asc' },
        include: {
          sizes: { orderBy: { createdAt: 'asc' } },
        },
      },
    },
  })

  if (!product) {
    throw new AppError('Product not found', 404)
  }

  return product
}

// getAllProducts with pagination, filtering, sorting, and search
export const getAllProducts = async (query) => {
  const {
    // pagination defaults if user doesn't provide them
    page = 1,
    limit = 12,
    // filtering and sorting
    category,
    minPrice,
    maxPrice,
    // search term for name and description
    search,
    // sorting defaults
    sortBy = 'createdAt',
    order = 'desc',
  } = query

  // pagination calculations
  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  // build filter dynamically
  const where = {
    isActive: true,
    category: { isActive: true },
    ...hasSellableVariant,
  }
  if (category) {
    where.category = { slug: category }
  }

  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) where.price.gte = Number(minPrice)
    if (maxPrice) where.price.lte = Number(maxPrice)
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  // valid sort fields — never trust user input for sort column
  const allowedSortFields = ['createdAt', 'price', 'name']
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt'
  const sortOrder = order === 'asc' ? 'asc' : 'desc'

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: { [sortField]: sortOrder },
      include: productCardInclude,
    }),
    prisma.product.count({ where }),
  ])
  return {
    products,
    pagination: {
      total,
      page: Number(page),
      limit: take,
      totalPages: Math.ceil(total / take),
      hasNextPage: skip + take < total,
      hasPrevPage: Number(page) > 1,
    },
  }
}

// getProductBySlug
export const getProductBySlug = async (slug) => {
  const product = await prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
      category: { isActive: true },
      ...hasSellableVariant,
    },
    include: productDetailInclude,
  })

  if (!product) {
    throw new AppError('Product not found', 404)
  }

  return product
}

// Admin functions - createProduct
export const createProduct = async (data, files = {}) => {
  const { name, description, price, comparePrice, sku, categoryId } = data
  const { imageBuffer } = files

  if (!name || !price || !categoryId) {
    throw new AppError('Name, price and category are required', 400)
  }
  if (!imageBuffer) {
    throw new AppError('Product image is required', 400)
  }
  if (Number(price) <= 0) {
    throw new AppError('Price must be greater than zero', 400)
  }
  if (comparePrice && Number(comparePrice) <= Number(price)) {
    throw new AppError('Compare price must be greater than selling price', 400)
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  })
  if (!category) {
    throw new AppError('Category not found', 404)
  }

  const slug = slugify(name)
  const existing = await prisma.product.findUnique({ where: { slug } })
  if (existing) {
    throw new AppError('Product with this name already exists', 409)
  }

  const cover = await uploadImage(imageBuffer, PRODUCTS_FOLDER)

  return prisma.product.create({
    data: {
      name: name.trim(),
      slug,
      description: description?.trim(),
      price: Number(price),
      comparePrice: comparePrice ? Number(comparePrice) : null,
      sku: sku?.trim() ?? null,
      imageUrl: cover.secure_url,
      imagePublicId: cover.public_id,
      categoryId,
    },
    include: { category: { select: { id: true, name: true, slug: true } } },
  })
}

// Admin functions - updateProduct
export const updateProduct = async (id, data, files = {}) => {
  const { imageBuffer } = files
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) {
    throw new AppError('Product not found', 404)
  }

  const { name, price, comparePrice, isActive, categoryId, description, sku } =
    data

  const updateData = {
    ...(name && { name: name.trim(), slug: slugify(name) }),
    ...(price !== undefined && { price: Number(price) }),
    ...(comparePrice !== undefined && {
      comparePrice: comparePrice ? Number(comparePrice) : null,
    }),
    ...(isActive !== undefined && {
      isActive: isActive === 'true' || isActive === true,
    }),
    ...(description !== undefined && {
      description: description?.trim() || null,
    }),
    ...(sku !== undefined && { sku: sku?.trim() || null }),
  }

  // Only touch categoryId if it's a non-empty value AND actually different.
  // Verify it exists to avoid the raw FK-violation error.
  if (categoryId && categoryId !== product.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    })
    if (!category) {
      throw new AppError('Category not found', 404)
    }
    updateData.categoryId = categoryId
  }

  if (imageBuffer) {
    await deleteImage(product.imagePublicId)
    const result = await uploadImage(imageBuffer, PRODUCTS_FOLDER)
    updateData.imageUrl = result.secure_url
    updateData.imagePublicId = result.public_id
  }

  return prisma.product.update({
    where: { id },
    data: updateData,
    include: { category: { select: { id: true, name: true, slug: true } } },
  })
}

// Admin functions - deleteProduct (soft delete)
export const deleteProduct = async (id) => {
  const product = await prisma.product.findUnique({ where: { id } })

  if (!product) {
    throw new AppError('Product not found', 404)
  }

  // soft delete — keeps data integrity for historical orders
  return prisma.product.update({
    where: { id },
    data: { isActive: false },
  })
}

// Admin functions - forceDeleteProduct (hard delete)
export const forceDeleteProduct = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      colors: { include: { sizes: { select: { id: true } } } },
    },
  })

  if (!product) {
    throw new AppError('Product not found', 404)
  }

  const sizeIds = product.colors.flatMap((c) => c.sizes.map((s) => s.id))

  if (sizeIds.length > 0) {
    const orderItemCount = await prisma.orderItem.count({
      where: { productSizeId: { in: sizeIds } },
    })
    if (orderItemCount > 0) {
      throw new AppError(
        `Cannot hard-delete this product — it has ${orderItemCount} item(s) in existing orders. Use soft delete instead.`,
        409
      )
    }
  }

  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { productSizeId: { in: sizeIds } } }),
    prisma.review.deleteMany({ where: { productId: id } }),
    prisma.product.delete({ where: { id } }), // cascades to colors → sizes
  ])

  await deleteImage(product.imagePublicId)
  for (const color of product.colors) {
    await deleteImage(color.imagePublicId)
    await Promise.all((color.imagePublicIds ?? []).map(deleteImage))
  }
}
