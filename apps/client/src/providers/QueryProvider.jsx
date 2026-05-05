import { useState } from 'react'
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { isApiError } from '@/lib/errors/ApiError'
import { handleApiError } from '@/lib/errors/handler'

// Don't retry user errors (4xx) — only network blips and 5xx.
function shouldRetry(failureCount, error) {
  if (!isApiError(error)) return failureCount < 1
  if (error.isCanceled) return false
  if (error.status >= 400 && error.status < 500) return false
  return failureCount < 2
}

export function QueryProvider({ children }) {
  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => handleApiError(error, query.meta ?? {}),
        }),
        mutationCache: new MutationCache({
          onError: (error, _vars, _ctx, mutation) =>
            handleApiError(error, mutation.meta ?? {}),
        }),
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: shouldRetry,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={client}>
      {children}
      {import.meta.env.DEV ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
    </QueryClientProvider>
  )
}
