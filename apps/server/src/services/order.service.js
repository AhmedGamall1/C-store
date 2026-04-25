import prisma from '../config/database.js'
import AppError from '../utils/AppError.js'
import { getShippingCost } from '../config/shipping.js'

const PAYMOB_RESERVATION_MINUTES = 30

const orderInclude = {
  items: true, // snapshots are self-contained; no need to join variant
  address: true,
}

// Reach through size → color → product so we can validate + resolve price
const sizeLookupInclude = {
  color: {
    include: {
      product: {
        select: { id: true, name: true, price: true, isActive: true },
      },
    },
  },
}

// Resolve the effective unit price for a size (size override wins, else product base)
const unitPriceOf = (size) => size.price ?? size.color.product.price

// Ensure size + its color + its product are all active and in stock for `qty`
const assertSizeAvailable = (size, qty) => {
  if (
    !size ||
    !size.isActive ||
    !size.color?.isActive ||
    !size.color?.product?.isActive
  ) {
    throw new AppError(
      'One or more selected variants are no longer available',
      400
    )
  }
  if (qty < 1) {
    throw new AppError(`Invalid quantity for "${size.color.product.name}"`, 400)
  }
  if (qty > size.stock) {
    throw new AppError(
      `Insufficient stock for "${size.color.product.name}" — ${size.color.name} / ${size.size}. Available: ${size.stock}`,
      400
    )
  }
}

// create order — supports both logged-in users and guests
export const createOrder = async (user, body) => {
  const { paymentMethod = 'COD', items, notes, clearCart } = body

  if (!items || items.length === 0) {
    throw new AppError('Order must contain at least one item', 400)
  }

  // --- address / governorate resolution (unchanged) ---
  let shippingSnapshot = null
  let shippingGovernorate // for shipping cost lookup

  if (user) {
    if (!body.addressId) throw new AppError('addressId is required', 400)
    const savedAddress = await prisma.address.findUnique({
      where: { id: body.addressId },
    })
    if (!savedAddress || savedAddress.userId !== user.id) {
      throw new AppError('Address not found', 404)
    }
    shippingGovernorate = savedAddress.governorate
  } else {
    const { guest, shippingAddress } = body
    if (!guest?.name || !guest?.phone) {
      throw new AppError('Guest contact info (name, phone) is required', 400)
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

  // --- variant lookup + validation ---
  const sizeIds = items.map((i) => i.productSizeId)

  // want to check that every item in sizeid array is exist
  if (sizeIds.some((id) => !id)) {
    throw new AppError('Each item must have a valid productSizeId', 400)
  }

  const sizes = await prisma.productSize.findMany({
    where: { id: { in: sizeIds } },
    include: sizeLookupInclude,
  })

  if (sizes.length !== sizeIds.length) {
    throw new AppError('One or more selected variants were not found', 400)
  }

  const sizeMap = Object.fromEntries(sizes.map((s) => [s.id, s]))

  for (const item of items) {
    assertSizeAvailable(sizeMap[item.productSizeId], item.quantity)
  }

  // --- totals ---
  const subtotal = items.reduce((sum, item) => {
    const size = sizeMap[item.productSizeId]
    return sum + Number(unitPriceOf(size)) * item.quantity
  }, 0)
  const total = subtotal + shippingCost

  const reservedUntil =
    paymentMethod === 'PAYMOB'
      ? new Date(Date.now() + PAYMOB_RESERVATION_MINUTES * 60 * 1000)
      : null

  const orderData = {
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
    orderData.guestEmail = body.guest.email
    orderData.guestName = body.guest.name
    orderData.guestPhone = body.guest.phone
    orderData.shippingStreet = shippingSnapshot.street
    orderData.shippingCity = shippingSnapshot.city
    orderData.shippingGovernorate = shippingSnapshot.governorate
  }

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({ data: orderData })

    // Snapshot everything onto OrderItem so receipts survive variant edits
    await tx.orderItem.createMany({
      data: items.map((item) => {
        const size = sizeMap[item.productSizeId]
        return {
          orderId: newOrder.id,
          productSizeId: size.id,
          quantity: item.quantity,
          price: unitPriceOf(size),
          size: size.size,
          colorName: size.color.name,
          colorHex: size.color.hex,
        }
      }),
    })

    // Race-safe decrement on the SIZE row
    for (const item of items) {
      const size = sizeMap[item.productSizeId]
      const result = await tx.productSize.updateMany({
        where: { id: size.id, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      })
      if (result.count === 0) {
        throw new AppError(
          `"${size.color.product.name}" (${size.color.name} / ${size.size}) just went out of stock`,
          409
        )
      }
    }

    // Clear the cart rows tied to the purchased sizes
    if (user && clearCart) {
      const cart = await tx.cart.findUnique({ where: { userId: user.id } })
      if (cart) {
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id, productSizeId: { in: sizeIds } },
        })
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

// cancel order — restore stock on the SIZE rows
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

  return prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      // Size may have been hard-deleted; only restore if it still exists
      if (item.productSizeId) {
        await tx.productSize.updateMany({
          where: { id: item.productSizeId },
          data: { stock: { increment: item.quantity } },
        })
      }
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
          select: { id: true, firstName: true, lastName: true, email: true },
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

export const updateOrderStatus = async (orderId, newStatus) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })
  if (!order) throw new AppError('Order not found', 404)

  const allowed = VALID_TRANSITIONS[order.status]
  if (!allowed || !allowed.includes(newStatus)) {
    throw new AppError(
      `Cannot transition from ${order.status} to ${newStatus}`,
      400
    )
  }

  // Cancellation → restore stock on the SIZE rows
  if (newStatus === 'CANCELLED') {
    return prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (item.productSizeId) {
          await tx.productSize.updateMany({
            where: { id: item.productSizeId },
            data: { stock: { increment: item.quantity } },
          })
        }
      }
      return tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED', reservedUntil: null },
        include: orderInclude,
      })
    })
  }

  const updateData = { status: newStatus }
  if (newStatus === 'DELIVERED' && order.paymentMethod === 'COD') {
    updateData.paymentStatus = 'PAID'
  }
  if (newStatus === 'CONFIRMED') {
    updateData.reservedUntil = null
  }

  return prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: orderInclude,
  })
}
