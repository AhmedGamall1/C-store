// localStorage-backed guest cart. Stores a compact list of
// { productSizeId, quantity } — the server fetches display data via
// GET /api/variants/bulk when the cart is rendered, and merges via
// POST /api/cart/merge on login.

export interface GuestCartItem {
  productSizeId: string
  quantity: number
}

const KEY = 'cstore:guestCart'
const EVT = 'cstore:guestCart:change'

function read(): GuestCartItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr
      .map((i) => ({
        productSizeId: String(i.productSizeId ?? ''),
        quantity: Math.max(1, Math.floor(Number(i.quantity) || 0)),
      }))
      .filter((i) => i.productSizeId && i.quantity > 0)
  } catch {
    return []
  }
}

function write(items: GuestCartItem[]): void {
  localStorage.setItem(KEY, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent(EVT))
}

export function getGuestItems(): GuestCartItem[] {
  return read()
}

export function setGuestItems(items: GuestCartItem[]): void {
  write(items)
}

export function clearGuestCart(): void {
  localStorage.removeItem(KEY)
  window.dispatchEvent(new CustomEvent(EVT))
}

export function addGuestItem(productSizeId: string, quantity = 1): void {
  const items = read()
  const idx = items.findIndex((i) => i.productSizeId === productSizeId)
  if (idx >= 0) items[idx].quantity += quantity
  else items.push({ productSizeId, quantity })
  write(items)
}

export function updateGuestItem(productSizeId: string, quantity: number): void {
  const items = read()
  const idx = items.findIndex((i) => i.productSizeId === productSizeId)
  if (idx < 0) return
  if (quantity < 1) items.splice(idx, 1)
  else items[idx].quantity = quantity
  write(items)
}

export function removeGuestItem(productSizeId: string): void {
  write(read().filter((i) => i.productSizeId !== productSizeId))
}

// Subscribe to guest-cart changes (same tab via custom event, other tabs via
// the native `storage` event).
export function subscribeGuestCart(
  cb: (items: GuestCartItem[]) => void
): () => void {
  const onSame = () => cb(read())
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb(read())
  }
  window.addEventListener(EVT, onSame)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(EVT, onSame)
    window.removeEventListener('storage', onStorage)
  }
}
