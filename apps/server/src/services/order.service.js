import prisma from '../config/database.js'
import AppError from '../utils/AppError.js'
import { getShippingCost } from '../config/shipping.js'
import { withTransaction } from '../repositories/transaction.js'
import * as orderRepo from '../repositories/order.repository.js'
import * as variantRepo from '../repositories/variant.repository.js'
import * as addressRepo from '../repositories/address.repository.js'
import * as cartRepo from '../repositories/cart.repository.js'

const PAYMOB_RESERVATION_MINUTES = 30

// size price override the main product price
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

  if (qty > size.stock) {
    throw new AppError(
      `Insufficient stock for "${size.color.product.name}" — ${size.color.name} / ${size.size}. Available: ${size.stock}`,
      400
    )
  }
}

// create order — supports both logged-in users and guests
export const createOrder = async (user, body) => {
  const { paymentMethod, items, notes, clearCart } = body

  // --- address / governorate resolution (unchanged) ---
  let shippingSnapshot = null
  let shippingGovernorate // for shipping cost lookup
  let addressId

  if (user) {
    const savedAddress = await addressRepo.findByIdForUser(
      body.addressId,
      user.id
    )

    if (!savedAddress || savedAddress.userId !== user.id) {
      throw new AppError('Address not found', 404)
    }

    addressId = savedAddress.id
    shippingGovernorate = savedAddress.governorate
  } else {
    shippingSnapshot = body.shippingAddress
    shippingGovernorate = body.shippingAddress.governorate
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
  const sizes = await variantRepo.findProductSizesForOrder(sizeIds)

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
    notes: notes ?? null,
  }

  if (user) {
    orderData.userId = user.id
    orderData.addressId = addressId
  } else {
    orderData.guestEmail = body.guest.email
    orderData.guestName = body.guest.name
    orderData.guestPhone = body.guest.phone
    orderData.shippingStreet = shippingSnapshot.street
    orderData.shippingCity = shippingSnapshot.city
    orderData.shippingGovernorate = shippingSnapshot.governorate
  }

  // open transaction to ensure all-or-nothing(ACID): order creation + order Items snapshots creation  + stock decrement + (optionally) cart clearance
  return withTransaction(async (tx) => {
    // 1- create new order
    const newOrder = await orderRepo.createOrder(orderData, tx)

    // 2- create order items with snapshot data (price, name)
    await orderRepo.createOrderItems(
      items.map((item) => {
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
      tx
    )

    // 3- Race-safe decrement stock on the size rows
    for (const item of items) {
      const size = sizeMap[item.productSizeId]
      const result = await orderRepo.decrementSizeStock(
        size.id,
        item.quantity,
        tx
      )
      if (result.count === 0) {
        throw new AppError(
          `"${size.color.product.name}" (${size.color.name} / ${size.size}) just went out of stock`,
          409
        )
      }
    }

    // 4- Optionally clear the cart
    if (user && clearCart) {
      const cart = await cartRepo.findCartByUserId(user.id)
      if (cart) {
        await cartRepo.deleteCartItemsBySizeIds(cart.id, sizeIds, tx)
      }
    }

    // 5- return the created order with items
    return orderRepo.findByIdWithOrderInclude(newOrder.id, tx)
  })
}

// get user's orders
export const getMyOrders = (userId) => orderRepo.findManyForUser(userId)

// get single user order by id
export const getOrderById = async (userId, orderId) => {
  const order = await orderRepo.findByIdForUser(orderId, userId)
  if (!order) throw new AppError('Order not found', 404)
  return order
}

// cancel order — restore stock on the SIZE rows (not supported yet)
export const cancelOrder = async (userId, orderId) => {
  const order = await orderRepo.findByIdForUser(orderId, userId)

  if (!order || order.userId !== userId) {
    throw new AppError('Order not found', 404)
  }
  if (order.status !== 'PENDING') {
    throw new AppError(
      `Cannot cancel an order with status: ${order.status}`,
      400
    )
  }

  return withTransaction(async (tx) => {
    // 1- increment stock if size still exists
    for (const item of order.items) {
      if (item.productSizeId) {
        await orderRepo.incrementSizeStock(
          item.productSizeId,
          item.quantity,
          tx
        )
      }
    }

    // 2- update order status + clear reservation
    return orderRepo.updateOrder(
      orderId,
      { status: 'CANCELLED', reservedUntil: null },
      tx
    )
  })
}

export const savePaymobOrderId = (orderId, paymobOrderId) =>
  orderRepo.savePaymobOrderId(orderId, paymobOrderId)

///////////// Admin /////////////////

const VALID_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
}

const buildAdminWhere = (query) => {
  const { status, paymentStatus, paymentMethod, q } = query
  const where = {}
  if (status) where.status = status
  if (paymentStatus) where.paymentStatus = paymentStatus
  if (paymentMethod) where.paymentMethod = paymentMethod

  if (q) {
    const term = q
    const asNumber = Number(term)
    where.OR = [
      { guestName: { contains: term, mode: 'insensitive' } },
      { guestEmail: { contains: term, mode: 'insensitive' } },
      { guestPhone: { contains: term, mode: 'insensitive' } },
      { user: { firstName: { contains: term, mode: 'insensitive' } } },
      { user: { lastName: { contains: term, mode: 'insensitive' } } },
      { user: { email: { contains: term, mode: 'insensitive' } } },
      ...(Number.isFinite(asNumber) ? [{ orderNumber: asNumber }] : []),
    ]
  }
  return where
}

export const getAllOrders = async (query) => {
  const { page, limit } = query
  const skip = (page - 1) * limit
  const where = buildAdminWhere(query)

  const [orders, total] = await orderRepo.findManyAdmin({
    where,
    skip,
    take: limit,
  })

  return {
    orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: skip + limit < total,
      hasPrevPage: page > 1,
    },
  }
}

export const getOrderByIdAdmin = async (orderId) => {
  const order = await orderRepo.findByIdAdmin(orderId)
  if (!order) throw new AppError('Order not found', 404)
  return order
}

export const updateOrderStatus = async (orderId, newStatus) => {
  const order = await orderRepo.findByIdWithItems(orderId)
  if (!order) throw new AppError('Order not found', 404)

  const allowed = VALID_TRANSITIONS[order.status]
  if (!allowed || !allowed.includes(newStatus)) {
    throw new AppError(
      `Cannot transition from ${order.status} to ${newStatus}`,
      400
    )
  }

  if (newStatus === 'CANCELLED') {
    return withTransaction(async (tx) => {
      for (const item of order.items) {
        if (item.productSizeId) {
          await orderRepo.incrementSizeStock(
            item.productSizeId,
            item.quantity,
            tx
          )
        }
      }
      return orderRepo.updateOrder(
        orderId,
        { status: 'CANCELLED', reservedUntil: null },
        tx
      )
    })
  }

  const updateData = { status: newStatus }
  if (newStatus === 'DELIVERED' && order.paymentMethod === 'COD') {
    updateData.paymentStatus = 'PAID'
  }
  if (newStatus === 'CONFIRMED') {
    updateData.reservedUntil = null
  }

  return orderRepo.updateOrder(orderId, updateData)
}
