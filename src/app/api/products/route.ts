import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema/products";
import { getUserFromCookie, getUserById } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    name,
    description,
    price,
    imageUrl,
    categoryId,
  } = body;

  const userId = await getUserFromCookie();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserById(userId);
  if (!user || user.role !== "seller") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!name || !description || !price || !categoryId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await db.insert(products).values({
    name,
    description,
    price,
    imageUrl,
    categoryId,
    sellerId: user.id,
    isActive: true,
    createdAt: new Date(),
  });

  return NextResponse.json({ success: true });
}
