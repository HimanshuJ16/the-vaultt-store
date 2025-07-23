import { cn } from "@/lib/utils";
import Image from "next/image";
import { FeaturedProductLabel } from "./featured-product-label";
import { Product } from "@/lib/sfcc/types"; // Updated import path
import Link from "next/link";

interface LatestProductCardProps {
  product: Product;
  principal?: boolean;
  className?: string;
  labelPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export function LatestProductCard({
  product,
  principal = false,
  className,
  labelPosition = "bottom-right",
}: LatestProductCardProps) {
  // Ensure featuredImage is an object with a URL, providing a fallback.
  const imageUrl = product.featuredImage || 'https://placehold.co/1000x1000?text=Image+Not+Found';
  const imageAlt = product.title;

  if (principal) {
    return (
      <div className={cn("h-fold flex flex-col relative", className)}>
        <Link
          href={`/product/${product.handle}`}
          className="size-full"
          prefetch
        >
          <Image
            priority
            src={imageUrl}
            alt={imageAlt}
            width={1000}
            height={600} // Adjusted for a more typical banner aspect ratio
            quality={100}
            className="object-cover size-full"
          />
        </Link>
        <div className="absolute bottom-0 left-0 grid w-full grid-cols-4 gap-6 pointer-events-none max-md:contents p-sides">
          <FeaturedProductLabel
            className="col-span-3 col-start-2 pointer-events-auto 2xl:col-start-3 2xl:col-span-2 shrink-0"
            product={product}
            principal
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Link
        href={`/product/${product.handle}`}
        className="block w-full aspect-square"
        prefetch
      >
        <Image
          src={imageUrl}
          alt={imageAlt}
          width={1000}
          height={1000} // Set to a 1:1 aspect ratio for a square card
          className="object-cover size-full"
        />
      </Link>

      <div
        className={cn(
          "absolute p-4",
          labelPosition === "top-left" && "left-0 top-0",
          labelPosition === "top-right" && "right-0 top-0",
          labelPosition === "bottom-left" && "left-0 bottom-0",
          labelPosition === "bottom-right" && "right-0 bottom-0"
        )}
      >
        <FeaturedProductLabel product={product} />
      </div>
    </div>
  );
}
