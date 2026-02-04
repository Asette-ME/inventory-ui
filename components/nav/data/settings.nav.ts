import { Bus, Settings, Sparkles, Tags } from 'lucide-react';

import { NavGroupItem } from '@/components/nav/interfaces/nav.interface';

export const settingsNav: NavGroupItem = {
  title: 'Settings',
  items: [
    {
      title: 'Categories',
      url: '/categories',
      icon: Tags,
    },
    {
      title: 'Amenities',
      url: '/settings/amenities',
      icon: Sparkles,
    },
    {
      title: 'Transports',
      url: '/settings/transports',
      icon: Bus,
    },
    {
      title: 'Types',
      url: '#',
      icon: Settings,
      subItems: [
        {
          title: 'Feature Types',
          url: '/settings/feature-types',
        },
        {
          title: 'Structure Types',
          url: '/settings/structure-types',
        },
      ],
    },
  ],
};
