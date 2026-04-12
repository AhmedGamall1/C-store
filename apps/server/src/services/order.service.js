import prisma from '../config/database.js'
import AppError from '../utils/AppError.js'
import { getShippingCost } from '../config/shipping.js'

const PAYMOB_RESERVATION_MINUTES = 30

const orderInclude = {
  items: {
    include: {
      product: {
        select: { id: true, name: true, slug: true, imageUrl: true },
      },
    },
  },
  address: true,
}

// create order
export const createOrder = async (
  userId,
  { addressId, paymentMethod = 'COD', items, clearCart, notes }
) => {
  // Validate items array
  if (!items || items.length === 0) {
    throw new AppError('Order must contain at least one item', 400)
  }

  // validate user's address
  const address = await prisma.address.findUnique({ where: { id: addressId } })

  if (!address || address.userId !== userId) {
    throw new AppError('Address not found', 404)
  }

  // get shipping cost
  const shippingCost = getShippingCost(address.governorate)
  if (shippingCost === null) {
    throw new AppError(
      `Shipping is not available for governorate: ${address.governorate}`,
      400
    )
  }

  // fetch and validate all products
  const productIds = items.map((i) => i.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    select: { id: true, name: true, price: true, stock: true },
  })

  if (products.length !== productIds.length) {
    throw new AppError(
      'One or more products were not found or are unavailable',
      400
    )
  }

  // Build a lookup map for O(1) access
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]))

  // Validate stock before entering transaction
  for (const item of items) {
    const product = productMap[item.productId]
    if (item.quantity < 1) {
      throw new AppError(`Invalid quantity for "${product.name}"`, 400)
    }
    if (item.quantity > product.stock) {
      throw new AppError(
        `Insufficient stock for "${product.name}". Available: ${product.stock}`,
        400
      )
    }
  }

  // 6. Calculate totals
  const subtotal = items.reduce(
    (sum, item) =>
      sum + Number(productMap[item.productId].price) * item.quantity,
    0
  )
  const total = subtotal + shippingCost

  const reservedUntil =
    paymentMethod === 'PAYMOB'
      ? new Date(Date.now() + PAYMOB_RESERVATION_MINUTES * 60 * 1000)
      : null

  // Atomic transaction DB ACTION
  const order = await prisma.$transaction(async (tx) => {
    // 1- create the order
    const newOrder = await tx.order.create({
      data: {
        userId,
        addressId,
        paymentMethod,
        subtotal,
        shippingCost,
        total,
        reservedUntil,
        notes: notes?.trim() ?? null,
      },
    })

    // 2- create order-items (snapshot prices)
    await tx.orderItem.createMany({
      data: items.map((item) => ({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: productMap[item.productId].price, // immutable price snapshot
      })),
    })

    // 3- Race-condition-safe stock decrement
    for (const item of items) {
      const result = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      })
      if (result.count === 0) {
        throw new AppError(
          `"${productMap[item.productId].name}" just went out of stock`,
          409
        )
      }
    }

    // Only clear cart if explicitly requested (cart checkout flow)
    if (clearCart) {
      const cart = await tx.cart.findUnique({ where: { userId } })
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } })
      }
    }

    return tx.order.findUnique({
      where: { id: newOrder.id },
      include: orderInclude,
    })
  })

  return order
}

// get user's orders
export const getMyOrders = async (userId) => {
  return prisma.order.findMany({
    where: { userId },
    include: orderInclude,
    orderBy: { createdAt: 'desc' },
  })
}

// get single user order by id
export const getOrderById = async (userId, orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  })

  if (!order || order.userId !== userId) {
    throw new AppError('Order not found', 404)
  }

  return order
}

// cancel order
export const cancelOrder = async (userId, orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })

  if (!order || order.userId !== userId) {
    throw new AppError('Order not found', 404)
  }

  if (order.status !== 'PENDING') {
    throw new AppError(
      `Cannot cancel an order with status: ${order.status}`,
      400
    )
  }

  // Restore stock + update status atomically
  return prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      })
    }

    return tx.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED', reservedUntil: null },
      include: orderInclude,
    })
  })
}
