// Single error type the whole client deals with.
// Extends Error so existing `err.message` reads keep working unchanged.
export type ApiFieldErrors = Record<string, string>

interface ApiErrorInit {
  status: number
  code: string
  message: string
  fieldErrors?: ApiFieldErrors | null
  raw?: unknown
  isNetworkError?: boolean
  isUnknownShape?: boolean
  isCanceled?: boolean
}

export class ApiError extends Error {
  status: number
  code: string
  fieldErrors: ApiFieldErrors | null
  raw: unknown
  isNetworkError: boolean
  isUnknownShape: boolean
  isCanceled: boolean

  constructor({
    status,
    code,
    message,
    fieldErrors = null,
    raw = null,
    isNetworkError = false,
    isUnknownShape = false,
    isCanceled = false,
  }: ApiErrorInit) {
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

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError
}
