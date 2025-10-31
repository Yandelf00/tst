"use client";

import { useTransition } from "react";

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const [isPending, start] = useTransition();

  const cancel = () => {
    start(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/cancel`, { method: "POST" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          alert(data.error ?? "Failed to cancel");
          return;
        }
        // Refresh the page to show the new status
        window.location.reload();
      } catch {
        alert("Failed to cancel");
      }
    });
  };

  return (
    <button
      onClick={cancel}
      disabled={isPending}
      className="mt-2 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 disabled:opacity-60"
      title="Cancel order (allowed while pending)"
    >
      {isPending ? "Cancelling..." : "Cancel order"}
    </button>
  );
}
