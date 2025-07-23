import { getCollections } from "@/lib/sfcc"
import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminCollectionsPage() {
  const collections = await getCollections();

  return (
    <PageLayout>
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Collections</h1>
            <Button asChild>
                <Link href="/admin/collections/new">Add New Collection</Link>
            </Button>
        </div>
      <DataTable columns={columns} data={collections} />
    </PageLayout>
  )
}