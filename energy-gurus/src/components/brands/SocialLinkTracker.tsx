'use client'

import posthog from 'posthog-js'
import { Facebook, Twitter, Instagram, Linkedin, Globe, Youtube, MessageSquare } from "lucide-react"

export function SocialLinkTracker({ 
  link, 
  id, 
  name,
  type = "brand",
  variant = "dark"
}: { 
  link: { platform: string; url: string }, 
  id: string, 
  name: string,
  type?: "brand" | "epc",
  variant?: "dark" | "light"
}) {
  const Icon = link.platform === "Facebook" ? Facebook :
               link.platform === "Twitter" ? Twitter :
               link.platform === "Instagram" ? Instagram :
               link.platform === "LinkedIn" ? Linkedin :
               link.platform === "YouTube" ? Youtube :
               link.platform === "WhatsApp" ? MessageSquare : Globe;

  const handleClick = () => {
    if (type === "epc") {
      posthog.capture('epc_social_click', {
        epcId: id,
        companyName: name,
        platform: link.platform,
        url: link.url
      })
    } else {
      posthog.capture('brand_social_click', {
        brandId: id,
        brandName: name,
        platform: link.platform,
        url: link.url
      })
    }
  }

  const lightClass = "w-9 h-9 bg-secondary rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all border border-border/50 group"
  const darkClass  = "w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all border border-white/5 group"
  const lightIcon  = "w-4 h-4 text-foreground group-hover:text-white group-hover:scale-110 transition-transform"
  const darkIcon   = "w-7 h-7 text-white group-hover:scale-110 transition-transform"

  return (
    <a 
      href={link.url} 
      target="_blank" 
      rel="noopener noreferrer"
      title={link.platform}
      aria-label={`${name} on ${link.platform}`}
      onClick={handleClick}
      className={variant === "light" ? lightClass : darkClass}
    >
      <Icon className={variant === "light" ? lightIcon : darkIcon} />
    </a>
  )
}
