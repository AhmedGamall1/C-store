import prisma from '../config/database.js'
import AppError from '../utils/AppError.js'

const productSelect = {
  id: true,
  name: true,
  slug: true,
  price: true,
  comparePrice: true,
  imageUrl: true,
  stock: true,
  isActive: true,
}

// util function
const computeTotals = (items) => {
  const enriched = items.map((item) => ({
    ...item,
    subtotal: Number(item.product.price) * item.quantity,
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
        include: { product: { select: productSelect } },
        orderBy: { id: 'asc' },
      },
    },
  })

  if (!cart) return { items: [], total: 0, totalItems: 0 }

  const { items, total, totalItems } = computeTotals(cart.items)
  return { id: cart.id, items, total, totalItems }
}

// addItem
export const addItem = async (userId, { productId, quantity }) => {
  if (!productId) throw new AppError('productId is required', 400)

  const qty = Number(quantity)
  if (!qty || qty < 1) throw new AppError('Quantity must be at least 1', 400)

  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product || !product.isActive)
    throw new AppError('Product not found', 404)
  if (product.stock === 0) throw new AppError('Product is out of stock', 400)

  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  })

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  })

  const newQuantity = existingItem ? existingItem.quantity + qty : qty

  if (newQuantity > product.stock) {
    throw new AppError(
      `Cannot add ${qty} unit(s). Only ${
        product.stock - (existingItem?.quantity ?? 0)
      } remaining.`,
      400
    )
  }

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: newQuantity },
    create: { cartId: cart.id, productId, quantity: newQuantity },
  })

  return getCart(userId)
}

// updateItem
export const updateItem = async (userId, productId, quantity) => {
  const qty = Number(quantity)
  if (!qty || qty < 1) throw new AppError('Quantity must be at least 1', 400)

  const cart = await prisma.cart.findUnique({ where: { userId } })
  if (!cart) throw new AppError('Cart not found', 404)

  const item = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
    include: { product: { select: { stock: true } } },
  })
  if (!item) throw new AppError('Item not found in cart', 404)

  if (qty > item.product.stock) {
    throw new AppError(
      `Only ${item.product.stock} units
  available`,
      400
    )
  }

  await prisma.cartItem.update({
    where: { cartId_productId: { cartId: cart.id, productId } },
    data: { quantity: qty },
  })

  return getCart(userId)
}

// removeItem
export const removeItem = async (userId, productId) => {
  const cart = await prisma.cart.findUnique({ where: { userId } })
  if (!cart) throw new AppError('Cart not found', 404)

  const item = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  })
  if (!item) throw new AppError('Item not found in cart', 404)

  await prisma.cartItem.delete({
    where: { cartId_productId: { cartId: cart.id, productId } },
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
