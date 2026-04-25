import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '@/api/addresses'
import { useAuth } from '@/providers/AuthProvider'

export function useMyAddresses() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['addresses'],
    queryFn: getMyAddresses,
    enabled: isAuthenticated,
    staleTime: 60_000,
  })
}

function useAddressMutation(mutationFn, { successMsg } = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] })
      if (successMsg) toast.success(successMsg)
    },
    onError: (err) => toast.error(err.message),
  })
}

export function useCreateAddress() {
  return useAddressMutation(createAddress, { successMsg: 'Address added' })
}

export function useUpdateAddress() {
  return useAddressMutation(
    ({ id, ...data }) => updateAddress(id, data),
    { successMsg: 'Address updated' }
  )
}

export function useDeleteAddress() {
  return useAddressMutation(deleteAddress, { successMsg: 'Address removed' })
}

export function useSetDefaultAddress() {
  return useAddressMutation(setDefaultAddress, {
    successMsg: 'Default address updated',
  })
}
