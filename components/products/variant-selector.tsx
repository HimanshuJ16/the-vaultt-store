"use client";

import { cva, type VariantProps } from "class-variance-authority";
import {
  Product,
  ProductOption,
  ProductVariant,
  Image as ProductImage, // Renamed to avoid conflict with Next/Image
} from "@/lib/sfcc/types"; // Updated import path
import { startTransition, useMemo } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { useSearchParams } from "next/navigation";
import { ColorSwatch } from "@/components/ui/color-picker";
import { Button } from "@/components/ui/button";
import { getColorHex } from "@/lib/utils";

// Define a type for variant combinations
type Combination = {
  id: string;
  availableForSale: boolean;
  [key: string]: any; // Allow for dynamic option keys
};

const variantOptionSelectorVariants = cva("flex items-center gap-4", {
  variants: {
    variant: {
      card: "rounded-lg bg-card py-2 px-3 justify-between",
      condensed: "justify-start",
    },
  },
  defaultVariants: {
    variant: "card",
  },
});

interface VariantOptionSelectorProps
  extends VariantProps<typeof variantOptionSelectorVariants> {
  option: ProductOption;
  product: Product;
}

export function VariantOptionSelector({
  option,
  variant,
  product,
}: VariantOptionSelectorProps) {
  const { variants } = product;
  const searchParams = useSearchParams();
  const optionNameLowerCase = option.name.toLowerCase();

  const [selectedValue, setSelectedValue] = useQueryState(
    optionNameLowerCase,
    parseAsString.withDefault(
      searchParams.get(optionNameLowerCase) || ''
    )
  );

  // The values for an option are stored in a JSON field.
  const optionValues = useMemo(() => {
    try {
      const values = option.values as string[];
      return Array.isArray(values) ? values : [];
    } catch (e) {
      return [];
    }
  }, [option.values]);

  const combinations: Combination[] = useMemo(() => variants.map((variant) => {
    const selectedOptions = variant.selectedOptions as {name: string, value: string}[];
    return {
      id: variant.id,
      availableForSale: variant.availableForSale,
      ...selectedOptions.reduce(
        (accumulator, option) => ({
          ...accumulator,
          [option.name.toLowerCase()]: option.value,
        }),
        {}
      ),
    };
  }), [variants]);

  return (
    <dl className={variantOptionSelectorVariants({ variant })}>
      <dt className="text-base font-semibold">{option.name}</dt>
      <dd className="flex flex-wrap gap-2">
        {optionValues.map((value) => {
          const isActive = selectedValue === value;
          const isColorOption = optionNameLowerCase === "color";

          // Simplified availability check - in a real app, you'd check combinations
          const isAvailableForSale = true; 

          if (isColorOption) {
            const color = getColorHex(value);
            return (
              <ColorSwatch
                key={value}
                color={ Array.isArray(color) ? [{ name: value, value: color[0] }, { name: value, value: color[1] }] : { name: value, value: color } }
                isSelected={isActive}
                onColorChange={() => setSelectedValue(value)}
                size={variant === "condensed" ? "sm" : "md"}
                atLeastOneColorSelected={!!selectedValue}
              />
            );
          }

          return (
            <Button
              onClick={() => startTransition(() => {setSelectedValue(value)})}
              key={value}
              variant={isActive ? "default" : "outline"}
              size="sm"
              disabled={!isAvailableForSale}
              title={`${option.name} ${value}${!isAvailableForSale ? " (Out of Stock)" : ""}`}
              className="min-w-[48px]"
            >
              {value}
            </Button>
          );
        })}
      </dd>
    </dl>
  );
}

export const useSelectedVariant = (product: Product): ProductVariant | undefined => {
  const { variants, options } = product;
  const searchParams = useSearchParams();

  const selectedOptionsFromUrl: Record<string, string> = {};
  options.forEach((option) => {
    const key = option.name.toLowerCase();
    const value = searchParams.get(key);
    if (value) {
      selectedOptionsFromUrl[key] = value;
    }
  });

  return variants.find((variant) => {
    const variantOptions = variant.selectedOptions as { name: string; value: string }[];
    return variantOptions.every(
      (option) => selectedOptionsFromUrl[option.name.toLowerCase()] === option.value
    );
  });
};

export const useProductImages = (
  product: Product,
  variant?: ProductVariant,
): ProductImage[] => {
  const selectedVariant = useSelectedVariant(product);
  const variantImages = (variant || selectedVariant)?.images;
  const productImages = product.images || [];

  const allImages = useMemo(() => {
    const images =
      variantImages && variantImages.length > 0
        ? variantImages
        : productImages;
    if (
      product.featuredImage &&
      !images.some((img) => img.url === product.featuredImage)
    ) {
        const featuredImageObject: ProductImage = {
            id: 'featured',
            url: product.featuredImage,
            altText: product.title,
            height: 1000, // default
            width: 1000, // default
            productId: product.id,
            productVariantId: null,
        }
      return [featuredImageObject, ...images];
    }
    return images.length > 0
      ? images
      : product.featuredImage
      ? [{
            id: 'featured',
            url: product.featuredImage,
            altText: product.title,
            height: 1000,
            width: 1000,
            productId: product.id,
            productVariantId: null,
        }]
      : [];
  }, [variantImages, productImages, product.featuredImage, product.title, product.id]);

  return allImages;
};