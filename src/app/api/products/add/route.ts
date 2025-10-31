import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema/products";
import { getUserFromCookie, getUserById } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();

  const { name, description, imageUrl, categoryId, price } = body;

  const userId = await getUserFromCookie();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUserById(userId);
  if (!user || user.role !== "seller") {
    return NextResponse.json({ error: "Forbidden: Not a seller" }, { status: 403 });
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

  await db.insert(products).values({
    name,
    description,
    price: priceHT, // store MAD HT
    imageUrl,
    categoryId,
    sellerId: user.id,
    isActive: true,
    createdAt: new Date(),
  });

  return NextResponse.json({ success: true });
}
