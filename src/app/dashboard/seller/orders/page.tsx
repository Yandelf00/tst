// // src/app/dashboard/seller/orders/page.tsx
// import { redirect } from "next/navigation";
// import Link from "next/link";
// import { eq, sql } from "drizzle-orm";

// import { getUserFromCookie, getUserById } from "@/lib/auth";
// import { db } from "@/db";
// import { orders, orderItems } from "@/db/schema/orders";
// import { users } from "@/db/schema/users";

// type Search = Promise<Record<string, string | undefined>>;

// export default async function SellerOrdersPage({
//   searchParams,
// }: {
//   searchParams: Search;
// }) {
//   const sp = await searchParams;
//   const statusFilter =
//     (sp.status as
//       | "all"
//       | "pending"
//       | "confirmed"
//       | "partially_confirmed"
//       | "shipped"
//       | "partially_shipped"
//       | "delivered"
//       | "cancelled") ?? "all";

//   const userId = await getUserFromCookie();
//   if (!userId) redirect("/unauthorized");

//   const user = await getUserById(userId);
//   if (!user || user.role !== "seller") redirect("/unauthorized");

//   // Orders that contain at least one item sold by THIS seller.
//   const rows = await db
//     .select({
//       orderId: orders.id,
//       createdAt: orders.createdAt,
//       buyerId: orders.buyerId,
//       buyerName: users.name,
//       // Sum only this seller's items (price is in cents)
//       sellerSubtotal: sql<number>`SUM(${orderItems.price} * ${orderItems.quantity})`,
//       itemCount: sql<number>`COUNT(${orderItems.id})`,
//       // NOTE: drivers may return array_agg as "{pending,shipped}" (string)
//       shipmentStatuses: sql<string>`array_agg(${orderItems.shipmentStatus})`,
//     })
//     .from(orders)
//     .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
//     .innerJoin(users, eq(users.id, orders.buyerId))
//     .where(eq(orderItems.sellerId, user.id))
//     .groupBy(orders.id, orders.createdAt, orders.buyerId, users.name)
//     .orderBy(sql`${orders.createdAt} DESC`);

//   // Normalize array_agg output to string[]
//   const normalizeStatuses = (val: unknown): string[] => {
//     if (Array.isArray(val)) return val as string[];
//     if (val == null) return [];
//     const str = String(val).trim();

//     // Postgres text[] -> "{pending,confirmed}"
//     if (str.startsWith("{") && str.endsWith("}")) {
//       return str
//         .slice(1, -1)
//         .split(",")
//         .map((s) => s.replace(/^"|"$/g, "").trim())
//         .filter(Boolean);
//     }

//     // JSON array -> '["pending","confirmed"]'
//     if (str.startsWith("[") && str.endsWith("]")) {
//       try {
//         const arr = JSON.parse(str);
//         return Array.isArray(arr) ? arr.map(String) : [];
//       } catch {
//         /* ignore */
//       }
//     }

//     // Single status
//     return [str];
//   };

//   // Roll up status from THIS seller's items only
//   const rollupShipmentStatus = (statuses: string[]) => {
//     const s = statuses.filter(Boolean);
//     const total = s.length;
//     if (total === 0) return "pending";
//     const count = (t: string) => s.filter((x) => x === t).length;

//     if (count("delivered") === total) return "delivered";
//     if (count("shipped")   === total) return "shipped";
//     if (count("confirmed") === total) return "confirmed";
//     if (count("cancelled") === total) return "cancelled";
//     if (count("pending")   === total) return "pending";

//     if (count("shipped") + count("delivered") > 0) return "partially_shipped";
//     if (count("confirmed") > 0) return "partially_confirmed";
//     return "pending";
//   };

//   // Apply filter after computing the rollup
//   const rowsWithRollup = rows.map((o) => {
//     const statuses = normalizeStatuses(o.shipmentStatuses as unknown as string | string[]);
//     const rollup = rollupShipmentStatus(statuses);
//     return { ...o, rollup };
//   });

//   const filtered = rowsWithRollup.filter((r) =>
//     statusFilter === "all" ? true : r.rollup === statusFilter
//   );

//   return (
//     <div className="min-h-screen bg-beige-50 p-8">
//       <div className="max-w-6xl mx-auto">
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="text-3xl font-bold text-brown-800">Orders</h1>
//             <p className="text-brown-600">
//               {filtered.length} order{filtered.length !== 1 ? "s" : ""} with your items
//             </p>
//           </div>
//           <Link
//             href="/dashboard/seller"
//             className="border border-brown-700 text-brown-700 px-6 py-2 rounded-lg hover:bg-beige-100 transition-colors"
//           >
//             ← Dashboard
//           </Link>
//         </div>

//         {/* Filters */}
//         <form className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
//           <select
//             name="status"
//             defaultValue={statusFilter}
//             className="border border-beige-300 rounded-lg p-2 bg-white"
//           >
//             <option value="all">All statuses</option>
//             <option value="pending">Pending</option>
//             <option value="confirmed">Confirmed</option>
//             <option value="partially_confirmed">Partially Confirmed</option>
//             <option value="shipped">Shipped</option>
//             <option value="partially_shipped">Partially Shipped</option>
//             <option value="delivered">Delivered</option>
//             <option value="cancelled">Cancelled</option>
//           </select>

//           <button
//             type="submit"
//             className="sm:col-span-2 bg-brown-800 text-beige-100 rounded-lg px-4 py-2 hover:bg-brown-700 transition"
//           >
//             Apply filters
//           </button>
//         </form>

//         {filtered.length === 0 ? (
//           <div className="bg-white rounded-xl shadow-sm border border-beige-200 p-12 text-center">
//             <h3 className="mt-1 text-brown-800 text-lg font-medium">No orders match this filter</h3>
//             <p className="text-brown-600">Try a different status.</p>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {filtered.map((o) => (
//               <Link
//                 key={o.orderId}
//                 href={`/dashboard/seller/orders/${o.orderId}`}
//                 className="block bg-white rounded-xl shadow-sm border border-beige-200 hover:shadow-md transition-all"
//               >
//                 <div className="p-5 flex items-center justify-between">
//                   <div>
//                     <div className="text-sm text-brown-600">Order #{o.orderId}</div>
//                     <div className="text-brown-800 font-semibold">
//                       {Number(o.itemCount)} item{Number(o.itemCount) !== 1 ? "s" : ""} • {o.buyerName}
//                     </div>
//                     <div className="text-sm text-brown-600">
//                       Placed {new Date(String(o.createdAt)).toLocaleString()}
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <div className="text-brown-800 font-bold">
//                      MAD {(Number(o.sellerSubtotal) / 100).toFixed(2)}
//                     </div>
//                     <div className="text-xs uppercase tracking-wide text-brown-600">
//                       {o.rollup}
//                     </div>
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }





// src/app/dashboard/seller/orders/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { eq, sql } from "drizzle-orm";

import { getUserFromCookie, getUserById } from "@/lib/auth";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema/orders";
import { users } from "@/db/schema/users";

type Search = Promise<Record<string, string | undefined>>;

export default async function SellerOrdersPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const sp = await searchParams;
  const statusFilter =
    (sp.status as
      | "all"
      | "pending"
      | "confirmed") ?? "all";

  const userId = await getUserFromCookie();
  if (!userId) redirect("/unauthorized");

  const user = await getUserById(userId);
  if (!user || user.role !== "seller") redirect("/unauthorized");

  // Orders that contain at least one item sold by THIS seller.
  const rows = await db
    .select({
      orderId: orders.id,
      createdAt: orders.createdAt,
      buyerId: orders.buyerId,
      buyerName: users.name,
      // Sum only this seller's items (price is in cents)
      sellerSubtotal: sql<number>`SUM(${orderItems.price} * ${orderItems.quantity})`,
      itemCount: sql<number>`COUNT(${orderItems.id})`,
      // NOTE: drivers may return array_agg as "{pending,shipped}" (string)
      shipmentStatuses: sql<string>`array_agg(${orderItems.shipmentStatus})`,
    })
    .from(orders)
    .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
    .innerJoin(users, eq(users.id, orders.buyerId))
    .where(eq(orderItems.sellerId, user.id))
    .groupBy(orders.id, orders.createdAt, orders.buyerId, users.name)
    .orderBy(sql`${orders.createdAt} DESC`);

  // Normalize array_agg output to string[]
  const normalizeStatuses = (val: unknown): string[] => {
    if (Array.isArray(val)) return val as string[];
    if (val == null) return [];
    const str = String(val).trim();

    // Postgres text[] -> "{pending,confirmed}"
    if (str.startsWith("{") && str.endsWith("}")) {
      return str
        .slice(1, -1)
        .split(",")
        .map((s) => s.replace(/^"|"$/g, "").trim())
        .filter(Boolean);
    }

    // JSON array -> '["pending","confirmed"]'
    if (str.startsWith("[") && str.endsWith("]")) {
      try {
        const arr = JSON.parse(str);
        return Array.isArray(arr) ? arr.map(String) : [];
      } catch {
        /* ignore */
      }
    }

    // Single status
    return [str];
  };

  // Roll up status from THIS seller's items only
  const rollupShipmentStatus = (statuses: string[]) => {
    const s = statuses.filter(Boolean);
    const total = s.length;
    if (total === 0) return "pending";
    const count = (t: string) => s.filter((x) => x === t).length;

    if (count("delivered") === total) return "delivered";
    if (count("confirmed") === total) return "confirmed";
    if (count("cancelled") === total) return "cancelled";
    if (count("pending") === total) return "pending";

    if (count("confirmed") > 0) return "partially_confirmed";
    return "pending";
  };

  // Apply filter after computing the rollup
  const rowsWithRollup = rows.map((o) => {
    const statuses = normalizeStatuses(o.shipmentStatuses as unknown as string | string[]);
    const rollup = rollupShipmentStatus(statuses);
    return { ...o, rollup };
  });

  const filtered = rowsWithRollup.filter((r) =>
    statusFilter === "all" ? true : r.rollup === statusFilter
  );

  return (
    <div className="min-h-screen bg-beige-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-brown-800">Orders</h1>
            <p className="text-brown-600">
              {filtered.length} order{filtered.length !== 1 ? "s" : ""} with your items
            </p>
          </div>
          <Link
            href="/dashboard/seller"
            className="border border-brown-700 text-brown-700 px-6 py-2 rounded-lg hover:bg-beige-100 transition-colors"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Filters */}
        <form className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            name="status"
            defaultValue={statusFilter}
            className="border border-beige-300 rounded-lg p-2 bg-white"
          >
            <option value="all">All status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
          </select>

          <button
            type="submit"
            className="sm:col-span-2 bg-brown-800 text-beige-100 rounded-lg px-4 py-2 hover:bg-brown-700 transition"
          >
            Apply filters
          </button>
        </form>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-beige-200 p-12 text-center">
            <h3 className="mt-1 text-brown-800 text-lg font-medium">No orders match this filter</h3>
            <p className="text-brown-600">Try a different status.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((o) => (
              <Link
                key={o.orderId}
                href={`/dashboard/seller/orders/${o.orderId}`}
                className="block bg-white rounded-xl shadow-sm border border-beige-200 hover:shadow-md transition-all"
              >
                <div className="p-5 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-brown-600">Order #{o.orderId}</div>
                    <div className="text-brown-800 font-semibold">
                      {Number(o.itemCount)} item{Number(o.itemCount) !== 1 ? "s" : ""} • {o.buyerName}
                    </div>
                    <div className="text-sm text-brown-600">
                      Placed {new Date(String(o.createdAt)).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-brown-800 font-bold">
                     MAD {(Number(o.sellerSubtotal) / 100).toFixed(2)}
                    </div>
                    <div className="text-xs uppercase tracking-wide text-brown-600">
                      {o.rollup}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}