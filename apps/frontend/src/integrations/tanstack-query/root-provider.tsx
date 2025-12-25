import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

let queryClient: QueryClient | undefined

export function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minute
        },
      },
    })
  }
  return queryClient
}

export function getContext() {
  return { queryClient: getQueryClient() }
}

export function Provider({
  children,
  queryClient: providedClient,
}: {
  children: React.ReactNode
  queryClient: QueryClient
}) {
  return (
    <QueryClientProvider client={providedClient}>
      {children}
    </QueryClientProvider>
  )
}
