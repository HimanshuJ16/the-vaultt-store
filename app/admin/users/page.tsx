import { getUsers } from "@/lib/sfcc";
import { PageLayout } from "@/components/layout/page-layout";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <PageLayout>
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Users</h1>
        </div>
        <DataTable columns={columns} data={users} />
    </PageLayout>
  );
}