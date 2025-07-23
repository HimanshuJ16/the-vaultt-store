"use client";

import MobileMenu from "./mobile-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogoSvg } from "./logo-svg";
import CartModal from "@/components/cart/modal";
import { NavItem } from "@/lib/types";
import { Collection } from "@/lib/sfcc/types";
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import Image from "next/image";

export const navItems: NavItem[] = [
  {
    label: "home",
    href: "/",
  },
  {
    label: "featured",
    href: "/shop/top-seller",
  },
  {
    label: "shop all",
    href: "/shop",
  },
];

interface HeaderProps {
  collections: Collection[];
}

export function Header({ collections }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 w-full p-sides grid grid-cols-3 md:grid-cols-12 md:gap-sides z-50 items-start">
      <div className="block flex-none md:hidden">
        <MobileMenu collections={collections} />
      </div>
      <Link href="/" className="md:col-span-2" prefetch>
        {/* <LogoSvg className="h-6 w-auto max-md:place-self-center md:size-full md:max-w-[400px]" /> */}
        <Image
          src="/logo1.png"
          alt="Logo"
          width={400}
          height={100}
          className="h-6 w-auto max-md:place-self-center md:size-full md:max-w-[400px]"
        />
      </Link>
      <nav className="flex items-center md:col-span-10 justify-end gap-2">
        <ul className="items-center gap-5 py-0.5 px-3 bg-background/10 rounded-sm backdrop-blur-md hidden md:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "font-semibold text-base transition-colors duration-200 uppercase",
                  pathname === item.href
                    ? "text-foreground"
                    : "text-foreground/50"
                )}
                prefetch
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center">
            <SignedIn>
                <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
                <SignInButton mode="modal">
                    <button className="font-semibold text-base uppercase text-foreground transition-colors gap-3 bg-background/10 rounded-sm backdrop-blur-md py-1 px-2">
                        Sign In
                    </button>
                </SignInButton>
            </SignedOut>
        </div>
        <CartModal />
      </nav>
    </header>
  );
}