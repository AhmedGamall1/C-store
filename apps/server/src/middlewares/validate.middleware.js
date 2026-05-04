import { ZodError } from 'zod'
import AppError from '../utils/AppError.js'

const formatIssues = (error) =>
  error.issues.map((i) => ({
    path: i.path.join('.'),
    message: i.message,
  }))

// req.query is a getter in Express 5 — defineProperty avoids assignment errors.
const overwrite = (req, key, value) => {
  Object.defineProperty(req, key, {
    value,
    writable: true,
    configurable: true,
  })
}

export const validate = (schemas) => (req, res, next) => {
  try {
    if (schemas.body) req.body = schemas.body.parse(req.body)
    if (schemas.params) {
      overwrite(req, 'params', schemas.params.parse(req.params))
    }
    if (schemas.query) {
      overwrite(req, 'query', schemas.query.parse(req.query))
    }
    next()
  } catch (err) {
    if (err instanceof ZodError) {
      const appErr = new AppError('Validation failed', 400)
      appErr.errors = formatIssues(err)
      return next(appErr)
    }
    next(err)
  }
}
