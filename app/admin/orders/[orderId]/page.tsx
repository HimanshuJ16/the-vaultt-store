import { getOrderDetails } from "@/lib/sfcc";
import { PageLayout } from "@/components/layout/page-layout";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";

export default async function OrderDetailPage({
  params,
}: {
  params: { orderId: string };
}) {
  const order = await getOrderDetails(params.orderId);

  if (!order) {
    return notFound();
  }

  return (
    <PageLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Order Details</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Order ID:</strong> {order.orderNumber}</p>
            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Total:</strong> ₹{order.totalAmount.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Tracking ID:</strong> {order.trackingId || 'N/A'}</p>
            <p><strong>Parcel Image:</strong> 
              {order.parcelImage ? 
                <Image src={order.parcelImage} alt="Parcel Image" width={200} height={200} /> 
                : 
                ' N/A'
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Name:</strong> {order.user?.fullName}</p>
            <p><strong>Email:</strong> {order.customerEmail}</p>
            <p><strong>Contact:</strong> {order.contactNumber || 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Address:</strong> {order.shippingAddress}</p>
            <p><strong>Method:</strong> {order.shippingMethod}</p>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      <Card>
        <CardHeader>
          <CardTitle>Products in this Order</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product.title}</TableCell>
                  <TableCell>{item.productVariant?.title || 'N/A'}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell className="text-right">₹{item.totalAmount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageLayout>
  );
}