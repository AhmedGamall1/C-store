import prisma from '../config/database.js'

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
}

export const findCartByUserIdWithItems = (userId) =>
  prisma.cart.findUnique({
    where: { userId },
    include: {
      items: { include: cartItemInclude, orderBy: { id: 'asc' } },
    },
  })

export const findCartByUserId = (userId) =>
  prisma.cart.findUnique({ where: { userId } })

// returns the user's cart, creating an empty one if missing.
export const getOrCreateCart = (userId, tx = prisma) =>
  tx.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  })

export const findCartItem = (cartId, productSizeId, tx = prisma) =>
  tx.cartItem.findUnique({
    where: { cartId_productSizeId: { cartId, productSizeId } },
  })

export const upsertCartItem = (cartId, productSizeId, quantity, tx = prisma) =>
  tx.cartItem.upsert({
    where: { cartId_productSizeId: { cartId, productSizeId } },
    update: { quantity },
    create: { cartId, productSizeId, quantity },
  })

export const updateCartItemQuantity = (
  cartId,
  productSizeId,
  quantity,
  tx = prisma
) =>
  tx.cartItem.update({
    where: { cartId_productSizeId: { cartId, productSizeId } },
    data: { quantity },
  })

export const deleteCartItem = (cartId, productSizeId, tx = prisma) =>
  tx.cartItem.delete({
    where: { cartId_productSizeId: { cartId, productSizeId } },
  })

export const deleteAllCartItems = (cartId, tx = prisma) =>
  tx.cartItem.deleteMany({ where: { cartId } })
