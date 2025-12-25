import { useEffect } from 'react'
import { useLocation } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { env } from '@/env'

let posthogInitialized = false

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  // Initialize PostHog once
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      !posthogInitialized &&
      env.VITE_PUBLIC_POSTHOG_KEY &&
      env.VITE_PUBLIC_POSTHOG_HOST
    ) {
      posthog.init(env.VITE_PUBLIC_POSTHOG_KEY, {
        api_host: env.VITE_PUBLIC_POSTHOG_HOST,
        capture_pageview: false, // We'll capture manually for SPA
        capture_pageleave: true,
        persistence: 'localStorage',
        autocapture: true,
      })
      posthogInitialized = true
    }
  }, [])

  // Track route changes
  useEffect(() => {
    if (posthogInitialized) {
      posthog.capture('$pageview', {
        $current_url: window.location.href,
      })
    }
  }, [location.pathname])

  return <>{children}</>
}
