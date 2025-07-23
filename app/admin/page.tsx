// File: commerce/app/admin/page.tsx

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageLayout } from "@/components/layout/page-layout";
import { ShoppingBagIcon, TagIcon, UsersIcon, PackageIcon } from "lucide-react";
import Link from "next/link";
import {
  getProducts,
  getCollections,
  getUsers,
  getOrders,
} from "@/lib/sfcc";

export default async function AdminDashboard() {
  // Fetch data to show counts
  const [products, collections, users, orders] = await Promise.all([
    getProducts({}),
    getCollections(),
    getUsers(),
    getOrders(),
  ]);

  const dashboardItems = [
    {
      title: "Products",
      href: "/admin/products",
      icon: <ShoppingBagIcon className="h-8 w-8 text-muted-foreground" />,
      count: products.length,
      description: "Manage all products",
    },
    {
      title: "Collections",
      href: "/admin/collections",
      icon: <TagIcon className="h-8 w-8 text-muted-foreground" />,
      count: collections.length,
      description: "Organize products into collections",
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: <UsersIcon className="h-8 w-8 text-muted-foreground" />,
      count: users.length,
      description: "View and manage customers",
    },
    {
      title: "Orders",
      href: "/admin/orders",
      icon: <PackageIcon className="h-8 w-8 text-muted-foreground" />,
      count: orders.length,
      description: "View and process orders",
    },
  ];

  return (
    <PageLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardItems.map((item) => (
            <Link href={item.href} key={item.title}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {item.title}
                  </CardTitle>
                  {item.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{item.count}</div>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}