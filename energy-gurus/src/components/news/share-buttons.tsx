"use client";

import React, { useState } from "react";
import { Share2, Mail, Linkedin, Facebook, Copy, Check, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ShareButtonsProps {
  title: string;
}

export function ShareButtons({ title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return "";
  };

  const handleCopy = () => {
    const url = getShareUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Article link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: "whatsapp" | "facebook" | "linkedin" | "email") => {
    const url = getShareUrl();
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    let shareLink = "";
    switch (platform) {
      case "whatsapp":
        shareLink = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "email":
        shareLink = `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`Check out this article on Energy Gurus: `)}${encodedUrl}`;
        break;
    }

    if (shareLink) {
      window.open(shareLink, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 px-3.5 rounded-xl border-line text-slate-custom hover:text-ink font-semibold text-xs gap-2 bg-white shadow-sm">
          <Share2 className="w-4 h-4 text-amber" /> Share Article
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl border-line bg-white">
        <DropdownMenuLabel className="text-xs font-bold text-slate-custom uppercase tracking-wider px-2 py-1">
          Share Article Via
        </DropdownMenuLabel>
        
        <DropdownMenuItem onClick={() => handleShare("whatsapp")} className="rounded-xl cursor-pointer text-emerald-700 hover:bg-emerald-50 font-semibold text-xs gap-2.5 py-2">
          <MessageSquare className="w-4 h-4 text-emerald-600" /> WhatsApp
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleShare("facebook")} className="rounded-xl cursor-pointer text-blue-700 hover:bg-blue-50 font-semibold text-xs gap-2.5 py-2">
          <Facebook className="w-4 h-4 text-blue-600" /> Facebook
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleShare("linkedin")} className="rounded-xl cursor-pointer text-sky-800 hover:bg-sky-50 font-semibold text-xs gap-2.5 py-2">
          <Linkedin className="w-4 h-4 text-sky-700" /> LinkedIn
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleShare("email")} className="rounded-xl cursor-pointer text-slate-700 hover:bg-slate-100 font-semibold text-xs gap-2.5 py-2">
          <Mail className="w-4 h-4 text-slate-600" /> Email
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 bg-line" />

        <DropdownMenuItem onClick={handleCopy} className="rounded-xl cursor-pointer font-bold text-xs gap-2.5 py-2 text-ink">
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
          {copied ? "Link Copied!" : "Copy Article Link"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
