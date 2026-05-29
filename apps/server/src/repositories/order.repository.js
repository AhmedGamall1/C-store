import prisma from '../config/database.js'

const orderInclude = {
  items: true,
  address: true,
}

const adminOrderInclude = {
  items: {
    include: {
      productSize: {
        select: {
          id: true,
          color: {
            select: {
              imageUrl: true,
              product: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      },
    },
  },
  address: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
  },
}

// ---------- reads ----------
export const findManyForUser = (userId) =>
  prisma.order.findMany({
    where: { userId },
    include: orderInclude,
    orderBy: { createdAt: 'desc' },
  })

// userId narrows ownership at the query level.
export const findByIdForUser = (orderId, userId) =>
  prisma.order.findFirst({
    where: { id: orderId, userId },
    include: orderInclude,
  })

export const findByIdAdmin = (orderId) =>
  prisma.order.findUnique({
    where: { id: orderId },
    include: adminOrderInclude,
  })

// Used by cancel/status flows that need items but not the heavy admin shape.
export const findByIdWithItems = (orderId, tx = prisma) =>
  tx.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })

// Atomic list + count for admin pagination.
export const findManyAdmin = ({ where, skip, take }) =>
  prisma.$transaction([
    prisma.order.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: adminOrderInclude,
    }),
    prisma.order.count({ where }),
  ])

// ---------- writes ----------
export const createOrder = (data, tx = prisma) => tx.order.create({ data })

export const createOrderItems = (rows, tx = prisma) =>
  tx.orderItem.createMany({ data: rows })

// Race-safe: returns count=0 if not enough stock; caller decides what to do.
export const decrementSizeStock = (sizeId, qty, tx = prisma) =>
  tx.productSize.updateMany({
    where: { id: sizeId, stock: { gte: qty } },
    data: { stock: { decrement: qty } },
  })

export const incrementSizeStock = (sizeId, qty, tx = prisma) =>
  tx.productSize.updateMany({
    where: { id: sizeId },
    data: { stock: { increment: qty } },
  })

export const updateOrder = (orderId, data, tx = prisma) =>
  tx.order.update({
    where: { id: orderId },
    data,
    include: orderInclude,
  })

export const findByIdWithOrderInclude = (orderId, tx = prisma) =>
  tx.order.findUnique({ where: { id: orderId }, include: orderInclude })

export const savePaymobOrderId = (orderId, paymobOrderId) =>
  prisma.order.update({
    where: { id: orderId },
    data: { paymobOrderId },
  })

export const findByPaymobOrderId = (paymobOrderId) =>
  prisma.order.findFirst({
    where: { paymobOrderId },
    include: { items: true },
  })
