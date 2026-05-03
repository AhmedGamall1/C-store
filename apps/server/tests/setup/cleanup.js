import { beforeEach, afterAll } from 'vitest'
import prisma from '../../src/config/database.js'

// Order matters: child tables first, then parents.
const TABLES_IN_DELETION_ORDER = [
  'order_items',
  'orders',
  'cart_items',
  'carts',
  'reviews',
  'product_sizes',
  'product_colors',
  'products',
  'categories',
  'addresses',
  'users',
]

beforeEach(async () => {
  const tableList = TABLES_IN_DELETION_ORDER.map((t) => `"${t}"`).join(', ')
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`
  )
})

afterAll(async () => {
  await prisma.$disconnect()
})
