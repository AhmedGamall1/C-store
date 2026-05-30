import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as variantApi from '@/api/variants'

function useVariantMutation<V>(
  mutationFn: (vars: V) => Promise<unknown>,
  { successMsg }: { successMsg?: string } = {}
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product'] })
      if (successMsg) toast.success(successMsg)
    },
  })
}

// ── Colors ──────────────────────────────────────────────

export function useAddColor() {
  return useVariantMutation(
    ({
      productId,
      ...data
    }: { productId: string } & Parameters<typeof variantApi.addColor>[1]) =>
      variantApi.addColor(productId, data),
    { successMsg: 'Color added' }
  )
}

export function useUpdateColor() {
  return useVariantMutation(
    ({
      productId,
      colorId,
      ...data
    }: { productId: string; colorId: string } & Parameters<
      typeof variantApi.updateColor
    >[2]) => variantApi.updateColor(productId, colorId, data),
    { successMsg: 'Color updated' }
  )
}

export function useDeleteColor() {
  return useVariantMutation(
    ({ productId, colorId }: { productId: string; colorId: string }) =>
      variantApi.deleteColor(productId, colorId),
    { successMsg: 'Color deleted' }
  )
}

// ── Sizes ───────────────────────────────────────────────

export function useAddSize() {
  return useVariantMutation(
    ({
      productId,
      colorId,
      ...data
    }: { productId: string; colorId: string } & Parameters<
      typeof variantApi.addSize
    >[2]) => variantApi.addSize(productId, colorId, data),
    { successMsg: 'Size added' }
  )
}

export function useUpdateSize() {
  return useVariantMutation(
    ({
      productId,
      colorId,
      sizeId,
      ...data
    }: {
      productId: string
      colorId: string
      sizeId: string
    } & Record<string, unknown>) =>
      variantApi.updateSize(productId, colorId, sizeId, data),
    { successMsg: 'Size updated' }
  )
}

export function useDeleteSize() {
  return useVariantMutation(
    ({
      productId,
      colorId,
      sizeId,
    }: {
      productId: string
      colorId: string
      sizeId: string
    }) => variantApi.deleteSize(productId, colorId, sizeId),
    { successMsg: 'Size deleted' }
  )
}
