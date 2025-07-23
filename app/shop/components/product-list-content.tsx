"use client";

import { useEffect } from "react";
import { Product, Collection } from "@/lib/sfcc/types"; // Updated import
import { useProducts } from "../providers/products-provider"; // Assuming path
import { ProductCard } from "./product-card";
import { Suspense } from "react";
import ResultsControls from "./results-controls";

interface ProductListContentProps {
  products: Product[];
  collections: Pick<Collection, "handle" | "title">[];
}

export function ProductListContent({
  products,
  collections,
}: ProductListContentProps) {
  const { setProducts } = useProducts();

  // Set products in the provider whenever they change
  useEffect(() => {
    setProducts(products);
  }, [products, setProducts]);

  return (
    <>
      <Suspense>
        <ResultsControls
          className="max-md:hidden"
          collections={collections}
          products={products}
        />
      </Suspense>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
