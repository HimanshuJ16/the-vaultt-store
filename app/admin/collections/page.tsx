import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCollections } from "@/lib/sfcc";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminCollections() {
  const collections = await getCollections();

  return (
    <PageLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Collections</h1>
          <Button asChild>
            <Link href="/admin/collections/new">Add Collection</Link>
          </Button>
        </div>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Collection</TableHead>
                <TableHead>Handle</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections.map((collection) => (
                <TableRow key={collection.id}>
                  <TableCell className="font-medium">{collection.title}</TableCell>
                  <TableCell>{collection.handle}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/collections/${collection.handle}`}>Edit</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageLayout>
  );
}