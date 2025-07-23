"use client";

import { removeItem } from "@/components/cart/actions";
import { CartItem } from "@/lib/sfcc/types";
import { useActionState } from "react";
import { Button } from "../ui/button";
import { UpdateType } from "./cart-context";
import { useAuth } from "@clerk/nextjs";

export function DeleteItemButton({
  item,
  optimisticUpdate,
}: {
  item: CartItem;
  optimisticUpdate: (lineId: string, updateType: UpdateType) => void;
}) {
  const [message, formAction] = useActionState(removeItem, null);
  const { isSignedIn } = useAuth();
  const lineId = item.id;
  const removeItemAction = formAction.bind(null, lineId);

  const handleDelete = async () => {
    optimisticUpdate(lineId, "delete");
    if (isSignedIn) {
      await removeItemAction();
    }
  };

  return (
    <form
      className="-mr-1 -mb-1 opacity-70"
      action={handleDelete}
    >
      <Button
        type="submit"
        size="sm"
        variant="ghost"
        aria-label="Remove item"
        className="px-2 text-sm"
      >
        Remove
      </Button>
      <p aria-live="polite" className="sr-only" role="status">
        {message}
      </p>
    </form>
  );
}