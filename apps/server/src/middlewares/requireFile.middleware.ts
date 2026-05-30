import type { RequestHandler } from 'express'
import AppError from '../utils/AppError.js'

// For upload.fields([{ name: 'image' }, ...]) the file arrives under a named field.
export const requireFile =
  (fieldName: string): RequestHandler =>
  (req, res, next) => {
    const files = req.files as
      | Record<string, Express.Multer.File[]>
      | undefined
    const file =
      req.file?.fieldname === fieldName ? req.file : files?.[fieldName]?.[0]
    if (!file) {
      return next(new AppError(`${fieldName} is required`, 400))
    }
    next()
  }
