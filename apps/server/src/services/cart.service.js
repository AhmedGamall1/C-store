import prisma from '../config/database.js'
import AppError from '../utils/AppError.js'

const cartItemInclude = {
  productSize: {
    include: {
      color: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              comparePrice: true,
              isActive: true,
            },
          },
        },
      },
    },
  },
}

// Resolve the unit price: size override wins; otherwise product price.
const unitPriceOf = (item) =>
  Number(item.productSize.price ?? item.productSize.color.product.price)

const computeTotals = (items) => {
  const enriched = items.map((item) => ({
    ...item,
    unitPrice: unitPriceOf(item),
    subtotal: unitPriceOf(item) * item.quantity,
  }))
  const total = enriched.reduce((sum, item) => sum + item.subtotal, 0)
  const totalItems = enriched.reduce((sum, item) => sum + item.quantity, 0)
  return { items: enriched, total, totalItems }
}

// getCart
export const getCart = async (userId) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: cartItemInclude,
        orderBy: { id: 'asc' },
      },
    },
  })

  if (!cart) return { items: [], total: 0, totalItems: 0 }

  const { items, total, totalItems } = computeTotals(cart.items)
  return { id: cart.id, items, total, totalItems }
}

// Central SKU lookup + availability validation
const getAvailableSize = async (productSizeId) => {
  if (!productSizeId) throw new AppError('productSizeId is required', 400)

  const size = await prisma.productSize.findUnique({
    where: { id: productSizeId },
    include: { color: { include: { product: true } } },
  })

  if (!size) throw new AppError('Variant not found', 404)

  const product = size.color.product
  if (!size.isActive || !size.color.isActive || !product.isActive) {
    throw new AppError('Variant is no longer available', 410)
  }

  return size
}

// addItem — body: { productSizeId, quantity }
export const addItem = async (userId, { productSizeId, quantity }) => {
  const qty = Number(quantity)
  if (!qty || qty < 1) throw new AppError('Quantity must be at least 1', 400)

  const size = await getAvailableSize(productSizeId)

  if (size.stock === 0) {
    throw new AppError('This variant is out of stock', 400)
  }

  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  })

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productSizeId: { cartId: cart.id, productSizeId } },
  })

  const newQuantity = existing ? existing.quantity + qty : qty

  if (newQuantity > size.stock) {
    throw new AppError(
      `Cannot add ${qty} unit(s). Only ${
        size.stock - (existing?.quantity ?? 0)
      } remaining.`,
      400
    )
  }

  await prisma.cartItem.upsert({
    where: { cartId_productSizeId: { cartId: cart.id, productSizeId } },
    update: { quantity: newQuantity },
    create: { cartId: cart.id, productSizeId, quantity: newQuantity },
  })

  return getCart(userId)
}

// updateItem — URL: /items/:productSizeId  body: { quantity }
export const updateItem = async (userId, productSizeId, quantity) => {
  const qty = Number(quantity)
  if (!qty || qty < 1) throw new AppError('Quantity must be at least 1', 400)

  const cart = await prisma.cart.findUnique({ where: { userId } })
  if (!cart) throw new AppError('Cart not found', 404)

  const item = await prisma.cartItem.findUnique({
    where: { cartId_productSizeId: { cartId: cart.id, productSizeId } },
    include: { productSize: { select: { stock: true } } },
  })
  if (!item) throw new AppError('Item not found in cart', 404)

  if (qty > item.productSize.stock) {
    throw new AppError(`Only ${item.productSize.stock} units available`, 400)
  }

  await prisma.cartItem.update({
    where: { cartId_productSizeId: { cartId: cart.id, productSizeId } },
    data: { quantity: qty },
  })

  return getCart(userId)
}

// removeItem
export const removeItem = async (userId, productSizeId) => {
  const cart = await prisma.cart.findUnique({ where: { userId } })
  if (!cart) throw new AppError('Cart not found', 404)

  const item = await prisma.cartItem.findUnique({
    where: { cartId_productSizeId: { cartId: cart.id, productSizeId } },
  })
  if (!item) throw new AppError('Item not found in cart', 404)

  await prisma.cartItem.delete({
    where: { cartId_productSizeId: { cartId: cart.id, productSizeId } },
  })

  return getCart(userId)
}

// clearCart
export const clearCart = async (userId) => {
  const cart = await prisma.cart.findUnique({ where: { userId } })
  if (!cart) throw new AppError('Cart not found', 404)

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

  return getCart(userId)
}

// Merge a client-held guest cart (items from localStorage) into the user's DB cart.
export const mergeGuestCart = async (userId, items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return getCart(userId)
  }

  // Normalize + de-duplicate incoming items (client might send dupes)
  const incoming = new Map()
  for (const raw of items) {
    const productSizeId = raw?.productSizeId
    const qty = Number(raw?.quantity)
    if (!productSizeId || !qty || qty < 1) continue
    incoming.set(productSizeId, (incoming.get(productSizeId) ?? 0) + qty)
  }
  if (incoming.size === 0) return getCart(userId)

  // Pull current stock/active state for all incoming ids in one shot
  const sizes = await prisma.productSize.findMany({
    where: { id: { in: [...incoming.keys()] } },
    include: {
      color: { include: { product: { select: { isActive: true } } } },
    },
  })
  const sizeById = new Map(sizes.map((s) => [s.id, s]))

  const userCart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  })

  await prisma.$transaction(async (tx) => {
    for (const [productSizeId, addQty] of incoming) {
      const size = sizeById.get(productSizeId)
      if (!size) continue // variant deleted
      if (
        !size.isActive ||
        !size.color.isActive ||
        !size.color.product.isActive
      )
        continue
      if (size.stock < 1) continue

      const existing = await tx.cartItem.findUnique({
        where: { cartId_productSizeId: { cartId: userCart.id, productSizeId } },
      })

      const desired = (existing?.quantity ?? 0) + addQty
      const clamped = Math.min(desired, size.stock)
      if (clamped < 1) continue

      await tx.cartItem.upsert({
        where: { cartId_productSizeId: { cartId: userCart.id, productSizeId } },
        update: { quantity: clamped },
        create: { cartId: userCart.id, productSizeId, quantity: clamped },
      })
    }
  })

  return getCart(userId)
}
