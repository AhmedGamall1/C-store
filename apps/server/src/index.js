import { env } from './config/env.js'
import app from './app.js'
import prisma from './config/database.js'
import { startStockExpiryJob } from './jobs/stockExpiry.job.js'

const server = app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`)
  console.log(`Environment: ${env.NODE_ENV}`)
})

const stockExpiryInterval = startStockExpiryJob()

// Graceful shutdown handling
let shuttingDown = false

const shutdown = async (signal) => {
  if (shuttingDown) return
  shuttingDown = true

  console.log(`\n[shutdown] Received ${signal}, draining…`)

  // Stop the background job
  clearInterval(stockExpiryInterval)

  // Stop accepting new connections + finish current requests
  server.close(async (err) => {
    if (err) {
      console.error('[shutdown] HTTP server close error:', err)
      process.exit(1)
    }
    try {
      await prisma.$disconnect()
      console.log('[shutdown] Clean exit')
      process.exit(0)
    } catch (e) {
      console.error('[shutdown] Prisma disconnect error:', e)
      process.exit(1)
    }
  })

  // force shutdown if a request hangs forever, don't block the deploy
  setTimeout(() => {
    console.error('[shutdown] Force exit after 10s timeout')
    process.exit(1)
  }, 10_000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

process.on('unhandledRejection', (reason) => {
  console.error('[fatal] Unhandled rejection:', reason)
  shutdown('unhandledRejection')
})
process.on('uncaughtException', (err) => {
  console.error('[fatal] Uncaught exception:', err)
  shutdown('uncaughtException')
})
