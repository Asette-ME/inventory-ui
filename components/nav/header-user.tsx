'use client';

import { UserDropdownContent } from '@/components/nav/nav-user';
import { useAuth } from '@/components/providers/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getUserInitials } from '@/lib/utils';

export function HeaderUser() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 overflow-hidden">
          <Avatar className="h-9 w-9">
            {user.image && <AvatarImage src={user.image} alt={user.username} />}
            <AvatarFallback className="bg-white dark:bg-muted">{getUserInitials(user.username)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <UserDropdownContent user={user} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
