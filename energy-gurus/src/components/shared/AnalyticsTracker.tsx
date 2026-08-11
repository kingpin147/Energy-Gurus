'use client'

import posthog from 'posthog-js'
import Link from "next/link";
import React, { ReactNode } from 'react'

/**
 * Utility function to track events from client components
 */
export const trackEngagement = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.capture(eventName, properties)
  }
}

interface TrackedLinkProps {
  href: any
  children: ReactNode
  className?: string
  eventName: string
  eventProperties?: Record<string, any>
  target?: string
}

export function TrackedLink({
  href,
  children,
  className,
  eventName,
  eventProperties,
  target
}: TrackedLinkProps) {
  const handleClick = () => {
    trackEngagement(eventName, eventProperties)
  }

  return (
    <Link href={href} className={className} onClick={handleClick} target={target}>
      {children}
    </Link>
  )
}

interface TrackedButtonProps extends React.HTMLAttributes<HTMLElement> {
  onClick?: (e: any) => void
  children: ReactNode
  className?: string
  eventName: string
  eventProperties?: Record<string, any>
  as?: 'button' | 'div' | 'a' | 'span'
  href?: string
  target?: string
}

export const TrackedInteraction = React.forwardRef<any, TrackedButtonProps>(({
  children,
  className,
  eventName,
  eventProperties,
  as: Component = 'div',
  onClick,
  ...props
}, ref) => {
  const handleClick = (e: any) => {
    trackEngagement(eventName, eventProperties)
    if (onClick) onClick(e)
  }

  return (
    <Component className={className} onClick={handleClick} ref={ref} {...props}>
      {children}
    </Component>
  )
})

TrackedInteraction.displayName = 'TrackedInteraction'
