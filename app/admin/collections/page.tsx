// File: commerce/app/admin/collections/page.tsx

import { getCollections } from "@/lib/sfcc";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CollectionTable } from "./components/collection-table";

export default async function AdminCollections() {
  const collections = await getCollections();

  return (
    <PageLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Collections</h1>
          <Button asChild>
            <Link href="/admin/collections/new">Add Collection</Link>
          </Button>
        </div>
        <CollectionTable collections={collections} />
      </div>
    </PageLayout>
  );
}