import { VariantOptionSelector } from "@/components/products/variant-selector";
import { Product } from "@/lib/sfcc/types";
import { useMemo } from "react";

export function VariantSelectorSlots({ product }: { product: Product }) {
  const { options } = product;

  // Memoize the check for options to avoid re-computation
  const hasMeaningfulOptions = useMemo(() => {
    if (!options || options.length === 0) {
      return false;
    }
    // Check if there's at least one option with values
    return options.some(option => {
        try {
            const values = option.values as { id: string, name: string }[] | string[];
            return Array.isArray(values) && values.length > 0;
        } catch {
            return false;
        }
    });
  }, [options]);

  if (!hasMeaningfulOptions) {
    return null;
  }

  return (
    <>
      {options.map((option) => (
        <VariantOptionSelector
          key={option.id}
          option={option}
          product={product}
          variant="card"
        />
      ))}
    </>
  );
}