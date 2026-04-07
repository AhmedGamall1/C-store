import prisma from '../config/database.js'
import AppError from '../utils/AppError.js'
import slugify from '../utils/slugify.js'

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
  const where = { isActive: true }

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
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        comparePrice: true,
        imageUrl: true,
        stock: true,
        createdAt: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
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
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
      reviews: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: {
        select: { reviews: true },
      },
    },
  })

  if (!product || !product.isActive) {
    throw new AppError('Product not found', 404)
  }

  return product
}

// Admin functions - createProduct
export const createProduct = async (data) => {
  const {
    name,
    description,
    price,
    comparePrice,
    stock,
    sku,
    imageUrl,
    images,
    categoryId,
  } = data

  if (!name || !price || !categoryId) {
    throw new AppError('Name, price and category are required', 400)
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

  return prisma.product.create({
    data: {
      name: name.trim(),
      slug,
      description: description?.trim(),
      price: Number(price),
      comparePrice: comparePrice ? Number(comparePrice) : null,
      stock: stock ? Number(stock) : 0,
      sku: sku?.trim() ?? null,
      imageUrl: imageUrl ?? null,
      images: images ?? [],
      categoryId,
    },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  })
}

// Admin functions - updateProduct
export const updateProduct = async (id, data) => {
  const product = await prisma.product.findUnique({ where: { id } })

  if (!product) {
    throw new AppError('Product not found', 404)
  }

  const { name, price, comparePrice, stock, ...restData } = data

  const updateData = {
    ...restData,
    ...(name && { name: name.trim(), slug: slugify(name) }),
    ...(price !== undefined && { price: Number(price) }),
    ...(stock !== undefined && { stock: Number(stock) }),
    ...(comparePrice !== undefined && {
      comparePrice: comparePrice ? Number(comparePrice) : null,
    }),
  }

  return prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
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
