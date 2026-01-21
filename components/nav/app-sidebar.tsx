'use client';

import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { navRouteGroups } from '@/components/nav/data';
import { NavGroupItem } from '@/components/nav/nav-group';
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
  const { user, isAuthorized } = useAuth();

  const authorizedGroups = navRouteGroups
    .filter((group) => isAuthorized(group.authorizedRoles || []))
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item) => isAuthorized(item.authorizedRoles || []))
        .map((item) => ({
          ...item,
          subItems: item.subItems?.filter((subItem) => isAuthorized(subItem.authorizedRoles || [])),
        })),
    }));

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
        {authorizedGroups.map((group, index) => (
          <NavGroupItem key={index} title={group.title} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
