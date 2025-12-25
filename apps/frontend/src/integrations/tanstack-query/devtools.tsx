import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { Plugin } from '@tanstack/react-devtools'

const TanStackQueryDevtools: Plugin = {
  name: 'TanStack Query',
  render: <ReactQueryDevtools buttonPosition="bottom-left" />,
}

export default TanStackQueryDevtools
