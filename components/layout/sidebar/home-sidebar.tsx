import { ShopLinks } from "../shop-links";
import { Collection } from "@/lib/sfcc/types";

interface HomeSidebarProps {
  collections: Collection[];
}

export function HomeSidebar({ collections }: HomeSidebarProps) {
  return (
    <aside className="max-md:hidden col-span-4 h-screen sticky top-0 p-sides pt-top-spacing flex flex-col justify-between">
      <div>
        <p className="italic tracking-tighter text-base">
          Styled. Laced. Never Basic.
        </p>
        <div className="mt-5 text-base leading-tight">
          <p>Your on-foot game speaks volumes.</p>
          <p>Classic silhouettes, remixed with attitude.</p>
          <p>Beyond the hype — style first, always.</p>
        </div>
      </div>
      <ShopLinks collections={collections} />
    </aside>
  );
}