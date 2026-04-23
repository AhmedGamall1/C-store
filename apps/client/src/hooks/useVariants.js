import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as variantApi from '@/api/variants'

function useVariantMutation(mutationFn, { successMsg } = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product'] })
      if (successMsg) toast.success(successMsg)
    },
    onError: (err) => toast.error(err.message),
  })
}

// ── Colors ──────────────────────────────────────────────

export function useAddColor() {
  return useVariantMutation(
    ({ productId, ...data }) => variantApi.addColor(productId, data),
    { successMsg: 'Color added' }
  )
}

export function useUpdateColor() {
  return useVariantMutation(
    ({ productId, colorId, ...data }) =>
      variantApi.updateColor(productId, colorId, data),
    { successMsg: 'Color updated' }
  )
}

export function useDeleteColor() {
  return useVariantMutation(
    ({ productId, colorId }) => variantApi.deleteColor(productId, colorId),
    { successMsg: 'Color deleted' }
  )
}

// ── Sizes ───────────────────────────────────────────────

export function useAddSize() {
  return useVariantMutation(
    ({ productId, colorId, ...data }) =>
      variantApi.addSize(productId, colorId, data),
    { successMsg: 'Size added' }
  )
}

export function useUpdateSize() {
  return useVariantMutation(
    ({ productId, colorId, sizeId, ...data }) =>
      variantApi.updateSize(productId, colorId, sizeId, data),
    { successMsg: 'Size updated' }
  )
}

export function useDeleteSize() {
  return useVariantMutation(
    ({ productId, colorId, sizeId }) =>
      variantApi.deleteSize(productId, colorId, sizeId),
    { successMsg: 'Size deleted' }
  )
}
