import { PageLayout } from "@/components/layout/page-layout";
import { CollectionForm } from "../components/collection-form";

export default function NewCollectionPage() {
  return (
    <PageLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold mb-4">Add New Collection</h1>
        <CollectionForm />
      </div>
    </PageLayout>
  );
}