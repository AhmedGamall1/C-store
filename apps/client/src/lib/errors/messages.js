import en from './messages.en.json'
import ar from './messages.ar.json'

const DICTS = { en, ar }
let currentLocale = 'en'

export function setLocale(locale) {
  if (locale in DICTS) currentLocale = locale
}

export function getLocale() {
  return currentLocale
}

// Lookup with EN fallback, then GENERIC fallback. Never returns undefined.
export function t(key, locale = currentLocale) {
  return DICTS[locale]?.[key] ?? DICTS.en[key] ?? DICTS.en.GENERIC
}
