import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatEGP(amount) {
  return `${Number(amount).toLocaleString('en-EG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} EGP`
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
