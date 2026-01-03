'use client';

import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { navRouteGroups } from '@/components/nav/data';
import { NavItemUser } from '@/components/nav/interfaces/nav.interface';
import { NavGroup } from '@/components/nav/nav-group';
import { NavUser } from '@/components/nav/nav-user';
import { useAuth } from '@/components/providers/auth-provider';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Logo from '@/public/img/logo.jpg';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  let userData: NavItemUser | null = null;
  if (user) {
    userData = {
      name: user.username,
      email: user.email,
      image: user.image,
    };
  }

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <Image src={Logo} alt="Logo" width={36} height={36} className="rounded-sm" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Asette.ai</span>
                  <span className="truncate text-xs">Inventory</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navRouteGroups.map((group, index) => (
          <NavGroup key={index} title={group.title} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>{userData && <NavUser user={userData} />}</SidebarFooter>
    </Sidebar>
  );
}
