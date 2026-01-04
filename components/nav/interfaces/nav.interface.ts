import { LucideIcon } from 'lucide-react';

interface NavSubItem {
  title: string;
  url: string;
  roles?: string[];
}

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  subItems?: NavSubItem[];
  roles?: string[];
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
  roles?: string[];
}
