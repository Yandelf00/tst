// src/app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema/orders";
import { users } from "@/db/schema/users";
import { and, eq, ilike, or, inArray } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/orders
 * Query params:
 *   q         -> search by order id, orderNumber, buyer email
 *   status    -> filter by orders.status (string)
 *   sellerId  -> filter orders that include items from this seller
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get("q") || "").trim();
    const status = (searchParams.get("status") || "all").trim().toLowerCase();
    const sellerId = (searchParams.get("sellerId") || "").trim();

    // If filtering by seller, first collect order IDs that include that seller.
    let restrictIds: string[] | null = null;
    if (sellerId) {
      const rows = await db
        .select({ oid: orderItems.orderId })
        .from(orderItems)
        .where(eq(orderItems.sellerId, sellerId));
      restrictIds = rows.map((r) => r.oid);
      if (restrictIds.length === 0) {
        return NextResponse.json({ orders: [] });
      }
    }

    const whereClauses: any[] = [];

    if (status && status !== "all") whereClauses.push(eq(orders.status, status));
    if (restrictIds) whereClauses.push(inArray(orders.id, restrictIds));

    // We'll join buyer to search by email if q provided.
    let query = db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        buyerId: orders.buyerId,
        totalAmount: orders.totalAmount, // cents
        status: orders.status,
        createdAt: orders.createdAt,
        buyerEmail: users.email,
        buyerName: users.name,
      })
      .from(orders)
      .leftJoin(users, eq(users.id, orders.buyerId));

    if (q) {
      const like = `%${q}%`;
      whereClauses.push(
        or(
          ilike(users.email, like),
          ilike(orders.id, like)
          // Note: orderNumber is numeric; we still search id/email text above.
        )
      );
      // If q is a number, also match orderNumber exactly
      const qNum = Number(q);
      if (!Number.isNaN(qNum) && Number.isFinite(qNum)) {
        whereClauses.push(eq(orders.orderNumber, qNum as any));
      }
    }

    if (whereClauses.length) {
      query = query.where(and(...whereClauses));
    }

    // newest first (orderNumber grows over time)
    const rows = await query.orderBy(orders.createdAt);

    return NextResponse.json({ orders: rows });
  } catch (e: any) {
    console.error("ADMIN_ORDERS_GET error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to load orders" },
      { status: 500 }
    );
  }
}
