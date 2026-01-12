import { Building, House } from 'lucide-react';

import { NavGroup } from '@/components/nav/interfaces/nav.interface';

export const propertyNav: NavGroup = {
  title: 'Properties',
  items: [
    {
      title: 'Buildings',
      url: '/properties/structures',
      icon: Building,
    },
    {
      title: 'Units',
      url: '/properties/units',
      icon: House,
    },
  ],
};
