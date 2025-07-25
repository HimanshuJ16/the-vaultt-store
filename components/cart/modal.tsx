"use client";

import { ArrowRight, PlusCircleIcon, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { UpdateType, useCart } from "./cart-context";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { CartItemCard } from "./cart-item";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import React from "react";
import { Loader } from "../ui/loader";

const CartItems = ({ closeCart }: { closeCart: () => void }) => {
  const { cart } = useCart();

  if (!cart) return null;

  return (
    <div className="flex h-full flex-col justify-between overflow-hidden">
      <div className="flex justify-between text-sm text-muted-foreground px-2">
        <span>Products</span>
        <span>{cart.lines.length} {cart.lines.length === 1 ? "item" : "items"}</span>
      </div>
      <div className="grow overflow-auto py-4 space-y-3">
        <AnimatePresence>
          {cart.lines
            .sort((a, b) => a.merchandise.product.title.localeCompare(b.merchandise.product.title))
            .map((item, i) => (
              <motion.div
                key={item.id} // Use item.id as key for stability
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: i * 0.05, ease: "easeOut" }}
              >
                <CartItemCard item={item} onCloseCart={closeCart} />
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
      <div className="py-4 text-sm text-neutral-500 dark:text-neutral-400">
        <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
          <p>Shipping</p>
          <p className="text-right">Free</p>
        </div>
        <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
          <p>Total</p>
          <p className="text-right text-base text-black dark:text-white">
            ₹{Number(cart.cost.totalAmount.amount).toFixed(2)}
          </p>
        </div>
      </div>
      <CheckoutButton closeCart={closeCart} />
    </div>
  );
};

export default function CartModal() {
  const { cart, isLoading } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const lastCartQuantity = React.useRef(cart?.totalQuantity);

  // Automatically open the cart when an item is added, but not on initial load.
  useEffect(() => {
    if (!isLoading && cart?.totalQuantity !== undefined && lastCartQuantity.current !== undefined) {
      if (cart.totalQuantity > lastCartQuantity.current) {
        setIsOpen(true);
      }
    }
    lastCartQuantity.current = cart?.totalQuantity;
  }, [cart?.totalQuantity, isLoading]);

  // Close cart on navigation to checkout page.
  useEffect(() => {
    if (pathname === "/checkout") {
      setIsOpen(false);
    }
  }, [pathname]);

  const renderCartContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader size="lg" />
        </div>
      );
    }

    if (!cart || cart.lines.length === 0) {
      return (
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full flex"
          >
            <Link
              href="/"
              className="bg-background rounded-lg p-2 border border-dashed border-border w-full"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex flex-row gap-6">
                <div className="relative size-20 overflow-hidden rounded-sm shrink-0 border border-dashed border-border flex items-center justify-center">
                  <PlusCircleIcon className="size-6 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-2 2xl:gap-3 flex-1 justify-center">
                  <span className="text-lg 2xl:text-xl font-semibold">Cart is empty</span>
                  <p className="text-sm text-muted-foreground hover:underline">Start shopping to get started</p>
                </div>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>
      );
    }
    return <CartItems closeCart={() => setIsOpen(false)} />;
  };

  return (
    <>
      <Button
        aria-label="Open cart"
        onClick={() => setIsOpen(true)}
        className="uppercase"
        size="sm"
      >
        <span className="max-md:hidden">cart</span>&nbsp;({isLoading ? '...' : cart?.totalQuantity || 0})
      </Button>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
              className="fixed top-0 bottom-0 right-0 flex w-full max-w-lg flex-col bg-muted z-50 shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b">
                  <p className="text-2xl font-semibold">Cart</p>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Close cart"
                    onClick={() => setIsOpen(false)}
                  >
                    <X size={20} />
                  </Button>
              </div>
              <div className="flex-grow p-4 overflow-y-auto">
                {renderCartContent()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function CheckoutButton({ closeCart }: { closeCart: () => void }) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    const destination = isSignedIn ? "/checkout" : "/sign-in";
    startTransition(() => {
      closeCart();
      router.push(destination);
    });
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      size="lg"
      className="w-full relative flex items-center justify-center gap-3"
    >
      {isPending ? <Loader /> : <><span>Proceed to Checkout</span><ArrowRight className="size-5" /></>}
    </Button>
  );
}
