// scripts/make_admin.ts
import "dotenv/config";
import { db } from "@/db"; // if this fails, see NOTE below to switch to a relative path
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx scripts/make_admin.ts <email>");
    process.exit(1);
  }

  const updated = await db
    .update(users)
    .set({ is_admin: true })
    .where(eq(users.email, email))
    .returning({
      id: users.id,
      email: users.email,
      is_admin: users.is_admin,
    });

  if (updated.length === 0) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  console.log("User promoted to admin:", updated[0]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

