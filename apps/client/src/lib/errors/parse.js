import { ApiError } from './ApiError'
import { t } from './messages'

const PATH_PREFIXES = ['body.', 'params.', 'query.']

function stripPrefix(path) {
  for (const p of PATH_PREFIXES) {
    if (path.startsWith(p)) return path.slice(p.length)
  }
  return path
}

function buildFieldErrors(errors) {
  if (!Array.isArray(errors) || errors.length === 0) return null
  const map = {}
  for (const item of errors) {
    if (!item || typeof item.path !== 'string') continue
    const key = stripPrefix(item.path)
    if (!(key in map)) map[key] = item.message || t('GENERIC')
  }
  return Object.keys(map).length ? map : null
}

function codeFor(status) {
  if (status === 0) return 'NETWORK'
  if (status === 401) return 'UNAUTHORIZED'
  if (status === 403) return 'FORBIDDEN'
  if (status === 404) return 'NOT_FOUND'
  if (status === 400 || status === 422) return 'VALIDATION'
  if (status === 429) return 'RATE_LIMIT'
  if (status >= 500) return 'SERVER'
  return 'GENERIC'
}

export function toApiError(axiosError) {
  if (
    axiosError?.code === 'ERR_CANCELED' ||
    axiosError?.name === 'CanceledError'
  ) {
    return new ApiError({
      status: 0,
      code: 'CANCELED',
      message: 'Request canceled',
      isCanceled: true,
    })
  }

  if (!axiosError?.response) {
    return new ApiError({
      status: 0,
      code: 'NETWORK',
      message: t('NETWORK'),
      isNetworkError: true,
    })
  }

  const { status, data } = axiosError.response
  const code = codeFor(status)

  // Anything that doesn't match { message: string } is a non-API body
  // (proxy HTML page, edge response, malformed JSON). We still surface a
  // sensible message but flag it so callers can drill into raw if needed.
  const looksRight =
    data && typeof data === 'object' && typeof data.message === 'string'

  if (!looksRight) {
    return new ApiError({
      status,
      code,
      message: t(code),
      raw: data ?? null,
      isUnknownShape: true,
    })
  }

  return new ApiError({
    status,
    code,
    message: data.message,
    fieldErrors: buildFieldErrors(data.errors),
    raw: data,
  })
}
