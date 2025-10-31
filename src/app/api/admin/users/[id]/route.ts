import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

// PATCH /api/admin/users/:id  { name?, phone?, profile_image_url? }
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await req.json();
  const { name, phone, profile_image_url } = body || {};

  const [u] = await db
    .update(users)
    .set({
      ...(name !== undefined ? { name } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(profile_image_url !== undefined ? { profile_image_url } : {}),
    })
    .where(eq(users.id, id))
    .returning({ id: users.id });

  if (!u) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}

// DELETE /api/admin/users/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const [u] = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id });
  if (!u) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
