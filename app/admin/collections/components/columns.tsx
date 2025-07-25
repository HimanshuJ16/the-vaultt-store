"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { MoreHorizontal } from "lucide-react"
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
import { Collection } from "@/lib/sfcc/types"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

export const columns: ColumnDef<Collection>[] = [
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
    accessorKey: "handle",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Handle" />
    ),
  },
  {
    accessorKey: "productsCount",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Products" />
    ),
    cell: ({ row }) => {
        return <div className="text-center">{row.original.productsCount}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const collection = row.original
      const router = useRouter()
      const [isPending, startTransition] = useTransition()

      const handleDelete = () => {
        startTransition(async () => {
          try {
            const response = await fetch(`/api/admin/collections/${collection.handle}`, {
              method: "DELETE",
            })

            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.error || "Failed to delete the collection.")
            }

            toast.success("Collection deleted successfully!")
            router.refresh()
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "An error occurred.")
          }
        })
      }

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
              onClick={() => navigator.clipboard.writeText(collection.id)}
            >
              Copy collection ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/admin/collections/${collection.handle}`}>Edit collection</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? 'Deleting...' : 'Delete collection'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]