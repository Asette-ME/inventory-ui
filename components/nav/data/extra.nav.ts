import { CreditCard, HousePlus } from 'lucide-react';

import { NavGroup } from '@/components/nav/interfaces/nav.interface';

export const extraNav: NavGroup = {
  title: 'Other',
  items: [
    {
      title: 'Payment Plans',
      url: '/extra/payment-plans',
      icon: CreditCard,
      isActive: true,
    },
    {
      title: 'Amenities',
      url: '/extra/amenities',
      icon: HousePlus,
      isActive: false,
    },
  ],
};
