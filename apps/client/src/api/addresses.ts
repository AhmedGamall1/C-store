import { api } from '@/lib/api'
import type { Address } from '@/types/api'

interface CreateAddressInput {
  street: string
  city: string
  governorate: string
  isDefault?: boolean
}

interface UpdateAddressInput {
  street?: string
  city?: string
  governorate?: string
  isDefault?: boolean
}

// GET /api/addresses — current user's saved addresses
export async function getMyAddresses(): Promise<Address[]> {
  const res = await api.get<{ data: Address[] }>('/addresses')
  return res.data
}

// POST /api/addresses
export async function createAddress({
  street,
  city,
  governorate,
  isDefault,
}: CreateAddressInput): Promise<Address> {
  const res = await api.post<{ data: Address }>('/addresses', {
    street,
    city,
    governorate,
    isDefault,
  })
  return res.data
}

// PUT /api/addresses/:id
export async function updateAddress(
  id: string,
  { street, city, governorate, isDefault }: UpdateAddressInput
): Promise<Address> {
  const res = await api.put<{ data: Address }>(`/addresses/${id}`, {
    street,
    city,
    governorate,
    isDefault,
  })
  return res.data
}

// DELETE /api/addresses/:id
export async function deleteAddress(id: string): Promise<string> {
  await api.delete(`/addresses/${id}`)
  return id
}

// PATCH /api/addresses/:id/default
export async function setDefaultAddress(id: string): Promise<Address> {
  const res = await api.patch<{ data: Address }>(`/addresses/${id}/default`)
  return res.data
}
