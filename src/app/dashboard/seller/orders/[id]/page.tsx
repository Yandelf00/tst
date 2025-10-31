// // src/app/dashboard/seller/orders/[id]/page.tsx
// import { getUserFromCookie, getUserById } from "@/lib/auth";
// import { redirect } from "next/navigation";
// import { db } from "@/db";
// import { orders, orderItems } from "@/db/schema/orders";
// import { users } from "@/db/schema/users";
// import { products } from "@/db/schema/products";
// import { and, eq } from "drizzle-orm";
// import Link from "next/link";
// import SellerOrderItemActions from "@/components/SellerOrderItemActions";

// export default async function SellerOrderDetailPage({
//   params,
// }: {
//   params: { id: string };
// }) {
//   const userId = await getUserFromCookie();
//   if (!userId) redirect("/unauthorized");

//   const user = await getUserById(userId);
//   if (!user || user.role !== "seller") redirect("/unauthorized");

//   // Order + buyer info (PHONE instead of email)
//   const orderRow = await db
//     .select({
//       id: orders.id,
//       createdAt: orders.createdAt,
//       status: orders.status,
//       buyerId: orders.buyerId,
//       buyerName: users.name,
//       buyerPhone: users.phone, // <-- added
//     })
//     .from(orders)
//     .innerJoin(users, eq(users.id, orders.buyerId))
//     .where(eq(orders.id, params.id))
//     .limit(1);

//   if (orderRow.length === 0) {
//     redirect("/dashboard/seller/orders");
//   }

//   // Items belonging to THIS seller
//   const items = await db
//     .select({
//       orderItemId: orderItems.id,
//       productId: orderItems.productId,
//       productName: orderItems.productName,   // snapshot
//       productImage: orderItems.productImage, // snapshot
//       quantity: orderItems.quantity,
//       price: orderItems.price,               // cents
//       shipmentStatus: orderItems.shipmentStatus,
//       trackingNumber: orderItems.trackingNumber,
//       liveName: products.name,
//       liveImage: products.imageUrl,
//     })
//     .from(orderItems)
//     .leftJoin(products, eq(products.id, orderItems.productId))
//     .where(and(eq(orderItems.orderId, params.id), eq(orderItems.sellerId, user.id)));

//   if (items.length === 0) {
//     redirect("/dashboard/seller/orders");
//   }

//   const subtotal = items.reduce(
//     (sum, it) => sum + Number(it.price) * Number(it.quantity),
//     0
//   );

//   // Roll up only THIS seller's items
//   const rollupShipmentStatus = (statuses: string[]) => {
//     const s = (statuses || []).filter(Boolean);
//     const total = s.length;
//     if (total === 0) return "pending";
//     const count = (t: string) => s.filter((x) => x === t).length;

//     if (count("delivered") === total) return "delivered";
//     if (count("shipped") === total) return "shipped";
//     if (count("confirmed") === total) return "confirmed";
//     if (count("cancelled") === total) return "cancelled";
//     if (count("pending") === total) return "pending";

//     if (count("shipped") + count("delivered") > 0) return "partially_shipped";
//     if (count("confirmed") > 0) return "partially_confirmed";
//     return "pending";
//   };

//   const myRollup = rollupShipmentStatus(
//     items.map((i) => String(i.shipmentStatus))
//   );

//   return (
//     <div className="min-h-screen bg-beige-50 p-8">
//       <div className="max-w-5xl mx-auto">
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="text-2xl font-bold text-brown-800">
//               Order #{orderRow[0].id}
//             </h1>
//             <p className="text-brown-600">
//               Buyer: {orderRow[0].buyerName} • phone : {orderRow[0].buyerPhone ?? "-"}
//             </p>
//             <p className="text-brown-600">
//               Placed {new Date(String(orderRow[0].createdAt)).toLocaleString()}
//             </p>
//             <p className="text-brown-700 mt-1">
//               Your items status: <span className="uppercase">{myRollup}</span>
//             </p>
//           </div>
//           <Link
//             href="/dashboard/seller/orders"
//             className="border border-brown-700 text-brown-700 px-6 py-2 rounded-lg hover:bg-beige-100 transition-colors"
//           >
//             ← Back to Orders
//           </Link>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border border-beige-200 overflow-hidden">
//           <table className="min-w-full">
//             <thead className="bg-beige-100">
//               <tr>
//                 <th className="text-left p-3 text-brown-700">Item</th>
//                 <th className="text-left p-3 text-brown-700">Qty</th>
//                 <th className="text-left p-3 text-brown-700">Price</th>
//                 <th className="text-left p-3 text-brown-700">Line Total</th>
//                 <th className="text-left p-3 text-brown-700">Status</th>
//                 <th className="text-left p-3 text-brown-700">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {items.map((it) => {
//                 const name = it.productName ?? it.liveName ?? "Product";
//                 const img = it.productImage ?? it.liveImage ?? "";
//                 const line = Number(it.price) * Number(it.quantity);
//                 return (
//                   <tr
//                     key={it.orderItemId}
//                     className="border-t border-beige-200"
//                   >
//                     <td className="p-3">
//                       <div className="flex items-center space-x-3">
//                         {img ? (
//                           <img
//                             src={img}
//                             alt={name}
//                             className="w-14 h-14 rounded object-cover"
//                           />
//                         ) : null}
//                         <span className="text-brown-800 font-medium">
//                           {name}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="p-3">{it.quantity}</td>
//                     <td className="p-3">
//                       MAD {(Number(it.price) / 100).toFixed(2)}
//                     </td>
//                     <td className="p-3 font-semibold">
//                       MAD {(line / 100).toFixed(2)}
//                     </td>
//                     <td className="p-3">
//                       <span
//                         className={
//                           "px-2 py-1 text-xs rounded " +
//                           (it.shipmentStatus === "pending"
//                             ? "bg-yellow-100 text-yellow-800"
//                             : it.shipmentStatus === "confirmed"
//                             ? "bg-green-100 text-green-800"
//                             : it.shipmentStatus === "shipped"
//                             ? "bg-blue-100 text-blue-800"
//                             : it.shipmentStatus === "delivered"
//                             ? "bg-emerald-100 text-emerald-800"
//                             : "bg-red-100 text-red-800")
//                         }
//                       >
//                         {it.shipmentStatus === "shipped"
//                           ? "shipping"
//                           : it.shipmentStatus}
//                       </span>
//                     </td>
//                     <td className="p-3">
//                       <SellerOrderItemActions
//                         orderItemId={it.orderItemId}
//                         shipmentStatus={String(it.shipmentStatus)}
//                         trackingNumber={it.trackingNumber as unknown as string}
//                       />
//                     </td>
//                   </tr>
//                 );
//               })}
//               <tr className="border-t border-beige-200 bg-beige-50">
//                 <td className="p-3 font-semibold" colSpan={3}>
//                   Subtotal (your items)
//                 </td>
//                 <td className="p-3 font-bold">
//                   MAD {(subtotal / 100).toFixed(2)}
//                 </td>
//                 <td />
//                 <td />
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }





// src/app/dashboard/seller/orders/[id]/page.tsx
import { getUserFromCookie, getUserById } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema/orders";
import { users } from "@/db/schema/users";
import { products } from "@/db/schema/products";
import { and, eq } from "drizzle-orm";
import Link from "next/link";
import SellerOrderItemActions from "@/components/SellerOrderItemActions";

export default async function SellerOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const userId = await getUserFromCookie();
  if (!userId) redirect("/unauthorized");

  const user = await getUserById(userId);
  if (!user || user.role !== "seller") redirect("/unauthorized");

  // Order + buyer info (PHONE instead of email)
  const orderRow = await db
    .select({
      id: orders.id,
      createdAt: orders.createdAt,
      status: orders.status,
      buyerId: orders.buyerId,
      buyerName: users.name,
      buyerPhone: users.phone, // <-- added
    })
    .from(orders)
    .innerJoin(users, eq(users.id, orders.buyerId))
    .where(eq(orders.id, params.id))
    .limit(1);

  if (orderRow.length === 0) {
    redirect("/dashboard/seller/orders");
  }

  // Items belonging to THIS seller
  const items = await db
    .select({
      orderItemId: orderItems.id,
      productId: orderItems.productId,
      productName: orderItems.productName,   // snapshot
      productImage: orderItems.productImage, // snapshot
      quantity: orderItems.quantity,
      price: orderItems.price,               // cents
      shipmentStatus: orderItems.shipmentStatus,
      trackingNumber: orderItems.trackingNumber,
      liveName: products.name,
      liveImage: products.imageUrl,
    })
    .from(orderItems)
    .leftJoin(products, eq(products.id, orderItems.productId))
    .where(and(eq(orderItems.orderId, params.id), eq(orderItems.sellerId, user.id)));

  if (items.length === 0) {
    redirect("/dashboard/seller/orders");
  }

  const subtotal = items.reduce(
    (sum, it) => sum + Number(it.price) * Number(it.quantity),
    0
  );

  // Roll up only THIS seller's items
  const rollupShipmentStatus = (statuses: string[]) => {
    const s = (statuses || []).filter(Boolean);
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

  const myRollup = rollupShipmentStatus(
    items.map((i) => String(i.shipmentStatus))
  );

  return (
    <div className="min-h-screen bg-beige-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-brown-800">
              Order #{orderRow[0].id}
            </h1>
            <p className="text-brown-600">
              Buyer: {orderRow[0].buyerName} • phone : {orderRow[0].buyerPhone ?? "-"}
            </p>
            <p className="text-brown-600">
              Placed {new Date(String(orderRow[0].createdAt)).toLocaleString()}
            </p>
            <p className="text-brown-700 mt-1">
              Your items status: <span className="uppercase">{myRollup}</span>
            </p>
          </div>
          <Link
            href="/dashboard/seller/orders"
            className="border border-brown-700 text-brown-700 px-6 py-2 rounded-lg hover:bg-beige-100 transition-colors"
          >
            ← Back to Orders
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-beige-200 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-beige-100">
              <tr>
                <th className="text-left p-3 text-brown-700">Item</th>
                <th className="text-left p-3 text-brown-700">Qty</th>
                <th className="text-left p-3 text-brown-700">Price</th>
                <th className="text-left p-3 text-brown-700">Line Total</th>
                <th className="text-left p-3 text-brown-700">Status</th>
                <th className="text-left p-3 text-brown-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const name = it.productName ?? it.liveName ?? "Product";
                const img = it.productImage ?? it.liveImage ?? "";
                const line = Number(it.price) * Number(it.quantity);
                return (
                  <tr
                    key={it.orderItemId}
                    className="border-t border-beige-200"
                  >
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        {img ? (
                          <img
                            src={img}
                            alt={name}
                            className="w-14 h-14 rounded object-cover"
                          />
                        ) : null}
                        <span className="text-brown-800 font-medium">
                          {name}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">{it.quantity}</td>
                    <td className="p-3">
                      MAD {(Number(it.price) / 100).toFixed(2)}
                    </td>
                    <td className="p-3 font-semibold">
                      MAD {(line / 100).toFixed(2)}
                    </td>
                    <td className="p-3">
                      <span
                        className={
                          "px-2 py-1 text-xs rounded " +
                          (it.shipmentStatus === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : it.shipmentStatus === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : it.shipmentStatus === "delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800")
                        }
                      >
                        {it.shipmentStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <SellerOrderItemActions
                        orderItemId={it.orderItemId}
                        shipmentStatus={String(it.shipmentStatus)}
                        trackingNumber={it.trackingNumber as unknown as string}
                      />
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t border-beige-200 bg-beige-50">
                <td className="p-3 font-semibold" colSpan={3}>
                  Subtotal (your items)
                </td>
                <td className="p-3 font-bold">
                  MAD {(subtotal / 100).toFixed(2)}
                </td>
                <td />
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}