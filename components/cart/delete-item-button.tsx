"use client";

import { removeItem } from "@/components/cart/actions";
import { CartItem } from "@/lib/sfcc/types";
import { useActionState, useTransition } from "react";
import { Button } from "../ui/button";
import { UpdateType, useCart } from "./cart-context";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { Loader } from "../ui/loader";

export function DeleteItemButton({ item }: { item: CartItem;}) {
  const { optimisticUpdate } = useCart();
  const [message, formAction] = useActionState<string | null, string>(removeItem, null);
  const [isPending, startTransition] = useTransition();
  const { isSignedIn } = useAuth();
  const lineId = item.id;

  const actionWithOptimisticUpdate = () => {
    optimisticUpdate(lineId, "delete");
    if (isSignedIn) {
        startTransition(() => {
            formAction(lineId);
        });
    }
  }

  return (
    <form action={actionWithOptimisticUpdate} className="-mr-1 -mb-1">
      <Button
        type="submit"
        size="sm"
        variant="ghost"
        aria-label="Remove item"
        disabled={isPending}
        className="px-2 text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
      >
        {isPending ? <Loader size="sm" /> : "Remove"}
      </Button>
      {message && <p className="text-xs text-red-500 mt-1">{message}</p>}
    </form>
  );
}
