import { Frame, HardHat, LayoutDashboard } from 'lucide-react';

import { NavGroupItem } from '@/components/nav/interfaces/nav.interface';

export const mainNav: NavGroupItem = {
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
