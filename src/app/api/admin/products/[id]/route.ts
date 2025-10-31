// src/app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema/products";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/admin/products/:id  -> fetch one
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const [row] = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        imageUrl: products.imageUrl,
        categoryId: products.categoryId,
        sellerId: products.sellerId,
        isActive: products.isActive,
        createdAt: products.createdAt,
        sellerEmail: users.email,
        sellerName: users.name,
      })
      .from(products)
      .leftJoin(users, eq(users.id, products.sellerId))
      .where(eq(products.id, id))
      .limit(1);

    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ product: row });
  } catch (e: any) {
    console.error("ADMIN_PRODUCTS_ID_GET error:", e);
    return NextResponse.json({ error: "Failed to load product" }, { status: 500 });
  }
}

// PATCH /api/admin/products/:id  -> edit fields
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();

    const {
      name,
      description,
      price, // accept string or number; stored as decimal string
      imageUrl,
      categoryId,
      isActive,
      sellerId, // optional: allow reassigning product to a different seller
    } = body || {};

    const patch: Record<string, any> = {};
    if (name !== undefined) patch.name = name;
    if (description !== undefined) patch.description = description;
    if (price !== undefined) patch.price = String(price);
    if (imageUrl !== undefined) patch.imageUrl = imageUrl || null;
    if (categoryId !== undefined) patch.categoryId = categoryId;
    if (isActive !== undefined) patch.isActive = Boolean(isActive);
    if (sellerId !== undefined) patch.sellerId = sellerId;

    const [updated] = await db
      .update(products)
      .set(patch)
      .where(eq(products.id, id))
      .returning({ id: products.id });

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("ADMIN_PRODUCTS_ID_PATCH error:", e);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE /api/admin/products/:id  -> delete product
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const [del] = await db.delete(products).where(eq(products.id, id)).returning({
      id: products.id,
    });
    if (!del) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("ADMIN_PRODUCTS_ID_DELETE error:", e);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
