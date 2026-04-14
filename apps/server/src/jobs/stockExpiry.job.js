import prisma from '../config/database.js'

const INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Finds all PAYMOB orders whose 30-minute reservation has expired
 * and the customer never completed payment.
 * Cancels each order and restores the reserved stock.
 */
const cancelExpiredReservations = async () => {
  const expiredOrders = await prisma.order.findMany({
    where: {
      status: 'PENDING',
      paymentMethod: 'PAYMOB',
      paymentStatus: 'UNPAID',
      reservedUntil: { lt: new Date() },
    },
    include: { items: true },
  })

  if (expiredOrders.length === 0) return

  console.log(
    `[stock-expiry] Found ${expiredOrders.length} expired reservation(s)`
  )

  for (const order of expiredOrders) {
    try {
      await prisma.$transaction(async (tx) => {
        // Re-check inside transaction — webhook may have confirmed payment
        // between our findMany and this moment
        const current = await tx.order.findUnique({
          where: { id: order.id },
          select: { status: true, paymentStatus: true },
        })

        if (
          current.status !== 'PENDING' ||
          current.paymentStatus !== 'UNPAID'
        ) {
          return
        }

        // Restore stock
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        }

        // Cancel the order
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'CANCELLED', reservedUntil: null },
        })
      })

      console.log(`[stock-expiry] Cancelled order ${order.id}`)
    } catch (err) {
      console.error(
        `[stock-expiry] Failed to cancel order ${order.id}:`,
        err.message
      )
    }
  }
}

export const startStockExpiryJob = () => {
  console.log('[stock-expiry] Job started — checking every 5 minutes')

  // Run immediately on startup (catches orders that expired while server was down)
  cancelExpiredReservations()

  setInterval(cancelExpiredReservations, INTERVAL_MS)
}
