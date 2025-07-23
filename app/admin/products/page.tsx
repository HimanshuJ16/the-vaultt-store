import { getProducts } from "@/lib/sfcc"
import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminProductsPage() {
  const products = await getProducts({});

  return (
    <PageLayout>
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Products</h1>
            <Button asChild>
                <Link href="/admin/products/new">Add New Product</Link>
            </Button>
        </div>
      <DataTable columns={columns} data={products} />
    </PageLayout>
  )
}