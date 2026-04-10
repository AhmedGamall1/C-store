import { SHIPPING_RATES, getShippingCost } from '../config/shipping.js'
import AppError from '../utils/AppError.js'

// GET /api/shipping — list all governorates and their rates
export const getShippingRates = async (req, res) => {
  res.json({
    status: 'success',
    data: { rates: SHIPPING_RATES },
  })
}

// GET /api/shipping/:governorate — get cost for a specific governorate
export const getShippingCostByGovernorate = async (req, res) => {
  const cost = getShippingCost(req.params.governorate)

  if (cost === null) {
    throw new AppError(
      `No shipping available for governorate: ${req.params.governorate}`,
      404
    )
  }

  res.json({
    status: 'success',
    data: { governorate: req.params.governorate, cost },
  })
}
