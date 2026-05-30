import type { Request, Response } from 'express'
import { SHIPPING_RATES, getShippingCost } from '../config/shipping.js'
import AppError from '../utils/AppError.js'

// GET /api/shipping — list all governorates and their rates
export const getShippingRates = async (_req: Request, res: Response) => {
  res.json({
    status: 'success',
    data: { rates: SHIPPING_RATES },
  })
}

// GET /api/shipping/:governorate — cost for a specific governorate
export const getShippingCostByGovernorate = async (
  req: Request,
  res: Response
) => {
  const cost = getShippingCost(req.params.governorate as string)

  if (cost === null) {
    throw new AppError(
      `No shipping available for governorate: ${req.params.governorate as string}`,
      404
    )
  }

  res.json({
    status: 'success',
    data: { governorate: req.params.governorate as string, cost },
  })
}
