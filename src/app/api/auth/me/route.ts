// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session),
  });

  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isAdmin: Boolean(user.is_admin),
      isBlocked: Boolean(user.is_blocked),
    },
  });
}
