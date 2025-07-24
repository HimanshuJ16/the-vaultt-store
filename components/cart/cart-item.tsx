"use client";

import { CartItem } from "@/lib/sfcc/types";
import { createUrl, getColorHex } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { DeleteItemButton } from "./delete-item-button";
import { EditItemQuantityButton } from "./edit-item-quantity-button";
import { UpdateType } from "./cart-context";
import { ColorSwatch } from "@/components/ui/color-picker";
import { useProductImages } from "../products/variant-selector";

interface CartItemProps {
  item: CartItem;
  optimisticUpdate: (lineId: string, updateType: UpdateType) => void;
  onCloseCart: () => void;
}

export function CartItemCard({
  item,
  optimisticUpdate,
  onCloseCart,
}: CartItemProps) {
  const merchandiseSearchParams = new URLSearchParams();
  const { merchandise } = item;
  
  // The selectedOptions are on the merchandise object
  if (merchandise.selectedOptions) {
    merchandise.selectedOptions.forEach(({ name, value }) => {
      merchandiseSearchParams.set(name.toLowerCase(), value.toLowerCase());
    });
  }

  const merchandiseUrl = createUrl(
    `/product/${merchandise.product.handle}`,
    merchandiseSearchParams
  );

  const colorOption = merchandise.selectedOptions.find(
    (option) => option.name.toLowerCase() === "color"
  );

  const sizeOption = merchandise.selectedOptions.find(
    (option) => option.name.toLowerCase() === "size"
  );

  const imgs = useProductImages(merchandise.product, merchandise as any);
  const renderImage = imgs[0] || (merchandise.product.featuredImage as any);

  return (
    <div className="bg-card rounded-lg p-2">
      <div className="flex flex-row gap-6">
        <div className="relative size-[120px] overflow-hidden rounded-sm shrink-0">
          {renderImage && (
            <Image
              className="size-full object-cover"
              width={240}
              height={240}
              alt={renderImage.altText || merchandise.product.title}
              src={renderImage.url}
            />
          )}
          {colorOption && (
            <div className="flex absolute bottom-1 left-1">
              <ColorSwatch
                color={(() => {
                  const color = getColorHex(colorOption.value);
                  return Array.isArray(color)
                    ? [{ name: colorOption.value, value: color[0] }, { name: colorOption.value, value: color[1] }]
                    : { name: colorOption.value, value: color };
                })()}
                isSelected={false}
                onColorChange={() => {}}
                size="sm"
                atLeastOneColorSelected={false}
              />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 2xl:gap-3 flex-1">
          <Link
            href={merchandiseUrl}
            onClick={onCloseCart}
            className="z-30 flex flex-col justify-center"
            prefetch
          >
            <span className="2xl:text-lg font-semibold">
              {merchandise.product.title}
            </span>
            {sizeOption && <span className="text-sm text-muted-foreground">Size: {sizeOption.value}</span>}
          </Link>
          <p className="2xl:text-lg font-semibold">
            ₹{Number(item.cost.totalAmount.amount).toFixed(2)}
          </p>
          <div className="flex justify-between items-end mt-auto">
            <div className="flex h-8 flex-row items-center rounded-md border border-neutral-200 dark:border-neutral-700">
              <EditItemQuantityButton item={item} type="minus" optimisticUpdate={optimisticUpdate} />
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <EditItemQuantityButton item={item} type="plus" optimisticUpdate={optimisticUpdate} />
            </div>
            <DeleteItemButton item={item} optimisticUpdate={optimisticUpdate} />
          </div>
        </div>
      </div>
    </div>
  );
}