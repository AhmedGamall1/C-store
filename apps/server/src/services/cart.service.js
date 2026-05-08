import AppError from '../utils/AppError.js'
import * as cartRepo from '../repositories/cart.repository.js'
import * as variantRepo from '../repositories/variant.repository.js'
import { withTransaction } from '../repositories/transaction.js'

// Resolve the unit price: size override wins; otherwise product price.
const unitPriceOf = (item) =>
  Number(item.productSize.price ?? item.productSize.color.product.price)

const computeTotals = (items) => {
  const enriched = items.map((item) => ({
    ...item,
    unitPrice: unitPriceOf(item),
    subtotal: unitPriceOf(item) * item.quantity,
  }))
  const total = enriched.reduce((sum, item) => sum + item.subtotal, 0)
  const totalItems = enriched.reduce((sum, item) => sum + item.quantity, 0)
  return { items: enriched, total, totalItems }
}

const isVariantSellable = (size) =>
  size.isActive && size.color.isActive && size.color.product.isActive

// check product, size, color all exist and are active
const getAvailableSize = async (productSizeId) => {
  const size = await variantRepo.findProductSizeById(productSizeId)

  if (!size) throw new AppError('Variant not found', 404)

  if (!isVariantSellable(size)) {
    throw new AppError('Variant is no longer availapble', 410)
  }
  return size
}

// getCart
export const getCart = async (userId) => {
  const cart = await cartRepo.findCartByUserIdWithItems(userId)
  if (!cart) return { items: [], total: 0, totalItems: 0 }

  const { items, total, totalItems } = computeTotals(cart.items)
  return { id: cart.id, items, total, totalItems }
}

// addItem — body: { productSizeId, quantity }
export const addItem = async (userId, { productSizeId, quantity }) => {
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

// updateItem — URL: /items/:productSizeId  body: { quantity }
export const updateItem = async (userId, productSizeId, quantity) => {
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

// removeItem
export const removeItem = async (userId, productSizeId) => {
  const cart = await cartRepo.findCartByUserId(userId)
  if (!cart) throw new AppError('Cart not found', 404)

  const item = await cartRepo.findCartItem(cart.id, productSizeId)
  if (!item) throw new AppError('Item not found in cart', 404)

  await cartRepo.deleteCartItem(cart.id, productSizeId)
  return getCart(userId)
}

// clearCart
export const clearCart = async (userId) => {
  const cart = await cartRepo.findCartByUserId(userId)
  if (!cart) throw new AppError('Cart not found', 404)

  await cartRepo.deleteAllCartItems(cart.id)
  return getCart(userId)
}

// Merge a client-held guest cart (items from localStorage) into the user's DB cart.
export const mergeGuestCart = async (userId, items) => {
  if (!Array.isArray(items) || items.length === 0) return getCart(userId)

  // Normalize + de-duplicate. Anything malformed is silently dropped.
  const incoming = new Map()
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

      const existing = await cartRepo.findCartItem(
        userCart.id,
        productSizeId,
        tx
      )
      const desired = (existing?.quantity ?? 0) + addQty
      const clamped = Math.min(desired, size.stock)
      if (clamped < 1) continue

      await cartRepo.upsertCartItem(userCart.id, productSizeId, clamped, tx)
    }
  })

  return getCart(userId)
}
