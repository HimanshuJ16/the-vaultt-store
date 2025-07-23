import { PageLayout } from "@/components/layout/page-layout";
import { getCollections } from "@/lib/sfcc";
import { ProductForm } from "../components/product-form";

export default async function NewProductPage() {
  const collections = await getCollections();

  return (
    <PageLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold mb-4">Add New Product</h1>
        <ProductForm collections={collections} />
      </div>
    </PageLayout>
  );
}