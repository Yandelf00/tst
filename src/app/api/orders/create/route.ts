// src/app/api/orders/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema/orders";
import { cartItems } from "@/db/schema/cart";
import { products } from "@/db/schema/products";
import { getUserFromCookie } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    const userId = await getUserFromCookie();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Load cart items with product snapshots
    const items = await db
      .select({
        productId: products.id,
        quantity: cartItems.quantity,
        price: products.price, // decimal dollars in DB
        name: products.name,
        imageUrl: products.imageUrl,
        sellerId: products.sellerId,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));

    if (items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const toCents = (v: unknown) => Math.round(Number(v) * 100);

    const totalAmount = items.reduce(
      (sum, it) => sum + toCents(it.price) * it.quantity,
      0
    );

    // Insert order
    const [newOrder] = await db
      .insert(orders)
      .values({
        buyerId: userId,
        totalAmount,
        status: "pending",
      })
      .returning({ id: orders.id, orderNumber: orders.orderNumber });

    // Insert items
    await db.insert(orderItems).values(
      items.map((it) => ({
        orderId: newOrder.id,
        productId: it.productId,
        sellerId: it.sellerId,
        quantity: it.quantity,
        price: toCents(it.price), // cents
        productName: it.name,
        productImage: it.imageUrl ?? null,
      }))
    );

    // Clear cart
    await db.delete(cartItems).where(eq(cartItems.userId, userId));

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
    });
  } catch (err) {
    console.error("Error creating order:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
