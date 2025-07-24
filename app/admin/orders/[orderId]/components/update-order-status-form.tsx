"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Order } from "@/lib/sfcc/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChangeEvent, useState, useTransition } from "react";
import Image from "next/image";
import { X } from "lucide-react";

const formSchema = z.object({
  status: z.enum(["PROCESSING", "SHIPPED", "DELIVERED"]),
  trackingId: z.string().optional(),
});

interface UpdateOrderStatusFormProps {
  order: Order;
}

export function UpdateOrderStatusForm({ order }: UpdateOrderStatusFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    order.parcelImage || null
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: order.status as "PROCESSING" | "SHIPPED" | "DELIVERED",
      trackingId: order.trackingId || "",
    },
  });

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      try {
        let imageUrl = order.parcelImage;

        if (imageFile) {
          const formData = new FormData();
          formData.append("files", imageFile);
          formData.append("folder", "parcel-images"); // Specify the folder for parcel images

          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!uploadResponse.ok) {
            throw new Error("Image upload failed");
          }

          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.urls[0];
        }

        const response = await fetch(`/api/admin/orders/${order.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, parcelImage: imageUrl }),
        });

        if (!response.ok) {
          throw new Error("Failed to update order status");
        }

        toast.success("Order status updated successfully!");
        router.push("/admin/orders");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "An error occurred."
        );
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="trackingId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tracking ID</FormLabel>
              <FormControl>
                <Input placeholder="Enter tracking ID" {...field} />
              </FormControl>
              <FormDescription>
                Add the tracking ID for the shipment.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Parcel Image</FormLabel>
          <FormControl>
            <Input type="file" onChange={handleImageChange} accept="image/*" />
          </FormControl>
          {previewUrl && (
            <div className="relative mt-4 w-32 h-32">
              <Image
                src={previewUrl}
                alt="Parcel preview"
                layout="fill"
                className="rounded-md object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                aria-label="Remove image"
              >
                <X size={16} />
              </button>
            </div>
          )}
          <FormMessage />
        </FormItem>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Updating..." : "Update Status"}
        </Button>
      </form>
    </Form>
  );
}
