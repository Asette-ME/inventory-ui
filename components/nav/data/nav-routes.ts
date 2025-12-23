import {
  FerrisWheel,
  Frame,
  KeyRound,
  LayoutDashboard,
  MapPin,
  Users,
} from "lucide-react";

import { NavItem } from "@/components/nav/interfaces/nav.interface";

interface NavRouteGroup {
  title?: string;
  routes: NavItem[];
}

export const navRouteGroups: NavRouteGroup[] = [
  {
    routes: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Geo",
    routes: [
      {
        title: "Locations",
        url: "#",
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
  },
  {
    title: "Access",
    routes: [
      {
        title: "Users",
        url: "/access/users",
        icon: Users,
        isActive: false,
      },
      {
        title: "Roles",
        url: "/access/roles",
        icon: KeyRound,
        isActive: false,
      },
    ],
  },
];

export const navCustomRoutes = {
  projects: [
    {
      title: "Design Engineering",
      url: "#",
      icon: Frame,
    },
  ],
} satisfies Record<string, NavItem[]>;
