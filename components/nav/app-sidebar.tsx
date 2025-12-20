"use client";

import { FerrisWheel, Frame, LayoutDashboard, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

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

// This is sample data.
const routes = {
  dashboard: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
  ],
  geo: [
    {
      title: "Locations",
      icon: MapPin,
      isActive: true,
      subItems: [
        {
          title: "Countries",
          url: "/geo/locations/countries",
        },
        {
          title: "Cities",
          url: "/geo/locations/cities",
        },
        {
          title: "Districts",
          url: "/geo/locations/districts",
        },
      ],
    },
    {
      title: "Attractions",
      url: "/geo/attractions",
      icon: FerrisWheel,
      isActive: false,
    },
  ],
  projects: [
    {
      title: "Design Engineering",
      url: "#",
      icon: Frame,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  let userData;
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
