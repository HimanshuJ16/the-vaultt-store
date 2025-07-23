// File: commerce/app/product/[handle]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

import { getProduct } from "@/lib/sfcc"; 
import { HIDDEN_PRODUCT_TAG } from "@/lib/constants";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { AddToCart } from "@/components/cart/add-to-cart";
import Prose from "@/components/prose";
import { cn } from "@/lib/utils";
import { PageLayout } from "@/components/layout/page-layout";
import { VariantSelectorSlots } from "./components/variant-selector-slots";
import { MobileGallerySlider } from "./components/mobile-gallery-slider";
import { DesktopGallery } from "./components/desktop-gallery";

export async function generateMetadata({
  params,
}: {
  params: { handle: string };
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) return notFound();

  const { featuredImage, title, description, tags } = product;
  const indexable = !tags.includes(HIDDEN_PRODUCT_TAG);

  return {
    title: title,
    description: description,
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable,
      },
    },
    openGraph: featuredImage
      ? {
          images: [
            {
              url: featuredImage,
              width: 1200,
              height: 1200,
              alt: title,
            },
          ],
        }
      : null,
  };
}

export default async function ProductPage({
  params,
}: {
  params: { handle: string };
}) {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) return notFound();

  // The collection is now directly on the product object
  const collection = product.collection;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.featuredImage,
    offers: {
      "@type": "AggregateOffer",
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      priceCurrency: product.currencyCode,
      highPrice: product.price, // Simplified price
      lowPrice: product.price,  // Simplified price
    },
  };

  const hasVariants = product.variants.length > 0;

  return (
    <PageLayout className="bg-muted">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />

      <div className="flex flex-col md:grid md:grid-cols-12 md:gap-sides">
        {/* Mobile Gallery Slider */}
        <div className="md:hidden col-span-full h-[60vh] min-h-[400px]">
          <Suspense fallback={null}>
            <MobileGallerySlider product={product} />
          </Suspense>
        </div>

        <div className="col-span-5 flex flex-col 2xl:col-span-4 max-md:col-span-full md:h-screen max-md:p-sides md:pl-sides md:pt-top-spacing sticky top-0">
          <div className="col-span-full">
            <Breadcrumb className="col-span-full mb-3 md:mb-8">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/shop" prefetch>
                      Shop
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {collection && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href={`/shop/${collection.handle}`} prefetch>
                          {collection.title}
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </>
                )}
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{product.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col gap-4 mb-10">
              <div className="rounded bg-card py-2 px-3 md:gap-x-4 md:gap-y-10 place-items-baseline max-md:mt-2">
                <h1 className="text-lg lg:text-xl 2xl:text-2xl font-semibold text-balance max-md:mb-4">
                  {product.title}
                </h1>
                <p className="text-lg lg:text-xl 2xl:text-2xl font-semibold max-md:mt-8 mt-6">
                  ${product.price.toFixed(2)}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Suspense fallback={null}>
                  <VariantSelectorSlots product={product} />
                </Suspense>

                <Suspense fallback={null}>
                  <AddToCart
                    product={product}
                    size="lg"
                    className={cn("w-full", {
                      "col-span-full": !hasVariants,
                    })}
                  />
                </Suspense>
              </div>
            </div>
          </div>

          <Prose
            className="col-span-full opacity-70 mb-auto max-md:order-3 max-md:mt-1"
            html={product.descriptionHtml}
          />
        </div>

        {/* Desktop Gallery */}
        <div className="hidden md:block col-start-6 col-span-7 w-full overflow-y-auto relative">
          <Suspense fallback={null}>
            <DesktopGallery product={product} />
          </Suspense>
        </div>
      </div>
    </PageLayout>
  );
}