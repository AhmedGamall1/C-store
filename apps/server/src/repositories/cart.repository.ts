import { Prisma } from '@prisma/client'
import prisma from '../config/database.js'
import type { DbClient } from './transaction.js'

const cartItemInclude = {
  productSize: {
    include: {
      color: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              comparePrice: true,
              isActive: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.CartItemInclude

export const findCartByUserIdWithItems = (userId: string) =>
  prisma.cart.findUnique({
    where: { userId },
    include: {
      items: { include: cartItemInclude, orderBy: { id: 'asc' } },
    },
  })

export const findCartByUserId = (userId: string) =>
  prisma.cart.findUnique({ where: { userId } })

// Returns the user's cart, creating an empty one if it doesn't exist yet.
export const getOrCreateCart = (userId: string, tx: DbClient = prisma) =>
  tx.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  })

export const findCartItem = (
  cartId: string,
  productSizeId: string,
  tx: DbClient = prisma
) =>
  tx.cartItem.findUnique({
    where: { cartId_productSizeId: { cartId, productSizeId } },
  })

export const upsertCartItem = (
  cartId: string,
  productSizeId: string,
  quantity: number,
  tx: DbClient = prisma
) =>
  tx.cartItem.upsert({
    where: { cartId_productSizeId: { cartId, productSizeId } },
    update: { quantity },
    create: { cartId, productSizeId, quantity },
  })

export const updateCartItemQuantity = (
  cartId: string,
  productSizeId: string,
  quantity: number,
  tx: DbClient = prisma
) =>
  tx.cartItem.update({
    where: { cartId_productSizeId: { cartId, productSizeId } },
    data: { quantity },
  })

export const deleteCartItem = (
  cartId: string,
  productSizeId: string,
  tx: DbClient = prisma
) =>
  tx.cartItem.delete({
    where: { cartId_productSizeId: { cartId, productSizeId } },
  })

export const deleteAllCartItems = (cartId: string, tx: DbClient = prisma) =>
  tx.cartItem.deleteMany({ where: { cartId } })

export const deleteCartItemsBySizeIds = (
  cartId: string,
  ids: string[],
  tx: DbClient = prisma
) =>
  tx.cartItem.deleteMany({
    where: { cartId, productSizeId: { in: ids } },
  })
