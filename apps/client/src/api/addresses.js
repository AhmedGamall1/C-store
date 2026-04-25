import { api } from '@/lib/api'

/**
 * GET /api/addresses — current user's saved addresses.
 */
export async function getMyAddresses() {
  const res = await api.get('/addresses')
  return res.data
}

/**
 * POST /api/addresses
 */
export async function createAddress({ street, city, governorate, isDefault }) {
  const res = await api.post('/addresses', {
    street,
    city,
    governorate,
    isDefault,
  })
  return res.data
}

/**
 * PUT /api/addresses/:id
 */
export async function updateAddress(id, { street, city, governorate, isDefault }) {
  const res = await api.put(`/addresses/${id}`, {
    street,
    city,
    governorate,
    isDefault,
  })
  return res.data
}

/**
 * DELETE /api/addresses/:id
 */
export async function deleteAddress(id) {
  await api.delete(`/addresses/${id}`)
  return id
}

/**
 * PATCH /api/addresses/:id/default
 */
export async function setDefaultAddress(id) {
  const res = await api.patch(`/addresses/${id}/default`)
  return res.data
}
