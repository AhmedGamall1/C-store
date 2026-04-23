// apps/server/src/jobs/stockExpiry.job.js
import prisma from '../config/database.js'

const INTERVAL_MS = 5 * 60 * 1000

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

        // Restore stock on the SIZE rows (size may have been hard-deleted)
        for (const item of order.items) {
          if (item.productSizeId) {
            await tx.productSize.updateMany({
              where: { id: item.productSizeId },
              data: { stock: { increment: item.quantity } },
            })
          }
        }

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
  cancelExpiredReservations()
  setInterval(cancelExpiredReservations, INTERVAL_MS)
}
