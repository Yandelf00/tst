// src/app/api/admin/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema/products";
import { users } from "@/db/schema/users";
import { and, eq, ilike, or } from "drizzle-orm";

// Force Node runtime (pg needs it) and disable caching for fresh results
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/products
 * Query params:
 *   q            -> search in product name/description
 *   sellerEmail  -> filter by seller email (partial ok)
 *   sellerId     -> filter by sellerId (exact)
 *   categoryId   -> filter by categoryId (exact)
 *   active       -> "true" | "false" | "all" (default "all")
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get("q") || "").trim();
    const sellerEmail = (searchParams.get("sellerEmail") || "").trim();
    const sellerId = (searchParams.get("sellerId") || "").trim();
    const categoryId = (searchParams.get("categoryId") || "").trim();
    const active = (searchParams.get("active") || "all").toLowerCase();

    const whereClauses: any[] = [];

    if (q) {
      const like = `%${q}%`;
      whereClauses.push(or(ilike(products.name, like), ilike(products.description, like)));
    }
    if (sellerEmail) {
      const like = `%${sellerEmail}%`;
      whereClauses.push(ilike(users.email, like));
    }
    if (sellerId) whereClauses.push(eq(products.sellerId, sellerId));
    if (categoryId) whereClauses.push(eq(products.categoryId, categoryId));
    if (active === "true") whereClauses.push(eq(products.isActive, true));
    if (active === "false") whereClauses.push(eq(products.isActive, false));

    let query = db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price, // decimal -> returned as string by pg
        imageUrl: products.imageUrl,
        categoryId: products.categoryId,
        sellerId: products.sellerId,
        isActive: products.isActive,
        createdAt: products.createdAt,
        sellerEmail: users.email,
        sellerName: users.name,
      })
      .from(products)
      .leftJoin(users, eq(users.id, products.sellerId));

    if (whereClauses.length) {
      query = query.where(and(...whereClauses));
    }

    // newest first
    const rows = await query.orderBy(products.createdAt);

    return NextResponse.json({ products: rows });
  } catch (e: any) {
    console.error("ADMIN_PRODUCTS_GET error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to load products" },
      { status: 500 }
    );
  }
}
