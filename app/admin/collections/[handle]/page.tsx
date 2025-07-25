import { PageLayout } from "@/components/layout/page-layout";
import { CollectionForm } from "../components/collection-form";
import { getCollection } from "@/lib/sfcc";
import { notFound } from "next/navigation";

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const collection = await getCollection(handle);

  if (!collection) {
    return notFound();
  }

  return (
    <PageLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold mb-4">Edit Collection</h1>
        <CollectionForm collection={collection} />
      </div>
    </PageLayout>
  );
}