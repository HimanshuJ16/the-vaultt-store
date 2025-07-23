"use client";

import {
  useProductImages,
} from "@/components/products/variant-selector";
import { Product } from "@/lib/sfcc/types"; // Updated import
import Image from "next/image";

export const ProductImage = ({ product }: { product: Product }) => {
  const images = useProductImages(product);
  const [variantImage] = images;

  if (!variantImage || !variantImage.url) {
    return (
        <div className="size-full bg-secondary flex items-center justify-center">
            <span className="text-muted-foreground text-sm">No Image</span>
        </div>
    );
  }

  return (
    <Image
      src={variantImage.url}
      alt={variantImage.altText || product.title}
      width={variantImage.width || 1000}
      height={variantImage.height || 1000}
      className="size-full object-cover"
      quality={100}
    />
  );
};