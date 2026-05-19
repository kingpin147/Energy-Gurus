'use client'

import posthog from 'posthog-js'
import { Facebook, Twitter, Instagram, Linkedin, Globe, Youtube, MessageSquare } from "lucide-react"

export function SocialLinkTracker({ 
  link, 
  id, 
  name,
  type = "brand"
}: { 
  link: { platform: string; url: string }, 
  id: string, 
  name: string,
  type?: "brand" | "epc"
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
