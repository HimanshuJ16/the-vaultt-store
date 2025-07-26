import React, { Suspense } from "react";
import Link from "next/link";
import { Product } from "@/lib/sfcc/types"; // Updated import
import { AddToCart } from "@/components/cart/add-to-cart";
import { VariantSelector } from "../variant-selector";
import { ProductImage } from "./product-image";

export const ProductCard = ({ product }: { product: Product }) => {
  const displayPrice = `₹${product.price.toFixed(2)}`;

  return (
    <div className="relative w-full aspect-[3/4] md:aspect-square bg-muted group overflow-hidden">
      <Link
        href={`/product/${product.handle}`}
        className="block size-full focus-visible:outline-none"
        aria-label={`View details for ${product.title}, price ${displayPrice}`}
        prefetch
      >
        <Suspense fallback={null}>
          <ProductImage product={product} />
        </Suspense>
      </Link>

      {/* Interactive Overlay */}
      <div className="absolute inset-0 w-full p-2 pointer-events-none">
        <div className="max-md:hidden w-full flex gap-6 justify-between items-baseline font-semibold px-3 py-1 group-hover:opacity-0 group-focus-visible:opacity-0 translate-y-0 group-hover:-translate-y-full group-focus-visible:-translate-y-full transition-all duration-300">
          <p className="text-sm 2xl:text-base uppercase text-balance">
            {product.title}
          </p>
          <p className="text-sm 2xl:text-base uppercase">
            {displayPrice}
          </p>
        </div>

        <div className="absolute bottom-3 inset-x-3 px-2 py-3 rounded-md bg-card flex flex-col gap-8 md:opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 md:translate-y-1/3 group-hover:translate-y-0 group-focus-visible:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto group-focus-visible:pointer-events-auto max-md:pointer-events-auto">
          <div className="grid grid-cols-2 items-end gap-y-8 gap-x-4">
            <p className="text-lg font-semibold text-pretty">{product.title}</p>
            <p className="text-lg font-semibold place-self-end">
              {displayPrice}
            </p>
            {/* <Suspense fallback={null}>
              <div className="self-center">
                <VariantSelector product={product} />
              </div>
            </Suspense>
            <Suspense fallback={null}>
              <AddToCart className="col-start-2" size="sm" product={product} />
            </Suspense> */}
          </div>
        </div>
      </div>
    </div>
  );
};