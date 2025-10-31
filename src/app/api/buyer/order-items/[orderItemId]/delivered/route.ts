import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema/orders";
import { eq } from "drizzle-orm";
import { getUserFromCookie } from "@/lib/auth";

export async function POST(
  _req: Request,
  { params }: { params: { orderItemId: string } }
) {
  try {
    const userId = await getUserFromCookie();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [row] = await db
      .select({
        itemId: orderItems.id,
        orderId: orderItems.orderId,
        shipmentStatus: orderItems.shipmentStatus,
        buyerId: orders.buyerId,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(eq(orderItems.id, params.orderItemId))
      .limit(1);

    if (!row || row.buyerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (row.shipmentStatus !== "shipped") {
      return NextResponse.json({ error: "Only shipped items can be marked delivered" }, { status: 400 });
    }

    const [updated] = await db
      .update(orderItems)
      .set({ shipmentStatus: "delivered", deliveredAt: new Date() })
      .where(eq(orderItems.id, params.orderItemId))
      .returning({ id: orderItems.id, shipmentStatus: orderItems.shipmentStatus, deliveredAt: orderItems.deliveredAt });

    // Redirect back to the order page after successful update
    return NextResponse.redirect(new URL(`/dashboard/buyer/orders/${row.orderId}`, _req.url));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

