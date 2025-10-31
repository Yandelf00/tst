// src/app/api/admin/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema/orders";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/orders/:id
 * Returns order header + all items (with seller info)
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Header (order + buyer)
    const [header] = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        buyerId: orders.buyerId,
        status: orders.status,
        totalAmount: orders.totalAmount,
        createdAt: orders.createdAt,
        buyerEmail: users.email,
        buyerName: users.name,
        buyerPhone: users.phone, // <-- added
      })
      .from(orders)
      .leftJoin(users, eq(users.id, orders.buyerId))
      .where(eq(orders.id, id))
      .limit(1);

    if (!header) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Items (join seller for email/name)
    const items = await db
      .select({
        id: orderItems.id,
        productId: orderItems.productId,
        productName: orderItems.productName,
        productImage: orderItems.productImage,
        sellerId: orderItems.sellerId,
        quantity: orderItems.quantity,
        price: orderItems.price, // cents
        shipmentStatus: orderItems.shipmentStatus,
        trackingNumber: orderItems.trackingNumber,
        shippedAt: orderItems.shippedAt,
        deliveredAt: orderItems.deliveredAt,
        sellerEmail: users.email,
        sellerName: users.name,
      })
      .from(orderItems)
      .leftJoin(users, eq(users.id, orderItems.sellerId))
      .where(eq(orderItems.orderId, id));

    return NextResponse.json({ order: { ...header, items} });
  } catch (e: any) {
    console.error("ADMIN_ORDER_ID_GET error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to load order" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/orders/:id
 * Body: { status?: string }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();
    const { status } = body || {};

    if (status === undefined) {
      return NextResponse.json({ error: "No changes" }, { status: 400 });
    }

    const [updated] = await db
      .update(orders)
      .set({ ...(status !== undefined ? { status } : {}) })
      .where(eq(orders.id, id))
      .returning({ id: orders.id });

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("ADMIN_ORDER_ID_PATCH error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
