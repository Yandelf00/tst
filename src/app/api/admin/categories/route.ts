// src/app/api/admin/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema/categories";
import { eq, ilike } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/categories
 * Returns all categories (id, name), ordered by name.
 */
export async function GET() {
  try {
    const rows = await db
      .select({
        id: categories.id,
        name: categories.name,
      })
      .from(categories);
    // If you want alphabetic order and your schema doesn't have an index, it's still fine:
    rows.sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json({ categories: rows });
  } catch (e: any) {
    console.error("ADMIN_CATEGORIES_GET error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to load categories" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/categories
 * Body: { name: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { name } = (await req.json()) || {};
    const trimmed = (name ?? "").trim();

    if (!trimmed) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Optional: prevent duplicates (case-insensitive)
    const existing = await db.query.categories.findFirst({
      where: ilike(categories.name, trimmed),
    });
    if (existing) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 409 }
      );
    }

    const [created] = await db
      .insert(categories)
      .values({ name: trimmed })
      .returning({ id: categories.id, name: categories.name });

    return NextResponse.json({ success: true, category: created });
  } catch (e: any) {
    console.error("ADMIN_CATEGORIES_POST error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to create category" },
      { status: 500 }
    );
  }
}
