// File: commerce/app/admin/products/page.tsx

import { getProducts } from "@/lib/sfcc";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProductTable } from "./components/product-table";

export default async function AdminProducts() {
  const products = await getProducts({});

  return (
    <PageLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Products</h1>
          <Button asChild>
            <Link href="/admin/products/new">Add Product</Link>
          </Button>
        </div>
        <ProductTable products={products} />
      </div>
    </PageLayout>
  );
}