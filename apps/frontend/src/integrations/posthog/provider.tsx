import { useEffect, useRef } from 'react'
import { env } from '@/env'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const posthogRef = useRef<typeof import('posthog-js').default | null>(null)
  const initializedRef = useRef(false)
  const lastPathRef = useRef<string>('')

  // Initialize PostHog once (client-side only)
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      initializedRef.current ||
      !env.VITE_PUBLIC_POSTHOG_KEY ||
      !env.VITE_PUBLIC_POSTHOG_HOST
    ) {
      return
    }

    // Dynamic import to avoid SSR issues
    import('posthog-js').then(({ default: posthog }) => {
      posthog.init(env.VITE_PUBLIC_POSTHOG_KEY!, {
        api_host: env.VITE_PUBLIC_POSTHOG_HOST,
        capture_pageview: true, // Auto-capture initial pageview
        capture_pageleave: true,
        persistence: 'localStorage',
        autocapture: true,
      })
      posthogRef.current = posthog
      initializedRef.current = true
      lastPathRef.current = window.location.pathname
    })
  }, [])

  // Track SPA route changes using popstate and manual checks
  useEffect(() => {
    if (typeof window === 'undefined') return

    const trackPageview = () => {
      const currentPath = window.location.pathname
      if (posthogRef.current && initializedRef.current && currentPath !== lastPathRef.current) {
        posthogRef.current.capture('$pageview', {
          $current_url: window.location.href,
        })
        lastPathRef.current = currentPath
      }
    }

    // Listen for browser navigation
    window.addEventListener('popstate', trackPageview)

    // Check for route changes periodically (for SPA navigation)
    const interval = setInterval(trackPageview, 500)

    return () => {
      window.removeEventListener('popstate', trackPageview)
      clearInterval(interval)
    }
  }, [])

  return <>{children}</>
}
