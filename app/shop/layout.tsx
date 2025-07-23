import { DesktopFilters } from "./components/shop-filters";
import { Suspense } from "react";
import { getCollections } from "@/lib/sfcc"; // Updated import
import { PageLayout } from "@/components/layout/page-layout";
import { MobileFilters } from "./components/mobile-filters";
import { ProductsProvider } from "./providers/products-provider";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const collections = await getCollections();

  return (
    <PageLayout>
      <ProductsProvider>
        <div className="flex flex-col md:grid grid-cols-12 md:gap-sides">
          <DesktopFilters
            collections={collections}
            className="col-span-3 max-md:hidden"
          />
          <Suspense fallback={null}>
            <MobileFilters collections={collections} />
          </Suspense>
          <div className="col-span-9 h-full md:pt-top-spacing">
            <Suspense fallback={null}>{children}</Suspense>
          </div>
        </div>
      </ProductsProvider>
    </PageLayout>
  );
}