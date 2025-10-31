"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Item = {
  cartId: string;
  productId: string;
  name: string;
  imageUrl: string | null;
  priceNum: number;
  quantity: number;
  lineTotal: number;
};

export default function CartItemRow({ item }: { item: Item }) {
  const router = useRouter();
  const [qty, setQty] = useState<number>(item.quantity);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const updateQty = (next: number) => {
    if (next < 1) return;
    setQty(next);
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/cart/update", {
        method: "PUT",
        body: JSON.stringify({ productId: item.productId, quantity: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Failed to update");
      } else {
        router.refresh();
      }
    });
  };

  const remove = () => {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/cart/remove", {
        method: "DELETE",
        body: JSON.stringify({ productId: item.productId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Failed to remove");
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="border rounded-lg p-4 flex items-center gap-4">
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-20 h-20 object-cover rounded"
        />
      ) : (
        <div className="w-20 h-20 bg-gray-100 rounded grid place-items-center text-gray-400 text-sm">
          No image
        </div>
      )}

      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-sm text-gray-600">MAD{item.priceNum.toFixed(2)} each</p>
          </div>
          <button
            onClick={remove}
            className="text-red-600 text-sm hover:underline"
            disabled={isPending}
          >
            Remove
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQty(qty - 1)}
              className="px-2 py-1 border rounded"
              disabled={isPending || qty <= 1}
            >
              −
            </button>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => updateQty(parseInt(e.target.value || "1", 10))}
              className="w-16 border rounded p-1 text-center"
              disabled={isPending}
            />
            <button
              onClick={() => updateQty(qty + 1)}
              className="px-2 py-1 border rounded"
              disabled={isPending}
            >
              +
            </button>
          </div>

          <div className="font-semibold">
            MAD{ (item.priceNum * qty).toFixed(2) }
          </div>
        </div>

        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
}
