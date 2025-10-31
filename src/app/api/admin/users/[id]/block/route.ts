import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

// POST /api/admin/users/:id/block  { block: boolean }
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { block } = await req.json();
  if (typeof block !== "boolean") {
    return NextResponse.json({ error: "Missing 'block' boolean" }, { status: 400 });
  }

  const [u] = await db
    .update(users)
    .set({ is_blocked: block })
    .where(eq(users.id, id))
    .returning({ id: users.id, is_blocked: users.is_blocked });

  if (!u) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, is_blocked: u.is_blocked });
}
