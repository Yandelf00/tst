
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  const addToCart = async () => {
    setLoading(true);
    setErr(null);
    setOk(false);
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (res.status === 401) {
        // not logged in → send to login with return URL
        const callbackUrl = encodeURIComponent(window.location.href);
        router.push(`/login?callbackUrl=${callbackUrl}`);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to add to cart");
      }

      setOk(true);
      setTimeout(() => setOk(false), 1500);
    } catch (e: any) {
      setErr(e.message || "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={addToCart}
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
      >
        {loading ? "Adding..." : "Add to cart"}
      </button>
      {ok && <span className="text-green-600 text-sm">Added!</span>}
      {err && <span className="text-red-600 text-sm">{err}</span>}
    </div>
  );
}
