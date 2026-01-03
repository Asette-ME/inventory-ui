import { Frame, HardHat, LayoutDashboard } from 'lucide-react';

import { NavGroup } from '@/components/nav/interfaces/nav.interface';

export const mainNav: NavGroup = {
  title: '',
  items: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Developers',
      url: '/developers',
      icon: HardHat,
    },
    {
      title: 'Projects',
      url: '/projects',
      icon: Frame,
    },
  ],
};
