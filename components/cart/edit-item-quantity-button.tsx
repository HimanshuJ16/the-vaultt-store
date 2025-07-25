"use client";

import { Minus, Plus } from "lucide-react";
import { updateItemQuantity } from "./actions";
import { CartItem } from "@/lib/sfcc/types";
import { useActionState, useEffect } from "react";
import { useCart } from "./cart-context";
import { useAuth } from "@clerk/nextjs";
import clsx from "clsx";
import { toast } from "sonner";
import { Loader } from "../ui/loader";

function SubmitButton({ type, isPending }: { type: "plus" | "minus", isPending: boolean }) {
  return (
    <button
      type="submit"
      disabled={isPending}
      aria-label={type === "plus" ? "Increase item quantity" : "Reduce item quantity"}
      className={clsx(
        "ease flex h-full min-w-[36px] max-w-[36px] flex-none items-center justify-center rounded-full p-2 transition-all duration-200 hover:border-neutral-800 hover:opacity-80 disabled:opacity-50",
        { "ml-auto": type === "minus" }
      )}
    >
      {isPending ? <Loader size="sm" /> : type === "plus" ? (
        <Plus className="h-4 w-4 dark:text-neutral-500" />
      ) : (
        <Minus className="h-4 w-4 dark:text-neutral-500" />
      )}
    </button>
  );
}

export function EditItemQuantityButton({
  item,
  type,
}: {
  item: CartItem;
  type: "plus" | "minus";
}) {
  const [message, formAction, isPending] = useActionState<string | null, { lineId: string; variantId: string; quantity: number }>(
    updateItemQuantity,
    null
  );
  const { isSignedIn } = useAuth();
  const { optimisticUpdate } = useCart();
  
  const payload = {
    lineId: item.id,
    variantId: item.merchandise.id,
    quantity: type === "plus" ? item.quantity + 1 : item.quantity - 1,
  };

  useEffect(() => {
    if (message && message !== 'success') {
      toast.error(message);
      // The cart state will automatically revert because the
      // CartProvider re-syncs with the serverCart prop on revalidation.
    }
  }, [message]);

  const actionWithOptimisticUpdate = () => {
    if (payload.quantity < 0) return;

    optimisticUpdate(item.id, type);

    if (isSignedIn) {
        // Directly call formAction. It doesn't return a promise.
        // The 'isPending' and 'message' states from useActionState handle the result.
        formAction(payload);
    }
  };

  return (
    <form action={actionWithOptimisticUpdate}>
      <SubmitButton type={type} isPending={isPending} />
      <p aria-live="polite" className="sr-only" role="status">
        {message}
      </p>
    </form>
  );
}
