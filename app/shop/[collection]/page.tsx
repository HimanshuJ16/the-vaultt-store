import { Metadata } from "next";
import { getCollection } from "@/lib/sfcc";
import { notFound } from "next/navigation";
import ProductList from "../components/product-list";

export async function generateMetadata({
  params,
}: {
  params: { collection: string };
}): Promise<Metadata> {
  const { collection: handle } = await params;
  const collection = await getCollection(handle);

  if (!collection) return notFound();

  return {
    title: `${collection.title} | ACME Store`,
    description:
      collection.description || `Explore ${collection.title} products.`,
  };
}

export default async function ShopCategory({
  params,
}: {
  params: { collection: string };
}) {
  const { collection } = await params;
  return <ProductList collection={collection} />;
}