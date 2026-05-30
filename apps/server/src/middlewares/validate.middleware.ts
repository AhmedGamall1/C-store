import { ZodError, type ZodTypeAny } from 'zod'
import type { Request, RequestHandler } from 'express'
import AppError from '../utils/AppError.js'

interface RequestSchemas {
  body?: ZodTypeAny
  params?: ZodTypeAny
  query?: ZodTypeAny
}

const formatIssues = (error: ZodError) =>
  error.issues.map((i) => ({
    path: i.path.join('.'),
    message: i.message,
  }))

// req.query is a getter in Express 5 — defineProperty avoids assignment errors.
const overwrite = (req: Request, key: 'params' | 'query', value: unknown) => {
  Object.defineProperty(req, key, {
    value,
    writable: true,
    configurable: true,
  })
}

export const validate =
  (schemas: RequestSchemas): RequestHandler =>
  (req, res, next) => {
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
