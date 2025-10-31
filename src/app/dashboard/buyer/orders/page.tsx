
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema/orders";
import { getUserFromCookie } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

type Search = Promise<Record<string, string | undefined>>;

export default async function OrdersPage({
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

  // Aggregate counts per shipment status across ALL items of each order (for this buyer)
  const myOrders = await db
    .select({
      id: orders.id,
      totalAmount: orders.totalAmount, // cents
      createdAt: orders.createdAt,

      itemCount: sql<number>`COALESCE(COUNT(${orderItems.id}), 0)`,
      pendingCount: sql<number>`COALESCE(SUM(CASE WHEN ${orderItems.shipmentStatus} = 'pending' THEN 1 ELSE 0 END), 0)`,
      confirmedCount: sql<number>`COALESCE(SUM(CASE WHEN ${orderItems.shipmentStatus} = 'confirmed' THEN 1 ELSE 0 END), 0)`,
      shippedCount: sql<number>`COALESCE(SUM(CASE WHEN ${orderItems.shipmentStatus} = 'shipped' THEN 1 ELSE 0 END), 0)`,
      deliveredCount: sql<number>`COALESCE(SUM(CASE WHEN ${orderItems.shipmentStatus} = 'delivered' THEN 1 ELSE 0 END), 0)`,
      cancelledCount: sql<number>`COALESCE(SUM(CASE WHEN ${orderItems.shipmentStatus} = 'cancelled' THEN 1 ELSE 0 END), 0)`,
    })
    .from(orders)
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(eq(orders.buyerId, userId))
    .groupBy(orders.id, orders.totalAmount, orders.createdAt)
    .orderBy(sql`${orders.createdAt} DESC`);

  // Roll-up derived from counts - SIMPLIFIED: any confirmed items = confirmed
  const rollupStatusFromCounts = (o: {
    itemCount: number;
    pendingCount: number;
    confirmedCount: number;
    shippedCount: number;
    deliveredCount: number;
    cancelledCount: number;
  }) => {
    const total = Number(o.itemCount) || 0;
    if (total === 0) return "pending";

    if (o.deliveredCount === total) return "delivered";
    if (o.cancelledCount === total) return "cancelled";
    
    // If ANY items are confirmed, the order is confirmed
    if (o.confirmedCount > 0) return "confirmed";
    
    return "pending";
  };

  // Attach rollup, then filter by it
  const withRollup = myOrders.map((o) => ({
    ...o,
    rollup: rollupStatusFromCounts(o),
  }));

  const filtered =
    statusFilter === "all"
      ? withRollup
      : withRollup.filter((o) => o.rollup === statusFilter);

  const moneyFromCents = (cents: unknown) =>
    (Number(cents) / 100).toFixed(2);

  // Status badge styling - REMOVED partially_confirmed
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "confirmed":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto bg-[#faf7f2] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 p-4 bg-white rounded-xl shadow-md border border-[#e8e1d4]">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold text-[#3a2615] flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
            My Orders
          </h1>
          <p className="text-[#8B4513] mt-1 ml-11">
            {filtered.length} order{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <Link
          href="/dashboard/buyer"
          className="flex items-center text-[#8B4513] hover:text-[#6B3400] transition-colors duration-200 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-[#e8e1d4] mb-8">
        <h2 className="text-xl font-semibold text-[#3a2615] mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
          Filter Orders
        </h2>
        
        <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-[#8B4513] mb-1">Order Status</label>
            <select
              name="status"
              defaultValue={statusFilter}
              className="w-full border border-[#e8e1d4] p-2 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-[#8B4513] text-white px-6 py-2 rounded-lg hover:bg-[#6B3400] transition-colors duration-200 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      {/* Orders List */}
      <div>
        <h2 className="text-xl font-semibold text-[#3a2615] mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          Order History
        </h2>
        
        {filtered.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-md border border-[#e8e1d4] text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-[#b89f75]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-medium text-[#3a2615] mt-4">No orders found</h3>
            <p className="text-[#8B4513] mt-2">Try adjusting your filters to find what you're looking for.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((o) => (
              <Link
                key={o.id}
                href={`/dashboard/buyer/orders/${o.id}`}
                className="block bg-white rounded-xl shadow-md border border-[#e8e1d4] p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center mb-2">
                      <p className="font-medium text-lg text-[#3a2615]">Order #{o.id.slice(0, 8)}</p>
                      <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(o.rollup)}`}>
                        {formatStatus(o.rollup)}
                      </span>
                    </div>
                    <p className="text-sm text-[#8B4513]">
                      Placed: {o.createdAt ? new Date(o.createdAt as unknown as string).toLocaleString() : ""}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {o.itemCount} item{o.itemCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-[#8B4513]">
                      MAD {moneyFromCents(o.totalAmount)}
                    </p>
                    <p className="text-sm text-[#D4AF37] font-medium mt-1">
                      View Details →
                    </p>
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