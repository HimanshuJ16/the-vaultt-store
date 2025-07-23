import { Suspense } from "react";
import ResultsControls from "./components/results-controls";

export default function ShopLoading() {
  return (
    <div>
      <Suspense>
        {/* Pass empty arrays as placeholders for loading state */}
        <ResultsControls collections={[]} products={[]} />
      </Suspense>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="aspect-square bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  );
}
