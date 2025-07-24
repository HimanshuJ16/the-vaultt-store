import ProductList from "./components/product-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop | The Vaultt Store",
  description: "Explore all products available at the Vaultt Store.",
};

export default async function Shop() {
  // ProductList will now fetch all products when no collection handle is provided
  return <ProductList collection={""} />;
}