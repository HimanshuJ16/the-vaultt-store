"use client";

import { useProductImages } from "@/components/products/variant-selector";
import { Product } from "@/lib/sfcc/types"; // Updated import path
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";

export const DesktopGallery = ({ product }: { product: Product }) => {
  // The useProductImages hook is now simplified as variants don't have unique images
  const images = useProductImages(product);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">No Image Available</p>
      </div>
    );
  }

  return images.map((image: { width: any; height: any; id: any; url: string | StaticImport; altText: any; }) => (
    <Image
      style={{
        aspectRatio: `${image.width || 1} / ${image.height || 1}`,
      }}
      key={image.id || image.url}
      src={image.url}
      alt={image.altText || product.title}
      width={image.width || 1200}
      height={image.height || 1200}
      className="w-full object-cover"
      quality={100}
    />
  ));
};
