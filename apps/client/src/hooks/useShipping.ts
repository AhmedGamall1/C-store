import { useQuery } from '@tanstack/react-query'
import { getShippingRates } from '@/api/shipping'

export function useShippingRates() {
  return useQuery({
    queryKey: ['shipping', 'rates'],
    queryFn: getShippingRates,
    staleTime: Infinity, // rates almost never change at runtime
  })
}
