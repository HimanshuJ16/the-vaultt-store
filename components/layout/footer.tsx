import { ShopLinks } from "./shop-links"
import { SidebarLinks } from "./sidebar/product-sidebar-links"
import { getCollections } from "@/lib/sfcc"
import Image from "next/image"
import Link from "next/link"

const navigation = {
  shop: [
    { name: "All Products", href: "/shop" },
    { name: "New Arrivals", href: "/shop?sort=newest" },
    { name: "Best Sellers", href: "/shop/top-seller" },
  ],
  customerService: [
    { name: "Contact Us", href: "/contact" },
    { name: "Shipping Info", href: "/shop" },
    // { name: "Size Guide", href: "/size-guide" },
    { name: "FAQ", href: "/shop" },
  ],
  legal: [
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Cancellation & Refund", href: "/cancellation-refund" },
    // { name: "Returns Policy", href: "/returns" },
  ],
}

export async function Footer() {
  const collections = await getCollections()

  return (
    <footer className="p-sides">
      <div className="w-full h-auto p-11 text-background bg-foreground rounded-[12px] flex flex-col justify-between">
        <div className="flex justify-between items-start flex-wrap gap-8">
          <div className="flex flex-col space-y-4">
            <Image
              src="/logo1.png"
              alt="Company Logo"
              width={500}
              height={50}
              className="h-auto w-full max-w-[300px] object-contain filter invert"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 max-w-2xl">
            <div>
              <h3 className="font-semibold mb-4">Shop</h3>
              <div className="flex flex-col space-y-2 text-sm">
              {navigation.shop.map((item) => (
                    <div key={item.name}>
                      <Link href={item.href} className="text-muted-foreground hover:text-background transition-colors">
                        {item.name}
                      </Link>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Customer Service</h3>
              <div className="flex flex-col space-y-2 text-sm">
              {navigation.customerService.map((item) => (
                    <div key={item.name}>
                      <Link href={item.href} className="text-muted-foreground hover:text-background transition-colors">
                        {item.name}
                      </Link>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <div className="flex flex-col space-y-2 text-sm">
              {navigation.legal.map((item) => (
                    <div key={item.name}>
                      <Link href={item.href} className="text-muted-foreground hover:text-background transition-colors">
                        {item.name}
                      </Link>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-muted-foreground/20 mt-8 pt-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <SidebarLinks className="max-w-[450px] w-full" size="base" invert />
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{new Date().getFullYear()}© — All rights reserved</p>
              <p className="text-xs text-muted-foreground mt-1">Made with ❤️ for our customers</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
