'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import PostHogPageView from './PostHogPageView'

if (typeof window !== 'undefined') {
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: 'always', 
      capture_pageview: false, // Disable automatic pageview capture to manually trigger it on router events
    })
  } else {
    console.warn('PostHog is not initialized because NEXT_PUBLIC_POSTHOG_KEY is missing');
  }
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
    return (
      <PostHogProvider client={posthog}>
        <PostHogPageView />
        {children}
      </PostHogProvider>
    )
}
