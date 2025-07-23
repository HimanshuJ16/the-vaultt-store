import { getCollectionProducts, getCollections, getProducts } from "@/lib/sfcc"; // Updated import
import { ProductListContent } from "./product-list-content";

export default async function ProductList({
  collection,
}: {
  collection?: string; // Made optional
}) {
  // If a collection handle is provided, fetch products for that collection.
  // Otherwise, fetch all products.
  const products = collection 
    ? await getCollectionProducts({ collection })
    : await getProducts({}); 
  
  const collections = await getCollections();

  return <ProductListContent products={products} collections={collections} />;
}
