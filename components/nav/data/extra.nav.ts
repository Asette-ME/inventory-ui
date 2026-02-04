import { CreditCard } from 'lucide-react';

import { NavGroupItem } from '@/components/nav/interfaces/nav.interface';

export const extraNav: NavGroupItem = {
  title: 'Other',
  items: [
    {
      title: 'Payment Plans',
      url: '/extra/payment-plans',
      icon: CreditCard,
    },
  ],
};
