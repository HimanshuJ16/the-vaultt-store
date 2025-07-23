"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Collection } from "@/lib/sfcc/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTransition } from "react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  handle: z.string().min(1, "Handle is required"),
  description: z.string().min(1, "Description is required"),
});

interface CollectionFormProps {
  collection?: Collection;
}

export function CollectionForm({ collection }: CollectionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: collection?.title || "",
      handle: collection?.handle || "",
      description: collection?.description || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      try {
        const method = collection ? 'PUT' : 'POST';
        const response = await fetch('/api/admin/collections', {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...values, id: collection?.id }),
        });

        if (!response.ok) {
          throw new Error(`Failed to ${collection ? 'update' : 'create'} collection`);
        }

        toast.success(`Collection ${collection ? 'updated' : 'created'} successfully!`);
        router.push('/admin/collections');
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "An error occurred.");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Collection title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="handle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Handle</FormLabel>
              <FormControl>
                <Input placeholder="collection-handle" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Collection description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? (collection ? 'Updating...' : 'Creating...') : (collection ? 'Update Collection' : 'Create Collection')}
        </Button>
      </form>
    </Form>
  );
}