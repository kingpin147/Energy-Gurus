"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
    } from "@/components/ui/dropdown-menu";
import { LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserNav({ showAvatar = true }: { showAvatar?: boolean }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative flex items-center justify-start gap-2 px-3 py-2 rounded-xl border border-line bg-white hover:bg-paper hover:border-amber/40 transition-all cursor-pointer overflow-hidden"
          style={{ height: "38px" }}
        >
          {showAvatar && (
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={(user.publicMetadata?.brandLogo as string) || user.imageUrl} alt={user.fullName ?? ""} />
              <AvatarFallback className="bg-teal text-white text-xs">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
          <span className={`text-xs font-bold text-navy-deep truncate max-w-[150px] ${showAvatar ? "hidden md:inline-block" : "inline-block"}`}>
            {user.fullName || user.firstName || "Account"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount sideOffset={8}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.fullName}</p>
            <p className="text-xs leading-none text-slate-custom">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut(() => router.push("/"))} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
