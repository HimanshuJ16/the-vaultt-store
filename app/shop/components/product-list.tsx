import { getCollections } from "@/lib/sfcc";
import { ProductListContent } from "./product-list-content";
import { Product } from "@/lib/sfcc/types";

export default async function ProductList({
  collection,
  products,
}: {
  collection?: string;
  products: Product[];
}) {
  const collections = await getCollections();

  return <ProductListContent products={products} collections={collections} />;
}