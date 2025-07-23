"use client";

import { useQueryState, parseAsArrayOf, parseAsString } from "nuqs";
import { Product } from "@/lib/sfcc/types"; // Updated import
import { Color } from "@/components/ui/color-picker";
import { COLOR_MAP } from "@/lib/constants";
import { useEffect, useMemo } from "react";

const allColors: Color[] = Object.entries(COLOR_MAP).map(([name, value]) => ({ name, value }));

const getColorName = (color: Color | [Color, Color]) => {
  if (Array.isArray(color)) {
    const [color1, color2] = color;
    return `${color1.name}/${color2.name}`;
  }
  return color.name;
};

export function useAvailableColors(products: Product[]) {
  const [color, setColor] = useQueryState(
    "fcolor",
    parseAsArrayOf(parseAsString).withDefault([])
  );

  const availableColorNames = useMemo(() => {
    const colorNames = new Set<string>();
    products.forEach((product) => {
      const colorOption = product.options.find(
        (option) => option.name.toLowerCase() === "color"
      );

      if (colorOption && Array.isArray(colorOption.values)) {
        const values = colorOption.values as { id: string, name: string }[];
        values.forEach((value) => {
          const matchingColor = allColors.find(
            (c) => c.name.toLowerCase() === value.name.toLowerCase()
          );
          if (matchingColor) {
            colorNames.add(matchingColor.name);
          }
        });
      }
    });
    return colorNames;
  }, [products]);

  const availableColors = useMemo(() => allColors.filter((c) =>
    availableColorNames.has(c.name)
  ), [availableColorNames]);

  useEffect(() => {
    if (color.length > 0) {
      const validColors = color.filter((colorName) =>
        availableColorNames.has(colorName)
      );
      if (validColors.length !== color.length) {
        setColor(validColors);
      }
    }
  }, [products, color, setColor, availableColorNames]);

  const toggleColor = (colorInput: Color | [Color, Color]) => {
    const colorName = getColorName(colorInput);
    setColor(
      color.includes(colorName)
        ? color.filter((c) => c !== colorName)
        : [...color, colorName]
    );
  };

  const selectedColors = availableColors.filter((c) => color.includes(c.name));

  return {
    availableColors,
    selectedColors,
    toggleColor,
    activeColorFilters: color,
  };
}
