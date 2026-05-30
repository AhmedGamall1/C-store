import type { Prisma } from '@prisma/client'
import prisma from '../config/database.js'

// A Prisma client scoped to a transaction. Repository functions accept this so
// they can run either standalone (default client) or inside withTransaction().
export type DbClient = Prisma.TransactionClient

// Run a unit of work atomically.
export const withTransaction = <T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> => prisma.$transaction(fn)
