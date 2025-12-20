import { LucideIcon } from "lucide-react";

interface RouteSubItem {
  title: string;
  url: string;
}

export interface RouteItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  subItems?: RouteSubItem[];
}

export interface RouteUser {
  name: string;
  email: string;
  image?: string;
}
