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
