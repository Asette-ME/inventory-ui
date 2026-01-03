import { FerrisWheel, MapPin } from 'lucide-react';

import { NavGroup } from '@/components/nav/interfaces/nav.interface';

export const geoNav: NavGroup = {
  title: 'Geo',
  items: [
    {
      title: 'Locations',
      url: '#',
      icon: MapPin,
      isActive: true,
      subItems: [
        {
          title: 'Countries',
          url: '/geo/locations/countries',
        },
        {
          title: 'Cities',
          url: '/geo/locations/cities',
        },
        {
          title: 'Districts',
          url: '/geo/locations/districts',
        },
        {
          title: 'Areas',
          url: '/geo/locations/areas',
        },
      ],
    },
    {
      title: 'Attractions',
      url: '/geo/attractions',
      icon: FerrisWheel,
      isActive: false,
    },
  ],
};
