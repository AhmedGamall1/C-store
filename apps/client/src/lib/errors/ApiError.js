// Single error type the whole client deals with.
// Extends Error so existing `err.message` reads keep working unchanged.
export class ApiError extends Error {
  constructor({
    status,
    code,
    message,
    fieldErrors = null,
    raw = null,
    isNetworkError = false,
    isUnknownShape = false,
    isCanceled = false,
  }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
    this.raw = raw
    this.isNetworkError = isNetworkError
    this.isUnknownShape = isUnknownShape
    this.isCanceled = isCanceled
  }

  get isValidation() {
    return this.status === 400 || this.status === 422
  }

  get hasFieldErrors() {
    return Boolean(this.fieldErrors && Object.keys(this.fieldErrors).length)
  }
}

export function isApiError(err) {
  return err instanceof ApiError
}
