
// src/lib/auth.ts
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

/** Read the session cookie (userId) in a server-safe way. */
export async function getUserFromCookie() {
  const cookieStore = await cookies(); // Next 15 requires await
  const session = cookieStore.get("session");
  return session?.value || null;
}

/** Fetch the user by id (returns full user row from DB). */
export async function getUserById(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  return user ?? null;
}
