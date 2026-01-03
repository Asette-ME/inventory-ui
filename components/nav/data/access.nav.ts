import { KeyRound, Users } from 'lucide-react';

import { NavGroup } from '@/components/nav/interfaces/nav.interface';

export const accessNav: NavGroup = {
  title: 'Access',
  items: [
    {
      title: 'Users',
      url: '/access/users',
      icon: Users,
      isActive: false,
    },
    {
      title: 'Roles',
      url: '/access/roles',
      icon: KeyRound,
      isActive: false,
    },
  ],
};
