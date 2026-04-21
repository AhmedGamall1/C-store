import prisma from '../config/database.js'
import AppError from '../utils/AppError.js'
import { getShippingCost } from '../config/shipping.js'
import generateOrderNumber from '../utils/orderNumber.js'

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
export const createOrder = async (user, body) => {
  const { paymentMethod = 'COD', items, notes, clearCart } = body

  if (!items || items.length === 0) {
    throw new AppError('Order must contain at least one item', 400)
  }

  let savedAddress = null
  let shippingSnapshot = null
  let shippingGovernorate

  if (user) {
    if (!body.addressId) {
      throw new AppError('addressId is required', 400)
    }
    savedAddress = await prisma.address.findUnique({
      where: { id: body.addressId },
    })
    if (!savedAddress || savedAddress.userId !== user.id) {
      throw new AppError('Address not found', 404)
    }
    shippingGovernorate = savedAddress.governorate
  } else {
    const { guest, shippingAddress } = body
    if (!guest?.name || !guest?.phone) {
      throw new AppError(
        'Guest contact info (email, name, phone) is required',
        400
      )
    }
    if (
      !shippingAddress?.street ||
      !shippingAddress?.city ||
      !shippingAddress?.governorate
    ) {
      throw new AppError(
        'Shipping address (street, city, governorate) is required',
        400
      )
    }
    shippingSnapshot = shippingAddress
    shippingGovernorate = shippingAddress.governorate
  }

  const shippingCost = getShippingCost(shippingGovernorate)
  if (shippingCost === null) {
    throw new AppError(
      `Shipping is not available for governorate: ${shippingGovernorate}`,
      400
    )
  }

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

  const productMap = Object.fromEntries(products.map((p) => [p.id, p]))

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

  const orderData = {
    orderNumber: generateOrderNumber(),
    paymentMethod,
    subtotal,
    shippingCost,
    total,
    reservedUntil,
    notes: notes?.trim() ?? null,
  }

  if (user) {
    orderData.userId = user.id
    orderData.addressId = body.addressId
  } else {
    if (orderData.guestEmail) {
      orderData.guestEmail = body.guest.email
    }
    orderData.guestName = body.guest.name
    orderData.guestPhone = body.guest.phone
    orderData.shippingStreet = shippingSnapshot.street
    orderData.shippingCity = shippingSnapshot.city
    orderData.shippingGovernorate = shippingSnapshot.governorate
  }

  // Atomic transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({ data: orderData })

    await tx.orderItem.createMany({
      data: items.map((item) => ({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: productMap[item.productId].price,
      })),
    })

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

    // Only logged-in users have a server cart to clear
    if (user && clearCart) {
      const cart = await tx.cart.findUnique({ where: { userId: user.id } })
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

export const savePaymobOrderId = async (orderId, paymobOrderId) => {
  return prisma.order.update({
    where: { id: orderId },
    data: { paymobOrderId },
  })
}

///////////// Admin /////////////////

const VALID_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

// Admin: get all orders with filtering + pagination
export const getAllOrders = async (query) => {
  const { page = 1, limit = 20, status, paymentStatus, paymentMethod } = query

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const where = {}
  if (status) where.status = status
  if (paymentStatus) where.paymentStatus = paymentStatus
  if (paymentMethod) where.paymentMethod = paymentMethod

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        ...orderInclude,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ])

  return {
    orders,
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

// Admin: update order status with enforced transitions
export const updateOrderStatus = async (orderId, newStatus) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })

  if (!order) {
    throw new AppError('Order not found', 404)
  }

  const allowed = VALID_TRANSITIONS[order.status]

  if (!allowed || !allowed.includes(newStatus)) {
    throw new AppError(
      `Cannot transition from ${order.status} to ${newStatus}`,
      400
    )
  }

  // Cancellation → restore stock atomically
  if (newStatus === 'CANCELLED') {
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

  // Normal transition
  const updateData = { status: newStatus }

  // COD delivered = payment collected
  if (newStatus === 'DELIVERED' && order.paymentMethod === 'COD') {
    updateData.paymentStatus = 'PAID'
  }

  // Confirming clears the reservation — it served its purpose
  if (newStatus === 'CONFIRMED') {
    updateData.reservedUntil = null
  }

  return prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: orderInclude,
  })
}
