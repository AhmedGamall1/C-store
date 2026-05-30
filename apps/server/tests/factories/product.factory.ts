import prisma from '../../src/config/database.js'

let counter = 0

// Builds a complete Category → Product → ProductColor → ProductSize chain.
export const createVariant = async (overrides = {}) => {
  counter += 1
  const tag = `t${Date.now()}-${counter}`

  // category creation
  const category = await prisma.category.create({
    data: {
      name: `Category ${tag}`,
      slug: `category-${tag}`,
      imageUrl: 'https://example.test/cat.jpg',
      imagePublicId: `cat-${tag}`,
      isActive: overrides.categoryActive ?? true,
    },
  })

  // product creation
  const product = await prisma.product.create({
    data: {
      name: overrides.productName ?? `Product ${tag}`,
      slug: `product-${tag}`,
      price: overrides.price ?? 100,
      imageUrl: 'https://example.test/p.jpg',
      imagePublicId: `p-${tag}`,
      categoryId: category.id,
      isActive: overrides.productActive ?? true,
    },
  })

  // color creation
  const color = await prisma.productColor.create({
    data: {
      productId: product.id,
      name: overrides.colorName ?? 'Black',
      hex: '#000000',
      imageUrl: 'https://example.test/c.jpg',
      imagePublicId: `c-${tag}`,
      images: [],
      imagePublicIds: [],
      isActive: overrides.colorActive ?? true,
    },
  })

  // size creation
  const size = await prisma.productSize.create({
    data: {
      colorId: color.id,
      size: overrides.size ?? 'M',
      stock: overrides.stock ?? 10,
      // size-level price override (optional — if null, product price wins)
      ...(overrides.sizePrice !== undefined && { price: overrides.sizePrice }),
      isActive: overrides.sizeActive ?? true,
    },
  })

  return { category, product, color, size }
}

// Standalone category factory — when a test needs a category but no product.
let catCounter = 0
export const createCategory = async (overrides = {}) => {
  catCounter += 1
  const tag = `c${Date.now()}-${catCounter}`
  return prisma.category.create({
    data: {
      name: overrides.name ?? `Cat ${tag}`,
      slug: overrides.slug ?? `cat-${tag}`,
      imageUrl: 'https://example.test/cat.jpg',
      imagePublicId: `cat-${tag}`,
      isActive: overrides.isActive ?? true,
    },
  })
}

// Build N product variants in one call. Each gets its own
// category + product + color + size, so they're independent.
// Use overrides per index by passing a function: createVariants(3, i => ({ price: i*10 }))
export const createVariants = async (count, overridesFn = () => ({})) => {
  const out = []
  for (let i = 0; i < count; i++) {
    out.push(await createVariant(overridesFn(i)))
  }
  return out
}
