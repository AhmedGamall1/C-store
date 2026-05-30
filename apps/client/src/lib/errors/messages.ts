import en from './messages.en.json'
import ar from './messages.ar.json'

type Dict = Record<string, string>

const DICTS: Record<string, Dict> = { en, ar }
let currentLocale = 'en'

export function setLocale(locale: string): void {
  if (locale in DICTS) currentLocale = locale
}

export function getLocale(): string {
  return currentLocale
}

// Lookup with EN fallback, then GENERIC fallback. Never returns undefined.
export function t(key: string, locale: string = currentLocale): string {
  return DICTS[locale]?.[key] ?? DICTS.en[key] ?? DICTS.en.GENERIC
}
