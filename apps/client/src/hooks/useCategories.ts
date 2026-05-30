import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  getCategories,
  toggleCategoryActive,
  updateCategory,
} from '@/api/categories'
import { toast } from 'sonner'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 10 * 60_000, // categories barely change — cache 10 min
  })
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ['categories', 'admin'],
    queryFn: getAdminCategories,
  })
}

function useCategoryMutation<V>(
  mutationFn: (vars: V) => Promise<unknown>,
  { successMsg }: { successMsg?: string } = {}
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      if (successMsg) toast.success(successMsg)
    },
  })
}

export function useCreateCategory() {
  return useCategoryMutation(createCategory, { successMsg: 'Category created' })
}

// Pass { id, ...fields } to mutate — matches the API signature cleanly.
export function useUpdateCategory() {
  return useCategoryMutation(
    ({ id, ...data }: { id: string } & Parameters<typeof updateCategory>[1]) =>
      updateCategory(id, data),
    { successMsg: 'Category updated' }
  )
}

export function useDeleteCategory() {
  return useCategoryMutation(deleteCategory, { successMsg: 'Category deleted' })
}

export function useToggleCategoryActive() {
  return useCategoryMutation(
    ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleCategoryActive(id, isActive),
    { successMsg: 'Category status updated' }
  )
}
