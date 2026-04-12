import * as addressService from '../services/address.service.js'

// POST /api/addresses
export const createAddress = async (req, res) => {
  const address = await addressService.createAddress(req.user.id, req.body)

  res.status(201).json({ status: 'success', data: address })
}

// GET /api/addresses
export const getMyAddresses = async (req, res) => {
  const addresses = await addressService.getMyAddresses(req.user.id)

  res.json({ status: 'success', data: addresses })
}

// PATCH /api/addresses/:id
export const updateAddress = async (req, res) => {
  const address = await addressService.updateAddress(
    req.user.id,
    req.params.id,
    req.body
  )
  res.json({ status: 'success', data: address })
}

// DELETE /api/addresses/:id
export const deleteAddress = async (req, res) => {
  await addressService.deleteAddress(req.user.id, req.params.id)
  res.status(204).send()
}

// PATCH /api/addresses/:id/default
export const setDefaultAddress = async (req, res) => {
  const address = await addressService.setDefaultAddress(
    req.user.id,
    req.params.id
  )
  res.json({ status: 'success', data: address })
}
