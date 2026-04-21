// Generates a readable, unique order number like: ORD-20260421-A7K2Q9
// Format: ORD-<YYYYMMDD>-<6 random alphanumeric chars>
// DB has @unique on orderNumber as a backstop for the astronomically rare collision.

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I to avoid confusion

const randomSuffix = (length = 6) => {
  let out = ''
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return out
}

const generateOrderNumber = () => {
  const now = new Date()
  const y = now.getUTCFullYear()
  const m = String(now.getUTCMonth() + 1).padStart(2, '0')
  const d = String(now.getUTCDate()).padStart(2, '0')
  return `ORD-${y}${m}${d}-${randomSuffix()}`
}

export default generateOrderNumber
