"use client";

import { Collection } from "@/lib/sfcc/types"; // Updated import
import { useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  collections: Collection[];
  className?: string;
}

export function CategoryFilter({
  collections,
  className,
}: CategoryFilterProps) {
  const params = useParams<{ collection: string }>();

  return (
    <div className={cn("bg-muted rounded-lg py-4 px-3", className)}>
      <h3 className="font-semibold mb-4">Categories</h3>
      <ul className="flex flex-col gap-1">
        {collections.map((cat) => {
          const isSelected = params.collection === cat.handle;
          return (
            <li key={cat.handle}>
              <Link
                className={cn(
                  "text-left w-full font-sm cursor-pointer transition-all transform hover:translate-x-1",
                  isSelected ? "font-medium translate-x-1" : ""
                )}
                href={`/shop/${cat.handle}`}
                aria-pressed={isSelected}
                aria-label={`Filter by category: ${cat.title}`}
                prefetch
              >
                {cat.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
