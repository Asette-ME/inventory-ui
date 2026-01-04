import { LucideIcon } from 'lucide-react';

interface NavSubItem {
  title: string;
  url: string;
  authorizedRoles?: string[];
}

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  subItems?: NavSubItem[];
  authorizedRoles?: string[];
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
  authorizedRoles?: string[];
}
