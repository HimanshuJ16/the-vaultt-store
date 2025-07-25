import { LogoSvg } from "./header/logo-svg";
import { ShopLinks } from "./shop-links";
import { SidebarLinks } from "./sidebar/product-sidebar-links";
import { getCollections } from "@/lib/sfcc";
import Image from "next/image";

export async function Footer() {
  const collections = await getCollections();

  return (
    <footer className="p-sides">
      <div className="w-full h-auto p-11 text-background bg-foreground rounded-[12px] flex flex-col justify-between">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <Image
            src="/logo1.png"
            alt="Company Logo"
            width={900}
            height={100}
            className="h-auto w-full max-w-[900px] object-contain md:w-[900px] max-md:mx-auto filter invert"
          />
          <ShopLinks collections={collections} align="left" />
        </div>
        <div className="flex justify-between items-end flex-wrap text-muted-foreground mt-8">
          <SidebarLinks className="max-w-[450px] w-full" size="base" invert />
          <p className="text-base">
            {new Date().getFullYear()}© — All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
