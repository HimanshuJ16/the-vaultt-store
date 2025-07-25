import { Metadata } from "next";
import { getProducts } from "@/lib/sfcc";
import ProductList from "./components/product-list";

export const metadata: Metadata = {
  title: "Shop | The Vaultt Store",
  description: "Explore all products available at the Vaultt Store.",
};

export default async function Shop({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Fetch all products
  const products = await getProducts({});

  // Await searchParams to access sort
  const resolvedSearchParams = await searchParams;
  const sort = typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : null;

  // Sort the products array if a sort parameter is provided
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

  // Pass the sorted products and an empty collection to ProductList
  return <ProductList collection={""} products={sortedProducts} />;
}