import { Metadata } from "next";
import { getCollection, getCollectionProducts } from "@/lib/sfcc";
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
    title: `${collection.title} | The Vaultt Store`,
    description:
      collection.description || `Explore ${collection.title} products.`,
  };
}

export default async function ShopCategory({
  params,
  searchParams,
}: {
  params: { collection: string };
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { collection: handle } = await params;
  // Fetch products for the given collection
  const products = await getCollectionProducts({ collection: handle });

  // Await searchParams to access sort
  const resolvedSearchParams = await searchParams;
  const sort = typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : null;

  // Sort the products array *before* passing it to the component
  let sortedProducts = [...products]; // Create a copy to avoid mutating the original array
  if (sort) {
    sortedProducts = sortedProducts.sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return (a.price || 0) - (b.price || 0);
        case "price-desc":
          return (b.price || 0) - (a.price || 0);
        case "newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "oldest":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        default:
          return 0;
      }
    });
  }

  return <ProductList collection={handle} products={sortedProducts} />;
}