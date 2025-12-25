import { useEffect } from 'react'
import posthog from 'posthog-js'
import { env } from '@/env'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && env.VITE_PUBLIC_POSTHOG_KEY && env.VITE_PUBLIC_POSTHOG_HOST) {
      posthog.init(env.VITE_PUBLIC_POSTHOG_KEY, {
        api_host: env.VITE_PUBLIC_POSTHOG_HOST,
        capture_pageview: true,
        persistence: 'localStorage',
      })
    }
  }, [])

  return <>{children}</>
}
