// Builds a readable, unique order number like ORD-20260421-A7K2Q9.
// The DB keeps @unique on orderNumber as a backstop for the rare collision.

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // skips 0/O/1/I to avoid confusion

const randomSuffix = (length = 6): string => {
  let out = ''
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return out
}

const generateOrderNumber = (): string => {
  const now = new Date()
  const y = now.getUTCFullYear()
  const m = String(now.getUTCMonth() + 1).padStart(2, '0')
  const d = String(now.getUTCDate()).padStart(2, '0')
  return `ORD-${y}${m}${d}-${randomSuffix()}`
}

export default generateOrderNumber
