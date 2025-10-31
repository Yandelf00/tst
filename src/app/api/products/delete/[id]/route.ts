import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema/products";
import { getUserFromCookie, getUserById } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserFromCookie();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserById(userId);
    if (!user || user.role !== "seller") {
      return NextResponse.json({ error: "Forbidden: Not a seller" }, { status: 403 });
    }

    // Verify the product exists and belongs to the seller
    const existingProduct = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.id, params.id),
          eq(products.sellerId, user.id)
        )
      )
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete the product
    await db
      .delete(products)
      .where(
        and(
          eq(products.id, params.id),
          eq(products.sellerId, user.id)
        )
      );

    return NextResponse.json({ 
      success: true, 
      message: "Product deleted successfully" 
    });

  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
} 