"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { Link } from "@/i18n/routing";
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
import { LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserNav() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
        <Loader2 className="h-5 w-5 animate-spin text-slate-custom" />
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
          className="relative flex items-center justify-center gap-2 pl-1 pr-2 rounded-full border border-gray-200 hover:bg-gray-100 overflow-hidden"
          style={{ height: "40px", minWidth: "40px" }}
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={(user.publicMetadata?.brandLogo as string) || user.imageUrl} alt={user.fullName ?? ""} />
            <AvatarFallback className="bg-teal text-white">
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="user-name-text text-sm font-semibold text-ink truncate max-w-[140px]">{user.fullName}</span>
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
      <style>{`
        .user-name-text { display: inline-block; }
        @media (max-width: 767px) {
          .user-name-text { display: none; }
        }
      `}</style>
    </DropdownMenu>
  );
}
