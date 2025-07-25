import { PageLayout } from "@/components/layout/page-layout";
import { ProductForm } from "../components/product-form";
import { getProduct, getCollections } from "@/lib/sfcc";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const [product, collections] = await Promise.all([
    getProduct(handle),
    getCollections(),
  ]);

  if (!product) {
    return notFound();
  }

  return (
    <PageLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
        <ProductForm product={product} collections={collections} />
      </div>
    </PageLayout>
  );
}