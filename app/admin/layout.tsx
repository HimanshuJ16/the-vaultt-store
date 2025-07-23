"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  HomeIcon,
  ShoppingBagIcon,
  TagIcon,
  UsersIcon,
  PackageIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", icon: HomeIcon, label: "Dashboard" },
    { href: "/admin/products", icon: ShoppingBagIcon, label: "Products" },
    { href: "/admin/collections", icon: TagIcon, label: "Collections" },
    { href: "/admin/orders", icon: PackageIcon, label: "Orders" },
    { href: "/admin/users", icon: UsersIcon, label: "Users" },
  ];

  const isActive = (href: string) => {
    return href === "/admin"
      ? pathname === href
      : pathname.startsWith(href);
  };

  return (
    <SidebarProvider>
      <Sidebar className="bg-muted text-muted-foreground border-r shadow-sm">
        <SidebarHeader className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold text-foreground">Admin</h1>
          <SidebarTrigger />
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={active}
                    tooltip={item.label}
                    className={clsx(
                      "group flex items-center gap-3 px-4 py-2 rounded-md transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="group-data-[collapsible=icon]:hidden text-sm font-medium">
                      {item.label}
                    </span>
                  </SidebarMenuButton>
                  </Link>
                  
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="min-h-screen p-6 bg-background">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
