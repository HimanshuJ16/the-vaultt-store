"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
  LogOutIcon,
  PackageIcon,
  ShoppingBagIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner"; // Import Toaster from sonner

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

  if (pathname === "/admin/login") {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar className="border-r shadow-sm bg-muted text-muted-foreground">
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
                        "group flex items-center gap-3 rounded-md px-4 py-2 transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-foreground",
                      )}
                    >
                      <item.icon className="h-5 w-5" />
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
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <a href="/api/admin/logout">
                <SidebarMenuButton
                  tooltip="Logout"
                  className="group flex items-center gap-3 rounded-md px-4 py-2 transition-colors hover:bg-accent hover:text-foreground"
                >
                  <LogOutIcon className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden text-sm font-medium">
                    Logout
                  </span>
                </SidebarMenuButton>
              </a>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-h-screen bg-background p-6">
        {children}
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}