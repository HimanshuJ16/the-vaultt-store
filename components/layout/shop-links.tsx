import Link from "next/link";
import { Collection } from "@/lib/sfcc/types";

interface ShopLinksProps {
  collections: Collection[];
  align?: "left" | "right";
  label?: string;
}

export function ShopLinks({
  collections,
  label = "Shop",
  align = "left",
}: ShopLinksProps) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <h4 className="font-extrabold text-lg md:text-xl">{label}</h4>

      <ul className="flex flex-col gap-1.5 leading-5 mt-5">
        {collections.map((item) => (
          <li key={item.handle}>
            <Link href={`/shop/${item.handle}`} prefetch>{item.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
