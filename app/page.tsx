import { HomeSidebar } from "@/components/layout/sidebar/home-sidebar";
import { PageLayout } from "@/components/layout/page-layout";
import { LatestProductCard } from "@/components/products/latest-product-card";
import { Badge } from "@/components/ui/badge";
import { getCollectionProducts, getCollections } from "@/lib/sfcc";
import { getLabelPosition } from "@/lib/utils";

export default async function Home() {
  const [featuredProducts, collections] = await Promise.all([
    getCollectionProducts({ collection: "top-seller" }),
    getCollections(),
  ]);

  const [lastProduct, ...restProducts] = featuredProducts;

  return (
    <PageLayout>
      <div className="contents md:grid md:grid-cols-12 md:gap-sides">
        <HomeSidebar collections={collections} />
        <div className="col-span-8 flex flex-col md:grid grid-cols-2 w-full relative">
          <div className="fixed top-0 left-0 w-full base-grid py-sides pointer-events-none z-10">
            <div className="col-start-5 col-span-8">
              <div className="px-6 hidden lg:block">
                <Badge variant="outline-secondary">latest drop</Badge>
              </div>
            </div>
          </div>
          {featuredProducts.length > 0 && (
            <>
              <LatestProductCard
                className="col-span-2"
                product={lastProduct}
                principal
              />
              {restProducts.map((product, index) => (
                <LatestProductCard
                  className="col-span-1"
                  key={product.id}
                  product={product}
                  labelPosition={getLabelPosition(index)}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
