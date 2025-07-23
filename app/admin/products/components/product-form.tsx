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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collection, Product } from "@/lib/sfcc/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChangeEvent, useState, useTransition } from "react";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  handle: z.string().min(1, "Handle is required"),
  description: z.string().min(1, "Description is required").max(700, "Description should not be more than 700 characters"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  collectionId: z.string().optional(),
  category: z.string().optional(),
  sizes: z.array(z.string()).optional(),
  availableForSale: z.boolean().default(true),
});

interface ProductFormProps {
  product?: Product;
  collections: Collection[];
}

const boySizes = ['40', '41', '42', '43', '44', '45'];
const girlSizes = ['36', '37', '38', '39', '40'];

export function ProductForm({ product, collections }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(product?.images.map(i => i.url) || []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: product?.title || "",
      handle: product?.handle || "",
      description: product?.description || "",
      price: product?.price || 0,
      collectionId: product?.collectionId || "",
      category: product?.category || "",
      sizes: product?.variants.map(v => v.size).filter(Boolean) as string[] || [],
      availableForSale: product?.availableForSale ?? true,
    },
  });

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);

      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      try {
        let imageUrls = product?.images.map(i => i.url) || [];

        if (files.length > 0) {
          const formData = new FormData();
          files.forEach(file => formData.append('files', file));

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            throw new Error('Image upload failed');
          }

          const uploadData = await uploadResponse.json();
          imageUrls = [...imageUrls, ...uploadData.urls];
        }

        const method = product ? 'PUT' : 'POST';
        const response = await fetch('/api/admin/products', {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...values, images: imageUrls, id: product?.id }),
        });

        if (!response.ok) {
          throw new Error(`Failed to ${product ? 'update' : 'create'} product`);
        }

        toast.success(`Product ${product ? 'updated' : 'created'} successfully!`);
        router.push('/admin/products');
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "An error occurred.");
      }
    });
  };

  const category = form.watch("category");

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
                <Input placeholder="Product title" {...field} />
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
                <Input placeholder="product-handle" {...field} />
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
                <Textarea placeholder="Product description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" placeholder="99.99" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="collectionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Collection</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a collection" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {collections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Boys">Boys</SelectItem>
                  <SelectItem value="Girls">Girls</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {category === 'Boys' && (
          <FormField
            control={form.control}
            name="sizes"
            render={() => (
              <FormItem>
                <FormLabel>Sizes (EUR)</FormLabel>
                <div className="grid grid-cols-3 gap-2">
                  {boySizes.map(size => (
                    <FormField
                      key={size}
                      control={form.control}
                      name="sizes"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                           <FormControl>
                            <Checkbox
                              checked={field.value?.includes(size)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), size])
                                  : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== size
                                    )
                                  )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{size}</FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {category === 'Girls' && (
          <FormField
            control={form.control}
            name="sizes"
            render={() => (
              <FormItem>
                <FormLabel>Sizes (EUR)</FormLabel>
                <div className="grid grid-cols-3 gap-2">
                  {girlSizes.map(size => (
                     <FormField
                      key={size}
                      control={form.control}
                      name="sizes"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                           <FormControl>
                            <Checkbox
                              checked={field.value?.includes(size)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), size])
                                  : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== size
                                    )
                                  )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{size}</FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormItem>
          <FormLabel>Images</FormLabel>
          <FormControl>
            <Input type="file" multiple onChange={handleImageChange} />
          </FormControl>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative aspect-square">
                <Image src={preview} alt="Product preview" layout="fill" className="rounded-md object-cover" />
              </div>
            ))}
          </div>
          <FormMessage />
        </FormItem>
        <Button type="submit" disabled={isPending}>
          {isPending ? (product ? 'Updating...' : 'Creating...') : (product ? 'Update Product' : 'Create Product')}
        </Button>
      </form>
    </Form>
  );
}