import AppError from '../utils/AppError.js'
import * as repo from '../repositories/address.repository.js'
import { withTransaction } from '../repositories/transaction.js'

export const getMyAddresses = (userId) => repo.findAllForUser(userId)

export const createAddress = async (userId, data) => {
  const existingCount = await repo.countForUser(userId)
  const shouldBeDefault = existingCount === 0 ? true : (data.isDefault ?? false)

  return withTransaction(async (tx) => {
    if (shouldBeDefault) await repo.clearDefaultsForUser(userId, tx)
    return repo.create(
      {
        userId,
        street: data.street,
        city: data.city,
        governorate: data.governorate,
        isDefault: shouldBeDefault,
      },
      tx
    )
  })
}

export const updateAddress = async (userId, addressId, data) => {
  const address = await repo.findByIdForUser(addressId, userId)
  if (!address) throw new AppError('Address not found', 404)

  return withTransaction(async (tx) => {
    if (data.isDefault === true) await repo.clearDefaultsForUser(userId, tx)
    return repo.updateById(addressId, data, tx)
  })
}

export const deleteAddress = async (userId, addressId) => {
  const address = await repo.findByIdForUser(addressId, userId)
  if (!address) throw new AppError('Address not found', 404)

  await withTransaction(async (tx) => {
    await repo.removeById(addressId, tx)
    if (address.isDefault) {
      const next = await repo.findOldestForUser(userId, tx)
      if (next) await repo.updateById(next.id, { isDefault: true }, tx)
    }
  })
}

export const setDefaultAddress = async (userId, addressId) => {
  const address = await repo.findByIdForUser(addressId, userId)
  if (!address) throw new AppError('Address not found', 404)

  return withTransaction(async (tx) => {
    await repo.clearDefaultsForUser(userId, tx)
    return repo.updateById(addressId, { isDefault: true }, tx)
  })
}
