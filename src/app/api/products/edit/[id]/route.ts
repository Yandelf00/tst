import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema/products";
import { getUserFromCookie, getUserById } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, imageUrl, categoryId, price } = body;

    const userId = await getUserFromCookie();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getUserById(userId);
    if (!user || user.role !== "seller") {
      return NextResponse.json({ error: "Forbidden: Not a seller" }, { status: 403 });
    }

    const existing = await db
      .select()
      .from(products)
      .where(and(eq(products.id, params.id), eq(products.sellerId, user.id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // sanitize price -> HT MAD integer
    const priceHT = Number(String(price).replace(/\D/g, ""));
    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!description) missingFields.push("description");
    if (!categoryId) missingFields.push("categoryId");
    if (!priceHT) missingFields.push("price");

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    await db
      .update(products)
      .set({
        name,
        description,
        price: priceHT, // HT MAD
        imageUrl,
        categoryId,
        updatedAt: new Date(),
      })
      .where(and(eq(products.id, params.id), eq(products.sellerId, user.id)));

    return NextResponse.json({ success: true, message: "Product updated successfully" });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

