import { NextResponse } from "next/server";
import { db } from "@/db";
import { cartItems } from "@/db/schema/cart";
import { and, eq } from "drizzle-orm";
import { getUserFromCookie, getUserById } from "@/lib/auth";

export async function DELETE(req: Request) {
  try {
    const userId = await getUserFromCookie();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getUserById(userId);
    if (!user || user.role !== "buyer") {
      return NextResponse.json({ error: "Only buyers can remove items" }, { status: 403 });
    }

    const { productId } = await req.json();

    await db
      .delete(cartItems)
      .where(and(eq(cartItems.userId, user.id), eq(cartItems.productId, productId)));

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
