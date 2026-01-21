import { KeyRound, Users } from 'lucide-react';

import { NavGroupItem } from '@/components/nav/interfaces/nav.interface';

export const accessNav: NavGroupItem = {
  title: 'Access',
  authorizedRoles: ['admin'],
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
