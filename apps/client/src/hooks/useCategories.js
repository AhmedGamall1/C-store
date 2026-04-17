import { useQuery } from '@tanstack/react-query'
import { getCategories } from '@/api/categories'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 10 * 60_000, // categories barely change — cache 10 min
  })
}
