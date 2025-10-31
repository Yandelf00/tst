import { NextResponse } from "next/server";
import { db } from "@/db";
import { cartItems } from "@/db/schema/cart";
import { products } from "@/db/schema/products";
import { getUserFromCookie } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    // 1) Check if user is logged in
    const userId = await getUserFromCookie();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Read and validate body
    const { productId, quantity } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }
    const qty = quantity && quantity > 0 ? quantity : 1;

    // 3) Check if product exists
    const product = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, productId))
      .then((res) => res[0]);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 4) If already in cart → update quantity, else → insert
    const existing = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));

    if (existing.length > 0) {
      await db
        .update(cartItems)
        .set({ quantity: existing[0].quantity + qty })
        .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
    } else {
      await db.insert(cartItems).values({
        userId,
        productId,
        quantity: qty,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
