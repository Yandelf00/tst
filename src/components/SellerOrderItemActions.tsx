// "use client";

// import { useState, useTransition } from "react";

// type Props = {
//   orderItemId: string;
//   shipmentStatus:
//     | "pending"
//     | "confirmed"
//     | "shipped"
//     | "delivered"
//     | "cancelled"
//     | string;
//   trackingNumber?: string | null;
// };

// export default function SellerOrderItemActions({
//   orderItemId,
//   shipmentStatus,
//   trackingNumber,
// }: Props) {
//   const [isPending, startTransition] = useTransition();
//   const [error, setError] = useState<string | null>(null);

//   const call = (
//     action: "confirm" | "ship" | "cancel",
//     extras?: Record<string, unknown>
//   ) => {
//     setError(null);
//     startTransition(async () => {
//       try {
//         const res = await fetch(
//           `/api/seller/order-items/${orderItemId}/status`,
//           {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ action, ...(extras || {}) }),
//           }
//         );
//         const data = await res.json().catch(() => ({}));
//         if (!res.ok) {
//           setError((data as any)?.error || "Action failed");
//           return;
//         }
//         // Refresh the page to reflect latest status
//         if (typeof window !== "undefined") window.location.reload();
//       } catch (e) {
//         setError("Action failed");
//       }
//     });
//   };

//   if (shipmentStatus === "shipped" || shipmentStatus === "delivered") {
//     return <span className="text-brown-700 text-sm">No actions</span>;
//   }

//   if (shipmentStatus === "cancelled") {
//     return <span className="text-red-700 text-sm">Cancelled</span>;
//   }

//   return (
//     <div className="space-y-2">
//       {shipmentStatus === "pending" && (
//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => call("confirm")}
//             disabled={isPending}
//             className="px-3 py-1 text-xs rounded bg-brown-700 text-beige-100 hover:bg-brown-800 disabled:opacity-50"
//           >
//             Confirm
//           </button>
//           <button
//             onClick={() => call("cancel")}
//             disabled={isPending}
//             className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
//           >
//             Cancel
//           </button>
//         </div>
//       )}

//       {shipmentStatus === "confirmed" && (
//         <button
//           onClick={() => call("ship")}
//           disabled={isPending}
//           className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
//         >
//           Ship
//         </button>
//       )}

//       {error && <div className="text-xs text-red-600">{error}</div>}
//     </div>
//   );
// }



"use client";

import { useState, useTransition } from "react";

type Props = {
  orderItemId: string;
  shipmentStatus:
    | "pending"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "cancelled"
    | string;
  trackingNumber?: string | null;
};

export default function SellerOrderItemActions({
  orderItemId,
  shipmentStatus,
  trackingNumber,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const call = (
    action: "confirm" | "cancel", // Removed "ship" from the action types
    extras?: Record<string, unknown>
  ) => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/seller/order-items/${orderItemId}/status`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, ...(extras || {}) }),
          }
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError((data as any)?.error || "Action failed");
          return;
        }
        // Refresh the page to reflect latest status
        if (typeof window !== "undefined") window.location.reload();
      } catch (e) {
        setError("Action failed");
      }
    });
  };

  if (shipmentStatus === "confirmed" || shipmentStatus === "delivered") {
    return <span className="text-brown-700 text-sm">No actions</span>;
  }

  if (shipmentStatus === "cancelled") {
    return <span className="text-red-700 text-sm">Cancelled</span>;
  }

  return (
    <div className="space-y-2">
      {shipmentStatus === "pending" && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => call("confirm")}
            disabled={isPending}
            className="px-3 py-1 text-xs rounded bg-brown-700 text-beige-100 hover:bg-brown-800 disabled:opacity-50"
          >
            Confirm
          </button>
          <button
            onClick={() => call("cancel")}
            disabled={isPending}
            className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Removed the "ship" button section that was here */}

      {error && <div className="text-xs text-red-600">{error}</div>}
    </div>
  );
}