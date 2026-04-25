import { api } from '@/lib/api'

/**
 * GET /api/shipping — { rates: { [slug]: cost } }
 */
export async function getShippingRates() {
  const res = await api.get('/shipping')
  return res.data.rates
}
