import { PRODUCTS } from './products'

export const CART_ITEMS = [
  {
    id: 'ci-1',
    productId: PRODUCTS[0].id,
    product: PRODUCTS[0],
    quantity: 2,
    size: 'M',
  },
  {
    id: 'ci-2',
    productId: PRODUCTS[6].id,
    product: PRODUCTS[6],
    quantity: 1,
    size: 'L',
  },
  {
    id: 'ci-3',
    productId: PRODUCTS[10].id,
    product: PRODUCTS[10],
    quantity: 1,
    size: 'XL',
  },
]

export const cartSubtotal = (items = CART_ITEMS) =>
  items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0)

export const cartItemCount = (items = CART_ITEMS) =>
  items.reduce((sum, i) => sum + i.quantity, 0)
