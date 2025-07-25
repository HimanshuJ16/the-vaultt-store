"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { navItems } from "./index";
import { SidebarLinks } from "../sidebar/product-sidebar-links";
import { ShopLinks } from "../shop-links";
import { Collection } from "@/lib/sfcc/types";

interface MobileMenuProps {
  collections: Collection[];
}

export default function MobileMenu({ collections }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const openMobileMenu = () => setIsOpen(true);
  const closeMobileMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  // Close menu when route changes
  useEffect(() => {
    closeMobileMenu();
  }, [pathname]);

  return (
    <>
      <Button
        onClick={openMobileMenu}
        aria-label="Open mobile menu"
        variant="secondary"
        size="sm"
        className="md:hidden uppercase"
      >
        Menu
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-0 bg-foreground/30 z-50"
              onClick={closeMobileMenu}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 bottom-0 left-0 flex w-full md:w-[400px] p-modal-sides z-50"
            >
              <div className="flex flex-col bg-muted p-3 md:p-4 rounded w-full">
                <div className="pl-2 flex items-baseline justify-between mb-10">
                  <p className="text-2xl font-semibold">Menu</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Close cart"
                    onClick={closeMobileMenu}
                  >
                    Close
                  </Button>
                </div>

                <nav className="grid grid-cols-2 gap-x-6 gap-y-4 mb-10">
                  {navItems.map((item) => (
                    <Button
                      key={item.href}
                      size="sm"
                      variant="secondary"
                      onClick={closeMobileMenu}
                      className="uppercase bg-background/50 justify-start"
                      asChild
                    >
                      <Link href={item.href} prefetch>{item.label}</Link>
                    </Button>
                  ))}
                </nav>

                <ShopLinks label="Categories" collections={collections} />

                <div className="mt-auto mb-6">
                  <p className="italic tracking-tighter text-base">
                    Refined. Minimal. Never boring.
                  </p>
                  <div className="mt-5 text-base leading-tight">
                    <p>Furniture that speaks softly, but stands out loud.</p>
                    <p>Clean lines, crafted with wit.</p>
                    <p>Elegance with a wink — style first</p>
                  </div>
                </div>
                <SidebarLinks className="gap-6 max-w-max" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
