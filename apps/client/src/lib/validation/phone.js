// Egyptian mobile phone validation.
// Accepts the common shapes:
//   01XXXXXXXXX               (11-digit local, starts with 010/011/012/015)
//   +201XXXXXXXXX / 00201...  (with country code)
// Spaces, dashes, and parentheses are tolerated.

const STRIP = /[\s\-()]/g

export function normalizeEgyptPhone(value) {
  return String(value ?? '').replace(STRIP, '')
}

export function isValidEgyptPhone(value) {
  const v = normalizeEgyptPhone(value)
  if (!v) return false
  // Local 11-digit form
  if (/^01[0125]\d{8}$/.test(v)) return true
  // International forms: +20 / 0020
  if (/^(?:\+20|0020)1[0125]\d{8}$/.test(v)) return true
  return false
}

export const EGYPT_PHONE_HINT =
  'Enter an Egyptian mobile (e.g. 01012345678 or +201012345678)'
