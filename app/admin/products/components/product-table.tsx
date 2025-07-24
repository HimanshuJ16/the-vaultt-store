// commerce/app/admin/products/components/product-table.tsx

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product } from "@/lib/sfcc/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DeleteDialog } from "../../components/delete-dialog";

interface ProductTableProps {
  products: Product[];
}

export function ProductTable({ products }: ProductTableProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = (handle: string) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/products/${handle}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to delete the product."
          );
        }

        toast.success("Product deleted successfully!");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "An error occurred."
        );
      }
    });
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Collections</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Inventory</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.title}</TableCell>
              {/* This line is updated to handle the array of collections */}
              <TableCell>
                {product.collections.map((c) => c.title).join(", ") || "N/A"}
              </TableCell>
              <TableCell>₹{product.price.toFixed(2)}</TableCell>
              <TableCell>
                {product.availableForSale ? "In Stock" : "Out of Stock"}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/products/${product.handle}`}>Edit</Link>
                </Button>
                <DeleteDialog
                  itemType="product"
                  itemName={product.title}
                  onDelete={() => handleDelete(product.handle)}
                  isPending={isPending}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}