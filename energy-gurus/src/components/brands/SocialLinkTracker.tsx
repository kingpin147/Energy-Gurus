'use client'

import posthog from 'posthog-js'
import { Facebook, Twitter, Instagram, Linkedin, Globe } from "lucide-react"

export function SocialLinkTracker({ 
  link, 
  brandId, 
  brandName 
}: { 
  link: { platform: string; url: string }, 
  brandId: string, 
  brandName: string 
}) {
  const Icon = link.platform === "Facebook" ? Facebook :
               link.platform === "Twitter" ? Twitter :
               link.platform === "Instagram" ? Instagram :
               link.platform === "LinkedIn" ? Linkedin : Globe;

  const handleClick = () => {
    posthog.capture('brand_social_click', {
      brandId,
      brandName,
      platform: link.platform,
      url: link.url
    })
  }

  return (
    <a 
      href={link.url} 
      target="_blank" 
      rel="noopener noreferrer"
      onClick={handleClick}
      className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all border border-white/5 group"
    >
      <Icon className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
    </a>
  )
}
