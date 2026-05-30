import { api } from '@/lib/api'
import type { ShippingRates } from '@/types/api'

// GET /api/shipping — { rates: { [slug]: cost } }
export async function getShippingRates(): Promise<ShippingRates> {
  const res = await api.get<{ data: { rates: ShippingRates } }>('/shipping')
  return res.data.rates
}
