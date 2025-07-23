"use client";

import React, { Suspense } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Collection } from "@/lib/sfcc/types"; // Updated import
import Link from "next/link";
import { SidebarLinks } from "@/components/layout/sidebar/product-sidebar-links";
import { CategoryFilter } from "./category-filter";
import { ColorFilter } from "./color-filter";
import { useProducts } from "../providers/products-provider";

export function DesktopFilters({
  collections,
  className,
}: {
  collections: Collection[];
  className?: string;
}) {
  const { products } = useProducts();
  return (
    <aside
      className={cn(
        "grid grid-cols-3 pl-sides pt-top-spacing h-screen sticky top-0",
        className
      )}
    >
      <div className="flex flex-col gap-4 col-span-2">
        <div className="flex items-baseline justify-between pl-2 -mb-2">
          <h2 className="text-2xl font-semibold">Filter</h2>
          <Button
            size={"sm"}
            variant="ghost"
            aria-label="Clear all filters"
            className="font-medium text-foreground/50 hover:text-foreground/60"
            asChild
          >
            <Link href="/shop" prefetch>
              Clear
            </Link>
          </Button>
        </div>
        <Suspense fallback={null}>
          <CategoryFilter collections={collections} />
          <ColorFilter products={products} />
        </Suspense>
      </div>

      <div className="self-end col-span-3">
        <SidebarLinks className="py-sides" size="sm" />
      </div>
    </aside>
  );
}
