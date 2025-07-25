// commerce/app/admin/layout.tsx
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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  HomeIcon,
  LogOutIcon,
  PackageIcon,
  ShoppingBagIcon,
  TagIcon,
  UsersIcon,
  UserCircleIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Return early for the login page to avoid rendering the sidebar
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
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r shadow-sm bg-muted text-muted-foreground" collapsible="icon">
          <SidebarHeader className="flex items-center justify-between p-4">
            <Link href="/admin" className="group-data-[collapsible=icon]:hidden">
              <Image
                src="/logo1.png"
                alt="Logo"
                width={150}
                height={50}
                className="object-contain"
              />
            </Link>
            <SidebarTrigger className="md:hidden" />
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              <SidebarGroup>
                <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
                <NavItems />
              </SidebarGroup>
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarSeparator />
          
          <SidebarFooter>
            <SidebarMenu>
              <SidebarGroup>
                <SidebarGroupLabel>User</SidebarGroupLabel>
                <SidebarMenuItem>
                  <div className="group flex items-center gap-3 rounded-md py-2">
                    <UserCircleIcon className="h-5 w-5 flex-shrink-0" />
                    <div className="group-data-[collapsible=icon]:hidden">
                      <p className="text-sm font-medium">Administrator</p>
                      <p className="text-xs text-muted-foreground">
                        thevaulttstore@gmail.com
                      </p>
                    </div>
                  </div>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <a href="/api/admin/logout">
                    <SidebarMenuButton
                      tooltip="Logout"
                      className="flex w-full items-center gap-3 rounded-md py-2 transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <LogOutIcon className="h-5 w-5" />
                      <span className="group-data-[collapsible=icon]:hidden text-sm font-medium">
                        Logout
                      </span>
                    </SidebarMenuButton>
                  </a>
                </SidebarMenuItem>
              </SidebarGroup>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 bg-background">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </header>
          <main className="p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}

// Extracted NavItems to a separate component to clean up the main layout
function NavItems() {
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
    <>
      {navItems.map((item) => {
        const active = isActive(item.href);
        return (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href}>
              <SidebarMenuButton
                isActive={active}
                tooltip={item.label}
                className={clsx(
                  "group flex w-full items-center gap-3 rounded-md px-4 py-2 transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-foreground"
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
    </>
  );
}