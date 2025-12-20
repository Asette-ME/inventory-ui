import { FerrisWheel, Frame, LayoutDashboard, MapPin } from "lucide-react";

import { RouteItem } from "@/components/nav/interfaces/routes.interface";

export const routes: Record<string, RouteItem[]> = {
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
  projects: [
    {
      title: "Design Engineering",
      url: "#",
      icon: Frame,
    },
  ],
};
