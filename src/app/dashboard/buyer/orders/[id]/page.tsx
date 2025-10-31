// src/app/dashboard/buyer/orders/[id]/page.tsx
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema/orders";
import { users } from "@/db/schema/users";
import { getUserFromCookie } from "@/lib/auth";
import { and, eq, inArray } from "drizzle-orm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

function centsToMoney(c: unknown) {
  return (Number(c) / 100).toFixed(2);
}

// Roll-up computed from NON-cancelled items, unless all are cancelled
function rollupStatusFromItems(statuses: string[]) {
  const nonCancelled = statuses.filter((s) => s !== "cancelled");
  // If every item was cancelled
  if (statuses.length > 0 && nonCancelled.length === 0) return "cancelled";
  if (nonCancelled.length === 0) return "pending"; // defensive default

  const set = new Set(nonCancelled);
  if (set.size === 1) {
    if (set.has("delivered")) return "delivered";
    if (set.has("shipped")) return "shipped";
    if (set.has("confirmed")) return "confirmed";
    if (set.has("pending")) return "pending";
  }
  if (set.has("shipped") || set.has("delivered")) return "partially_shipped";
  if (set.has("confirmed")) return "partially_confirmed";
  return "pending";
}

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const userId = await getUserFromCookie();
  if (!userId) redirect("/unauthorized");

  const order = await db
    .select({
      id: orders.id,
      buyerId: orders.buyerId,
      totalAmount: orders.totalAmount, // original snapshot (we won't display this anymore)
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.buyerId, userId)))
    .then((r) => r[0]);

  if (!order) notFound();

  const items = await db
    .select({
      id: orderItems.id,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      price: orderItems.price,            // cents
      productName: orderItems.productName,
      productImage: orderItems.productImage,
      sellerId: orderItems.sellerId,
      shipmentStatus: orderItems.shipmentStatus,
      trackingNumber: orderItems.trackingNumber,
      shippedAt: orderItems.shippedAt,
      deliveredAt: orderItems.deliveredAt,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  const sellerIds = Array.from(new Set(items.map((i) => i.sellerId)));
  const sellers =
    sellerIds.length > 0
      ? await db
          .select({ id: users.id, name: users.name })
          .from(users)
          .where(inArray(users.id, sellerIds))
      : [];

  // Compute totals excluding cancelled items
  const activeItems = items.filter((i) => i.shipmentStatus !== "cancelled");
  const subtotal = activeItems.reduce(
    (sum, i) => sum + Number(i.price) * i.quantity,
    0
  );

  const statuses = items.map((i) => String(i.shipmentStatus));
  const orderRollup = rollupStatusFromItems(statuses);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8)}</h1>
        <Link
          href="/dashboard/buyer/orders"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to My Orders
        </Link>
      </div>

      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <p>
              <span className="font-semibold">Order status:</span>{" "}
              <span className="uppercase">{orderRollup}</span>
            </p>
            <p className="text-gray-500">
              Placed:{" "}
              {order.createdAt
                ? new Date(order.createdAt).toLocaleString()
                : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold">
              Total: MAD{centsToMoney(subtotal)} {/* NEW: active subtotal */}
            </p>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="space-y-3">
        {items.map((it) => {
          const sellerName =
            sellers.find((s) => s.id === it.sellerId)?.name ?? "Seller";
          const line = Number(it.price) * it.quantity;
          const canCancel = it.shipmentStatus === "pending";
          const canMarkDelivered = it.shipmentStatus === "shipped";

          return (
            <div
              key={it.id}
              className="flex items-start gap-4 border rounded p-3"
            >
              {it.productImage ? (
                <img
                  src={it.productImage}
                  alt={it.productName}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded" />
              )}

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{it.productName}</p>
                    <p className="text-xs text-gray-500">
                      Seller: {sellerName}
                    </p>
                  </div>
                  <span
                    className={
                      "px-2 py-1 text-xs rounded " +
                      (it.shipmentStatus === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : it.shipmentStatus === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : it.shipmentStatus === "shipped"
                        ? "bg-blue-100 text-blue-800"
                        : it.shipmentStatus === "delivered"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800")
                    }
                  >
                    {it.shipmentStatus === "shipped"
                      ? "shipping"
                      : it.shipmentStatus}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mt-1">
                  MAD{centsToMoney(it.price)} × {it.quantity} ={" "}
                  <span className="font-semibold">MAD{centsToMoney(line)}</span>
                  {/* Note: line is shown even for cancelled items, but total ignores them */}
                </p>

                {it.trackingNumber && (
                  <p className="text-xs text-gray-600 mt-1">
                    Tracking: {it.trackingNumber}
                  </p>
                )}
                {it.shippedAt && (
                  <p className="text-xs text-gray-600">
                    Shipped: {new Date(String(it.shippedAt)).toLocaleString()}
                  </p>
                )}
                {it.deliveredAt && (
                  <p className="text-xs text-gray-600">
                    Delivered:{" "}
                    {new Date(String(it.deliveredAt)).toLocaleString()}
                  </p>
                )}

                <div className="flex gap-2 mt-2">
                  {canCancel && (
                    <form
                      action={`/api/buyer/order-items/MAD{it.id}/cancel`}
                      method="POST"
                    >
                      
                    </form>
                  )}
                  {canMarkDelivered && (
                    <form
                      action={`/api/buyer/order-items/MAD{it.id}/delivered`}
                      method="POST"
                    >
                      <button className="bg-emerald-600 text-white text-xs px-3 py-1 rounded hover:bg-emerald-700">
                        Mark delivered
                      </button>
                    </form>
                  )}
                </div>
              </div>

              <div className="font-semibold">MAD{centsToMoney(line)}</div>
            </div>
          );
        })}
      </div>

      <div className="border rounded-lg p-4 flex justify-between">
        <span className="font-medium">Subtotal</span>
        <span className="font-bold"> MAD {centsToMoney(subtotal)}</span>
      </div>
    </div>
  );
}
