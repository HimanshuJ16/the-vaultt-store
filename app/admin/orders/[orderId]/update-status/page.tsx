import { getOrderById } from "@/lib/sfcc";
import { UpdateOrderStatusForm } from "../components/update-order-status-form";

interface UpdateOrderStatusPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function UpdateOrderStatusPage({
  params,
}: UpdateOrderStatusPageProps) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);

  if (!order) {
    return <div>Order not found</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Update Order Status</h1>
      <UpdateOrderStatusForm order={order} />
    </div>
  );
}