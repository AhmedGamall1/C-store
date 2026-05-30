import type { Request, Response } from 'express'
import * as addressService from '../services/address.service.js'

// POST /api/addresses
export const createAddress = async (req: Request, res: Response) => {
  const address = await addressService.createAddress(req.user!.id, req.body)
  res.status(201).json({ status: 'success', data: address })
}

// GET /api/addresses
export const getMyAddresses = async (req: Request, res: Response) => {
  const addresses = await addressService.getMyAddresses(req.user!.id)
  res.json({ status: 'success', data: addresses })
}

// PUT /api/addresses/:id
export const updateAddress = async (req: Request, res: Response) => {
  const address = await addressService.updateAddress(
    req.user!.id,
    req.params.id as string,
    req.body
  )
  res.json({ status: 'success', data: address })
}

// DELETE /api/addresses/:id
export const deleteAddress = async (req: Request, res: Response) => {
  await addressService.deleteAddress(req.user!.id, req.params.id as string)
  res.status(204).send()
}

// PATCH /api/addresses/:id/default
export const setDefaultAddress = async (req: Request, res: Response) => {
  const address = await addressService.setDefaultAddress(
    req.user!.id,
    req.params.id as string
  )
  res.json({ status: 'success', data: address })
}
