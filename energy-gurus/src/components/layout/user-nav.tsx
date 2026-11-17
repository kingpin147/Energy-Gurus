"use client";

import React, { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Loader2, Camera, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { getCurrentUserAvatar } from "@/lib/actions/users";
import { AvatarUploadModal } from "@/components/layout/avatar-upload-modal";

export function UserNav({ showAvatar = true }: { showAvatar?: boolean }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [dbAvatar, setDbAvatar] = useState<string | null>(null);
  const [customAvatar, setCustomAvatar] = useState<string | null | undefined>(undefined);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);

  // Fetch avatar from PostgreSQL users table if not already present in Clerk publicMetadata
  useEffect(() => {
    if (user) {
      getCurrentUserAvatar()
        .then((url) => {
          if (url) setDbAvatar(url);
        })
        .catch(() => {});
    }
  }, [user]);

  if (!isLoaded) {
    return (
      <Button variant="ghost" className="relative h-9 px-3 rounded-xl border border-line">
        <Loader2 className="h-4 w-4 animate-spin text-slate-custom" />
      </Button>
    );
  }

  if (!user) {
    return null;
  }

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Determine effective avatar with R2 priority
  const effectiveAvatar =
    customAvatar !== undefined
      ? customAvatar
      : (user.publicMetadata?.avatarUrl as string) ||
        (user.publicMetadata?.r2AvatarUrl as string) ||
        dbAvatar ||
        (user.publicMetadata?.brandLogo as string) ||
        (user.publicMetadata?.epcLogo as string) ||
        (user.hasImage ? user.imageUrl : null);

  const displayName = user.fullName || user.firstName || "Account";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative flex items-center justify-start gap-2.5 px-3 py-2 rounded-xl border border-line bg-white hover:bg-paper hover:border-amber/40 transition-all cursor-pointer overflow-hidden shadow-2xs group"
            style={{ height: "40px" }}
          >
            {showAvatar && (
              <Avatar className="h-7 w-7 rounded-full border border-line/80 shadow-2xs bg-white shrink-0 group-hover:border-amber/40 transition-colors">
                <AvatarImage
                  src={effectiveAvatar || undefined}
                  alt={displayName}
                  className="object-cover w-full h-full"
                />
                <AvatarFallback className="bg-amber/10 text-amber font-bold text-xs font-ibm-plex-mono">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
            )}
            <span
              className={`text-xs font-bold text-navy-deep group-hover:text-amber transition-colors truncate max-w-[150px] ${
                showAvatar ? "inline-block" : "inline-block"
              }`}
            >
              {displayName}
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-64 p-1.5 shadow-xl border border-line rounded-2xl bg-white font-sans"
          align="end"
          forceMount
          sideOffset={8}
        >
          {/* User Profile Header */}
          <DropdownMenuLabel className="font-normal p-3 pb-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 rounded-full border border-line shadow-xs shrink-0 bg-white">
                <AvatarImage
                  src={effectiveAvatar || undefined}
                  alt={displayName}
                  className="object-cover w-full h-full"
                />
                <AvatarFallback className="bg-amber/10 text-amber font-bold text-sm font-ibm-plex-mono">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <p className="text-sm font-bold text-navy-deep truncate leading-tight">
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-400 font-ibm-plex-mono truncate mt-0.5">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="my-1 bg-line/80" />

          {/* Change Avatar Action */}
          <DropdownMenuItem
            onClick={() => setIsAvatarModalOpen(true)}
            className="cursor-pointer text-xs font-semibold text-navy-deep hover:text-amber hover:bg-amber/5 transition-colors flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
          >
            <Camera className="w-4 h-4 text-amber" />
            <span>Change Avatar</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-line/80" />

          {/* Sign Out Action */}
          <DropdownMenuItem
            onClick={() => signOut(() => router.push("/"))}
            className="cursor-pointer text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors flex items-center gap-2.5 px-3 py-2 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Avatar Upload Modal (Max 20 MB, Uploads to R2) */}
      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={effectiveAvatar}
        userName={displayName}
        onAvatarUpdated={(newUrl) => {
          setCustomAvatar(newUrl);
        }}
      />
    </>
  );
}
