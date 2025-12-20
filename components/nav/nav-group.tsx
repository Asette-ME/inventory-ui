"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  NavGroupProps,
  NavItem,
} from "@/components/nav/interfaces/nav.interface";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavGroup({ title, items }: NavGroupProps) {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  const pathname = usePathname();

  return (
    <SidebarGroup>
      {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => {
          const isActive =
            pathname === item.url ||
            item.subItems?.some((sub) => pathname === sub.url) ||
            false;

          if (item.subItems?.length) {
            if (isCollapsed && !isMobile) {
              return SidebarMenuItemGroupCollapsed({
                item,
                isActive,
                pathname,
              });
            }

            return SidebarMenuItemGroup({ item, isActive, pathname });
          }

          return SidebarMenuItemSingle({ item, isActive });
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function SidebarMenuItemSingle({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}) {
  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
        <Link href={item.url}>
          <item.icon />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SidebarMenuItemGroup({
  item,
  isActive,
  pathname,
}: {
  item: NavItem;
  isActive: boolean;
  pathname: string;
}) {
  return (
    <Collapsible
      key={item.title}
      asChild
      defaultOpen={item.isActive || isActive}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title} isActive={isActive}>
            <item.icon />
            <span>{item.title}</span>
            <SidebarMenuItemGroupIcon />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.subItems?.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  asChild
                  isActive={pathname === subItem.url}
                >
                  <Link href={subItem.url}>
                    <span>{subItem.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function SidebarMenuItemGroupCollapsed({
  item,
  isActive,
  pathname,
}: {
  item: NavItem;
  isActive: boolean;
  pathname: string;
}) {
  return (
    <SidebarMenuItem key={item.title}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton tooltip={item.title} isActive={isActive}>
            <item.icon />
            <span>{item.title}</span>
            <SidebarMenuItemGroupIcon />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="w-48">
          <DropdownMenuLabel className="p-2 text-xs font-medium text-muted-foreground">
            {item.title}
          </DropdownMenuLabel>
          {item.subItems?.map((subItem) => {
            const isActive = pathname === subItem.url || false;
            return (
              <DropdownMenuItem key={subItem.title} asChild>
                <Link
                  href={subItem.url}
                  className={isActive ? "bg-secondary" : ""}
                >
                  <span className="truncate">{subItem.title}</span>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

function SidebarMenuItemGroupIcon() {
  return (
    <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
  );
}
