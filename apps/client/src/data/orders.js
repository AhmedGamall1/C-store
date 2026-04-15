import { PRODUCTS } from './products'
import { ADDRESSES, CURRENT_USER } from './user'

const buildItems = (specs) =>
  specs.map(([index, quantity, size]) => ({
    id: `oi-${index}-${quantity}`,
    productId: PRODUCTS[index].id,
    product: PRODUCTS[index],
    quantity,
    size,
    price: PRODUCTS[index].price,
  }))

export const MY_ORDERS = [
  {
    id: 'ord-2025-0412-A37X',
    userId: CURRENT_USER.id,
    status: 'SHIPPED',
    paymentStatus: 'PAID',
    paymentMethod: 'PAYMOB',
    address: ADDRESSES[0],
    items: buildItems([
      [0, 2, 'M'],
      [7, 1, 'L'],
    ]),
    subtotal: 650 * 2 + 1850,
    shippingCost: 30,
    total: 650 * 2 + 1850 + 30,
    notes: 'Please ring the bell twice.',
    createdAt: '2025-04-10T14:22:00Z',
    paymobOrderId: 'pmb-9984412',
  },
  {
    id: 'ord-2025-0401-K12Q',
    userId: CURRENT_USER.id,
    status: 'DELIVERED',
    paymentStatus: 'PAID',
    paymentMethod: 'COD',
    address: ADDRESSES[1],
    items: buildItems([
      [10, 1, 'L'],
      [4, 1, 'M'],
    ]),
    subtotal: 1250 + 1450,
    shippingCost: 30,
    total: 1250 + 1450 + 30,
    notes: null,
    createdAt: '2025-03-28T11:05:00Z',
  },
  {
    id: 'ord-2025-0320-P88Z',
    userId: CURRENT_USER.id,
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    paymentMethod: 'PAYMOB',
    address: ADDRESSES[0],
    items: buildItems([[12, 1, 'M']]),
    subtotal: 1650,
    shippingCost: 30,
    total: 1680,
    notes: null,
    createdAt: '2025-04-13T08:40:00Z',
    reservedUntil: new Date(Date.now() + 18 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord-2025-0215-F55R',
    userId: CURRENT_USER.id,
    status: 'CANCELLED',
    paymentStatus: 'UNPAID',
    paymentMethod: 'PAYMOB',
    address: ADDRESSES[2],
    items: buildItems([[2, 1, 'S']]),
    subtotal: 890,
    shippingCost: 45,
    total: 935,
    notes: null,
    createdAt: '2025-02-15T19:10:00Z',
  },
]

// For admin — simulates all users
export const ALL_ORDERS = [
  ...MY_ORDERS,
  {
    id: 'ord-2025-0413-X99L',
    user: {
      id: 'user-22',
      firstName: 'Sara',
      lastName: 'Mahmoud',
      email: 'sara@example.com',
    },
    status: 'PROCESSING',
    paymentStatus: 'PAID',
    paymentMethod: 'PAYMOB',
    address: {
      street: '7 El Horreya Street',
      city: 'Heliopolis',
      governorate: 'Cairo',
    },
    items: buildItems([[1, 1, 'L']]),
    subtotal: 720,
    shippingCost: 30,
    total: 750,
    createdAt: '2025-04-13T15:44:00Z',
  },
  {
    id: 'ord-2025-0413-H22N',
    user: {
      id: 'user-23',
      firstName: 'Omar',
      lastName: 'El Gamal',
      email: 'omar@example.com',
    },
    status: 'CONFIRMED',
    paymentStatus: 'UNPAID',
    paymentMethod: 'COD',
    address: {
      street: '102 Roushdy Street',
      city: 'Alexandria',
      governorate: 'Alexandria',
    },
    items: buildItems([
      [8, 1, 'M'],
      [11, 1, 'L'],
    ]),
    subtotal: 1950 + 1850,
    shippingCost: 45,
    total: 1950 + 1850 + 45,
    createdAt: '2025-04-13T10:15:00Z',
  },
  {
    id: 'ord-2025-0412-Q44M',
    user: {
      id: 'user-24',
      firstName: 'Nour',
      lastName: 'Ibrahim',
      email: 'nour@example.com',
    },
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    paymentMethod: 'PAYMOB',
    address: {
      street: '5 El Mesaha Square',
      city: 'Dokki',
      governorate: 'Giza',
    },
    items: buildItems([[5, 1, 'M']]),
    subtotal: 950,
    shippingCost: 30,
    total: 980,
    createdAt: '2025-04-12T22:05:00Z',
  },
]

export const getMyOrderById = (id) => MY_ORDERS.find((o) => o.id === id)
export const getOrderById = (id) => ALL_ORDERS.find((o) => o.id === id)
