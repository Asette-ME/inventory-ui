import { LucideIcon } from "lucide-react";

interface NavSubItem {
  title: string;
  url: string;
}

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  subItems?: NavSubItem[];
}

export interface NavGroupProps {
  title?: string;
  items: NavItem[];
}

export interface NavItemUser {
  name: string;
  email: string;
  image?: string;
}
