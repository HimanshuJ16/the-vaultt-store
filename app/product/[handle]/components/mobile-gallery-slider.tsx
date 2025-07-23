"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { Product } from "@/lib/sfcc/types"; // Updated import path
import { Badge } from "@/components/ui/badge";
import { useProductImages } from "@/components/products/variant-selector";

interface MobileGallerySliderProps {
  product: Product;
}

export function MobileGallerySlider({ product }: MobileGallerySliderProps) {
  const images = useProductImages(product);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect(); // Set initial index
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const totalImages = images.length;

  if (totalImages === 0) return null;

  return (
    <div className="relative w-full h-full">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((image, index) => (
            <div
              key={image.id || image.url}
              className="flex-shrink-0 w-full h-full relative"
            >
              <Image
                style={{
                  aspectRatio: `${image.width || 1} / ${image.height || 1}`,
                }}
                src={image.url}
                alt={image.altText || product.title}
                width={image.width || 1200}
                height={image.height || 1200}
                className="w-full h-full object-cover"
                quality={100}
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {totalImages > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <Badge variant="outline">
            {selectedIndex + 1} / {totalImages}
          </Badge>
        </div>
      )}
    </div>
  );
}
