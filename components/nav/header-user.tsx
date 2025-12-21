"use client";

import { NavItemUser } from "@/components/nav/interfaces/nav.interface";
import {
  getUserInitials,
  UserDropdownContent,
} from "@/components/nav/nav-user";
import { useAuth } from "@/components/providers/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function HeaderUser() {
  const { user } = useAuth();

  if (!user) return null;

  const userData: NavItemUser = {
    name: user.username,
    email: user.email,
    image: user.image,
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 overflow-hidden">
          <Avatar className="h-9 w-9">
            <AvatarImage src={userData.image} alt={userData.name} />
            <AvatarFallback className="bg-white dark:bg-muted">
              {getUserInitials(userData.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <UserDropdownContent user={userData} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
