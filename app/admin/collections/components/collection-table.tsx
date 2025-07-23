// File: commerce/app/admin/collections/components/collection-table.tsx

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Collection } from "@/lib/sfcc/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DeleteDialog } from "../../components/delete-dialog";

interface CollectionTableProps {
  collections: Collection[];
}

export function CollectionTable({ collections }: CollectionTableProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = (handle: string) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/collections/${handle}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to delete the collection."
          );
        }

        toast.success("Collection deleted successfully!");
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
            <TableHead>Collection</TableHead>
            <TableHead>Handle</TableHead>
            <TableHead>Products</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collections.map((collection) => (
            <TableRow key={collection.id}>
              <TableCell className="font-medium">{collection.title}</TableCell>
              <TableCell>{collection.handle}</TableCell>
              <TableCell>{collection._count?.products ?? 0}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/collections/${collection.handle}`}>
                    Edit
                  </Link>
                </Button>
                <DeleteDialog
                  itemType="collection"
                  itemName={collection.title}
                  onDelete={() => handleDelete(collection.handle)}
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
