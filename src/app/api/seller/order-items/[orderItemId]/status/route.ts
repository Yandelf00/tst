// import { NextResponse } from "next/server";
// import { db } from "@/db";
// import { orderItems } from "@/db/schema/orders";
// import { eq, and } from "drizzle-orm";
// import { getUserFromCookie, getUserById } from "@/lib/auth";

// export async function POST(
//   req: Request,
//   { params }: { params: { orderItemId: string } }
// ) {
//   try {
//     const userId = await getUserFromCookie();
//     if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     const user = await getUserById(userId);
//     if (!user || user.role !== "seller") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

//     const body = await req.json().catch(() => ({}));
//     const action: "confirm" | "ship" | "cancel" = body?.action;
//     const trackingNumber: string | undefined = body?.trackingNumber;

//     if (!["confirm", "ship", "cancel"].includes(action)) {
//       return NextResponse.json({ error: "Invalid action" }, { status: 400 });
//     }

//     const [item] = await db
//       .select({
//         id: orderItems.id,
//         sellerId: orderItems.sellerId,
//         shipmentStatus: orderItems.shipmentStatus,
//       })
//       .from(orderItems)
//       .where(eq(orderItems.id, params.orderItemId))
//       .limit(1);

//     if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
//     if (item.sellerId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

//     if (item.shipmentStatus === "shipped" || item.shipmentStatus === "delivered") {
//       return NextResponse.json({ error: "Already shipped/delivered" }, { status: 400 });
//     }

//     let patch: Partial<typeof orderItems.$inferInsert> = {};
//     if (action === "confirm") {
//       patch = { shipmentStatus: "confirmed" };
//     } else if (action === "cancel") {
//       patch = { shipmentStatus: "cancelled" };
//     } else if (action === "ship") {
//       patch = { 
//         shipmentStatus: "shipped", 
//         trackingNumber: trackingNumber || null, 
//         shippedAt: new Date() 
//       };
//     }

//     const [updated] = await db
//       .update(orderItems)
//       .set(patch)
//       .where(and(eq(orderItems.id, params.orderItemId), eq(orderItems.sellerId, user.id)))
//       .returning({
//         id: orderItems.id,
//         shipmentStatus: orderItems.shipmentStatus,
//         trackingNumber: orderItems.trackingNumber,
//         shippedAt: orderItems.shippedAt,
//       });

//     return NextResponse.json({ ok: true, item: updated });
//   } catch (e) {
//     console.error(e);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }



// API route - removed shipping functionality
import { NextResponse } from "next/server";
import { db } from "@/db";
import { orderItems } from "@/db/schema/orders";
import { eq, and } from "drizzle-orm";
import { getUserFromCookie, getUserById } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { orderItemId: string } }
) {
  try {
    const userId = await getUserFromCookie();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await getUserById(userId);
    if (!user || user.role !== "seller") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action: "confirm" | "cancel" = body?.action;

    if (!["confirm", "cancel"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const [item] = await db
      .select({
        id: orderItems.id,
        sellerId: orderItems.sellerId,
        shipmentStatus: orderItems.shipmentStatus,
      })
      .from(orderItems)
      .where(eq(orderItems.id, params.orderItemId))
      .limit(1);

    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (item.sellerId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (item.shipmentStatus === "delivered") {
      return NextResponse.json({ error: "Already delivered" }, { status: 400 });
    }

    let patch: Partial<typeof orderItems.$inferInsert> = {};
    if (action === "confirm") {
      patch = { shipmentStatus: "confirmed" };
    } else if (action === "cancel") {
      patch = { shipmentStatus: "cancelled" };
    }

    const [updated] = await db
      .update(orderItems)
      .set(patch)
      .where(and(eq(orderItems.id, params.orderItemId), eq(orderItems.sellerId, user.id)))
      .returning({
        id: orderItems.id,
        shipmentStatus: orderItems.shipmentStatus,
      });

    return NextResponse.json({ ok: true, item: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}