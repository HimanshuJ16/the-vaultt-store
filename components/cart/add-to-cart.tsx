"use client";

import { PlusCircleIcon } from "lucide-react";
import { addItem } from "@/components/cart/actions";
import { Product, ProductVariant } from "@/lib/sfcc/types";
import { useActionState, useMemo } from "react";
import { useCart } from "./cart-context";
import { Button, ButtonProps } from "../ui/button";
import { useSelectedVariant } from "@/components/products/variant-selector";
import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "../ui/loader";
import { useAuth } from "@clerk/nextjs";

interface AddToCartProps extends ButtonProps {
  product: Product;
  iconOnly?: boolean;
  icon?: ReactNode;
}

export function AddToCart({
  product,
  className,
  iconOnly = false,
  icon = <PlusCircleIcon />,
  ...buttonProps
}: AddToCartProps) {
  const { variants, availableForSale } = product;
  const { addCartItem } = useCart();
  const [message, formAction, isLoading] = useActionState(addItem, null);
  const selectedVariant = useSelectedVariant(product);
  const { isSignedIn } = useAuth();

  const hasNoVariants = !variants || variants.length === 0;
  const selectedVariantId = hasNoVariants ? product.id : selectedVariant?.id;

  const resolvedVariant = useMemo(() => {
    if (hasNoVariants) {
      return {
        id: product.id,
        title: product.title,
        price: product.price,
        selectedOptions: [],
        availableForSale: product.availableForSale,
        productId: product.id,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        images: product.images,
        size: null,
        cartItems: [],
      };
    }
    return variants.find((variant) => variant.id === selectedVariantId);
  }, [hasNoVariants, product, variants, selectedVariantId]);

  const getButtonText = () => {
    if (!availableForSale) return "Out Of Stock";
    if (!resolvedVariant && !hasNoVariants) return "Select an option";
    return "Add To Cart";
  };

  const isDisabled = !availableForSale || (!resolvedVariant && !hasNoVariants) || isLoading;

  const addItemAction = formAction.bind(null, selectedVariantId);

  const handleAddToCart = async () => {
    if (resolvedVariant) {
      console.log("Adding item to cart:", { variantId: resolvedVariant.id, productTitle: product.title });
      addCartItem(resolvedVariant as ProductVariant, product);
      if (isSignedIn) {
        await addItemAction();
      }
    }
  };

  const getLoaderSize = () => {
    const buttonSize = buttonProps.size;
    if (buttonSize === "sm" || buttonSize === "icon-sm" || buttonSize === "icon") return "sm";
    if (buttonSize === "icon-lg") return "default";
    if (buttonSize === "lg") return "lg";
    return "default";
  };

  return (
    <form action={handleAddToCart} className={className}>
      <Button
        type="submit"
        aria-label={getButtonText()}
        disabled={isDisabled}
        className={iconOnly ? undefined : "w-full relative flex items-center justify-between"}
        {...buttonProps}
      >
        <AnimatePresence initial={false} mode="wait">
          {iconOnly ? (
            <motion.div
              key={isLoading ? "loading" : "icon"}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              {isLoading ? <Loader size={getLoaderSize()} /> : <span>{icon}</span>}
            </motion.div>
          ) : (
            <motion.div
              key={isLoading ? "loading" : getButtonText()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full flex items-center justify-center"
            >
              {isLoading ? (
                <Loader size={getLoaderSize()} />
              ) : (
                <div className="w-full flex items-center justify-between">
                  <span>{getButtonText()}</span>
                  <PlusCircleIcon />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
      <p aria-live="polite" className="sr-only" role="status">
        {message}
      </p>
    </form>
  );
}