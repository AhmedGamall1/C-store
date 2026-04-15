import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function QueryProvider({ children }) {
  // useState so the client isn't recreated on every render
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000, // 30s — avoid refetch-storms on re-render
            gcTime: 5 * 60_000, // 5 min in-memory cache
            refetchOnWindowFocus: false, // annoying for a store UI
            retry: 1, // one retry on flaky network
          },
          mutations: {
            retry: 0, // never silently retry a mutation
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
