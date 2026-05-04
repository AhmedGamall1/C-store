import AppError from '../utils/AppError.js'

// For upload.fields([{name:'image'}, ...]) also pass the fieldname.
export const requireFile = (fieldName) => (req, res, next) => {
  const file =
    req.file?.fieldname === fieldName ? req.file : req.files?.[fieldName]?.[0]
  if (!file) {
    return next(new AppError(`${fieldName} is required`, 400))
  }
  next()
}
