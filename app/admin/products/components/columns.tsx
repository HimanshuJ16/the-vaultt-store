"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/app/admin/components/data-table-column-header"
import { Product } from "@/lib/sfcc/types" // Assuming your types are here
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { startTransition } from "react"

export const columns: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
  },
  {
    accessorKey: "collections",
    header: "Collections",
    cell: ({ row }) => {
        const collections = row.original.collections;
        return collections.map(c => c.title).join(', ') || "N/A";
    }
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
       <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)

      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "availableForSale",
    header: "Status",
    cell: ({ row }) => {
        const isAvailable = row.getValue("availableForSale");
        return isAvailable ? "In Stock" : "Out of Stock";
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(product.id)}
            >
              Copy product ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href={`/admin/products/${product.handle}`}>Edit product</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(product.handle)}>
                Delete product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]