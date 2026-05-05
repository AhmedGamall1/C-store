import { useCallback } from 'react'
import { isApiError } from '@/lib/errors/ApiError'
import { handleApiError } from '@/lib/errors/handler'

// Form-aware error helper. Pass `form` (react-hook-form's return value) to
// route validation field errors inline; everything else falls through to the
// global handler (toast / redirect).
//
// Usage:
//   const { handle } = useApiError({ form })
//   try { await mutation(values) } catch (e) { handle(e) }
export function useApiError({ form } = {}) {
  const handle = useCallback(
    (err) => {
      if (form && isApiError(err) && err.hasFieldErrors) {
        for (const [name, message] of Object.entries(err.fieldErrors)) {
          form.setError(name, { type: 'server', message })
        }
        // Suppress the validation toast — fields are already showing errors.
        handleApiError(err, { silentFieldErrors: true })
        return
      }
      handleApiError(err)
    },
    [form]
  )

  return { handle }
}
