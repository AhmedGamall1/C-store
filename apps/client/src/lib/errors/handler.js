import { toast } from 'sonner'
import { isApiError } from './ApiError'
import { t } from './messages'

// One toast at most every 1.5s for the same code — prevents storms when
// multiple parallel queries fail with the same network/5xx error.
const recent = new Map()
function shouldEmit(key) {
  const now = Date.now()
  const last = recent.get(key) ?? 0
  if (now - last < 1500) return false
  recent.set(key, now)
  return true
}

function buildLoginRedirect() {
  const here = window.location.pathname + window.location.search
  return `/login?redirect=${encodeURIComponent(here)}`
}

// Routes a parsed error to the right side effect (toast / redirect).
// `meta` comes from the query/mutation that failed; supports:
//   silent401     — don't toast/redirect on 401 (used by `getMe`)
//   silentError   — caller handles its own UX
//   silentFieldErrors — don't toast on validation if we have field errors;
//                       a form's useApiError will route them inline
export function handleApiError(err, meta = {}) {
  if (!isApiError(err)) {
    // Non-ApiError flow — local throws (e.g. guest cart stock checks).
    if (!meta.silentError && err?.message) {
      toast.error(err.message)
    }
    return
  }
  if (err.isCanceled) return
  if (meta.silentError) return

  switch (err.code) {
    case 'UNAUTHORIZED': {
      if (meta.silent401) return
      // Avoid bouncing if the user is already on /login or /register.
      const path = window.location.pathname
      if (path === '/login' || path === '/register') {
        if (shouldEmit('UNAUTHORIZED')) toast.error(err.message || t('UNAUTHORIZED'))
        return
      }
      if (shouldEmit('UNAUTHORIZED')) toast.error(err.message || t('UNAUTHORIZED'))
      // Full-page redirect kills any stale auth-dependent state.
      window.location.href = buildLoginRedirect()
      return
    }

    case 'FORBIDDEN':
      if (shouldEmit('FORBIDDEN')) toast.error(err.message || t('FORBIDDEN'))
      return

    case 'NOT_FOUND':
      // Page-level UI handles 404 — don't toast.
      return

    case 'VALIDATION':
      // If a form is going to surface field errors inline, skip the toast.
      if (meta.silentFieldErrors && err.hasFieldErrors) return
      if (shouldEmit(`VALIDATION:${err.message}`)) toast.error(err.message)
      return

    case 'RATE_LIMIT':
      if (shouldEmit('RATE_LIMIT')) toast.error(err.message || t('RATE_LIMIT'))
      return

    case 'NETWORK':
      if (shouldEmit('NETWORK')) toast.error(t('NETWORK'))
      return

    case 'SERVER':
      if (shouldEmit('SERVER')) {
        toast.error(err.message || t('SERVER'), {
          action: {
            label: t('RETRY'),
            onClick: () => window.location.reload(),
          },
        })
      }
      return

    default:
      if (shouldEmit(`GENERIC:${err.message}`)) {
        toast.error(err.message || t('GENERIC'))
      }
  }
}
