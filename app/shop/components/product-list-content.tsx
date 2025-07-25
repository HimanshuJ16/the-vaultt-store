"use client";

import { useEffect } from "react";
import { Product, Collection } from "@/lib/sfcc/types";
import { useProducts } from "../providers/products-provider";
import { ProductCard } from "./product-card";
import { Suspense } from "react";
import ResultsControls from "./results-controls";
import { useQueryState, parseAsString } from "nuqs";

interface ProductListContentProps {
  products: Product[];
  collections: Pick<Collection, "handle" | "title">[];
}

export function ProductListContent({
  products,
  collections,
}: ProductListContentProps) {
  const { setProducts, products: providerProducts } = useProducts();
  const [sort] = useQueryState("sort", parseAsString);

  // Set initial products in the provider
  useEffect(() => {
    setProducts(products);
  }, [products, setProducts]);

  // Apply sorting to the provider's products based on the sort query parameter
  const sortedProducts = sort
    ? [...providerProducts].sort((a, b) => {
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
      })
    : providerProducts;

  return (
    <>
      <Suspense>
        <ResultsControls
          className="max-md:hidden"
          collections={collections}
          products={sortedProducts}
        />
      </Suspense>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}