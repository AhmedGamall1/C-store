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

const computeTotals = (items) => {
  const enriched = items.map((item) => ({
    ...item,
    subtotal: Number(item.product.price) * item.quantity,
  }))
  const total = enriched.reduce((sum, item) => sum + item.subtotal, 0)
  const totalItems = enriched.reduce((sum, item) => sum + item.quantity, 0)
  return { items: enriched, total, totalItems }
}

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
