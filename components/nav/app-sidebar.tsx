"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { routes } from "@/components/nav/data/routes";
import { RouteUser } from "@/components/nav/interfaces/routes.interface";
import { NavGroup } from "@/components/nav/nav-group";
import { NavProjects } from "@/components/nav/nav-projects";
import { NavUser } from "@/components/nav/nav-user";
import { useAuth } from "@/components/providers/auth-provider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Logo from "@/public/img/logo.jpg";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  let userData: RouteUser | null = null;
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
                <Image
                  src={Logo}
                  alt="Logo"
                  width={36}
                  height={36}
                  className="rounded-sm"
                />
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
        <NavGroup items={routes.dashboard} />
        <NavGroup title="Geo" items={routes.geo} />
        <NavProjects projects={routes.projects} />
      </SidebarContent>
      <SidebarFooter>{userData && <NavUser user={userData} />}</SidebarFooter>
    </Sidebar>
  );
}
