import prisma from '../config/database.js'

// Run a unit of work atomically.
export const withTransaction = (fn) => prisma.$transaction(fn)
