import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatEGP(amount: number | string): string {
  return `${Number(amount).toLocaleString('en-EG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} EGP`
}

export function formatDate(date: string | number | Date): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
