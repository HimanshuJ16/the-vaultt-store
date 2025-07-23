"use client";

import { useQueryState, parseAsArrayOf, parseAsString } from "nuqs";
import { useParams } from "next/navigation";

export function useFilterCount() {
  const params = useParams<{ collection: string }>();
  const [color] = useQueryState(
    "fcolor",
    parseAsArrayOf(parseAsString).withDefault([])
  );

  let count = 0;

  if (color.length > 0) {
    count += color.length;
  }

  if (params.collection) {
    count += 1;
  }

  return count;
}
