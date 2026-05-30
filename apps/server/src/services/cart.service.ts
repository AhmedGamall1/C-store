import AppError from '../utils/AppError.js'
import * as cartRepo from '../repositories/cart.repository.js'
import * as variantRepo from '../repositories/variant.repository.js'
import { withTransaction } from '../repositories/transaction.js'
import type { AddItemInput } from '../schemas/cart.schema.js'

type CartWithItems = NonNullable<
  Awaited<ReturnType<typeof cartRepo.findCartByUserIdWithItems>>
>
type CartLineItem = CartWithItems['items'][number]

// Resolve the unit price: size override wins; otherwise the product price.
const unitPriceOf = (item: CartLineItem) =>
  Number(item.productSize.price ?? item.productSize.color.product.price)

const computeTotals = (items: CartLineItem[]) => {
  const enriched = items.map((item) => ({
    ...item,
    unitPrice: unitPriceOf(item),
    subtotal: unitPriceOf(item) * item.quantity,
  }))
  const total = enriched.reduce((sum, item) => sum + item.subtotal, 0)
  const totalItems = enriched.reduce((sum, item) => sum + item.quantity, 0)
  return { items: enriched, total, totalItems }
}

// A variant is sellable only when the size, its color, and its product are all active.
const isVariantSellable = (size: {
  isActive: boolean
  color: { isActive: boolean; product: { isActive: boolean } }
}) => size.isActive && size.color.isActive && size.color.product.isActive

const getAvailableSize = async (productSizeId: string) => {
  const size = await variantRepo.findProductSizeById(productSizeId)

  if (!size) throw new AppError('Variant not found', 404)

  if (!isVariantSellable(size)) {
    throw new AppError('Variant is no longer availapble', 410)
  }
  return size
}

export const getCart = async (userId: string) => {
  const cart = await cartRepo.findCartByUserIdWithItems(userId)
  if (!cart) return { items: [], total: 0, totalItems: 0 }

  const { items, total, totalItems } = computeTotals(cart.items)
  return { id: cart.id, items, total, totalItems }
}

export const addItem = async (
  userId: string,
  { productSizeId, quantity }: AddItemInput
) => {
  const size = await getAvailableSize(productSizeId)
  if (size.stock === 0) {
    throw new AppError('This variant is out of stock', 400)
  }

  const cart = await cartRepo.getOrCreateCart(userId)
  const existing = await cartRepo.findCartItem(cart.id, productSizeId)
  const newQuantity = (existing?.quantity ?? 0) + quantity

  if (newQuantity > size.stock) {
    const remaining = size.stock - (existing?.quantity ?? 0)
    throw new AppError(
      `Cannot add ${quantity} unit(s). Only ${remaining} remaining.`,
      400
    )
  }

  await cartRepo.upsertCartItem(cart.id, productSizeId, newQuantity)
  return getCart(userId)
}

export const updateItem = async (
  userId: string,
  productSizeId: string,
  quantity: number
) => {
  const cart = await cartRepo.findCartByUserId(userId)
  if (!cart) throw new AppError('Cart not found', 404)

  const item = await cartRepo.findCartItem(cart.id, productSizeId)
  if (!item) throw new AppError('Item not found in cart', 404)

  // Stock check needs a fresh read — quantities change independently.
  const size = await variantRepo.findProductSizeById(productSizeId)
  if (!size) throw new AppError('Variant not found', 404)
  if (quantity > size.stock) {
    throw new AppError(`Only ${size.stock} units available`, 400)
  }

  await cartRepo.updateCartItemQuantity(cart.id, productSizeId, quantity)
  return getCart(userId)
}

export const removeItem = async (userId: string, productSizeId: string) => {
  const cart = await cartRepo.findCartByUserId(userId)
  if (!cart) throw new AppError('Cart not found', 404)

  const item = await cartRepo.findCartItem(cart.id, productSizeId)
  if (!item) throw new AppError('Item not found in cart', 404)

  await cartRepo.deleteCartItem(cart.id, productSizeId)
  return getCart(userId)
}

export const clearCart = async (userId: string) => {
  const cart = await cartRepo.findCartByUserId(userId)
  if (!cart) throw new AppError('Cart not found', 404)

  await cartRepo.deleteAllCartItems(cart.id)
  return getCart(userId)
}

// Merge a client-held guest cart (items from localStorage) into the user's DB cart.
export const mergeGuestCart = async (userId: string, items: unknown) => {
  if (!Array.isArray(items) || items.length === 0) return getCart(userId)

  // Normalize + de-duplicate. Anything malformed is silently dropped.
  const incoming = new Map<string, number>()
  for (const raw of items) {
    const productSizeId = raw?.productSizeId
    const qty = Number(raw?.quantity)
    if (typeof productSizeId !== 'string' || !qty || qty < 1) continue
    incoming.set(productSizeId, (incoming.get(productSizeId) ?? 0) + qty)
  }
  if (incoming.size === 0) return getCart(userId)

  const sizes = await variantRepo.findProductSizesByIds([...incoming.keys()])
  const sizeById = new Map(sizes.map((s) => [s.id, s]))

  await withTransaction(async (tx) => {
    const userCart = await cartRepo.getOrCreateCart(userId, tx)

    for (const [productSizeId, addQty] of incoming) {
      const size = sizeById.get(productSizeId)
      if (!size) continue
      if (!isVariantSellable(size)) continue
      if (size.stock < 1) continue

      const existing = await cartRepo.findCartItem(userCart.id, productSizeId, tx)
      const desired = (existing?.quantity ?? 0) + addQty
      const clamped = Math.min(desired, size.stock)
      if (clamped < 1) continue

      await cartRepo.upsertCartItem(userCart.id, productSizeId, clamped, tx)
    }
  })

  return getCart(userId)
}
