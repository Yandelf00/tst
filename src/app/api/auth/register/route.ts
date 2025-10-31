import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, buyers, sellers } from "@/db/schema/users";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

function isValidICE(v: string) { return /^\d{15}$/.test(v); }
function isValidMapsUrl(u: string) {
  if (!u || typeof u !== "string") return false;
  try {
    const url = new URL(u);
    const host = url.hostname.toLowerCase();
    const okHost =
      host === "maps.app.goo.gl" ||
      host === "goo.gl" ||
      host === "www.google.com" ||
      host === "google.com";
    const okPath = url.pathname.startsWith("/maps") || host === "maps.app.goo.gl";
    return okHost && okPath;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const {
      email,
      password,
      role,
      name,
      phone,
      profile_image_url, // comes from upload API result
      company_name,
      ice,               // NEW
      address_url,       // NEW (Google Maps link)
      address            // legacy (optional)
    } = await req.json();

    if (!email || !password || !role || !name || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [insertedUser] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name,
        phone,
        role,
        profile_image_url: profile_image_url || null, // <- we store the URL returned by upload
        is_blocked: false,
        is_admin: false,
        created_at: new Date(),
      })
      .returning({ id: users.id });

    if (role === "seller") {
      if (!company_name) {
        return NextResponse.json({ error: "Company name is required for sellers" }, { status: 400 });
      }
      if (!ice || !isValidICE(String(ice))) {
        return NextResponse.json({ error: "ICE must be exactly 15 digits" }, { status: 400 });
      }
      if (!address_url || !isValidMapsUrl(String(address_url))) {
        return NextResponse.json(
          { error: "Please provide a valid Google Maps link (maps.app.goo.gl / google.com/maps)" },
          { status: 400 }
        );
      }

      await db.insert(sellers).values({
        userId: insertedUser.id,
        companyName: company_name,
        address: address || "",   // legacy column — can be empty
        addressUrl: address_url,  // NEW maps link
        ice: String(ice),         // NEW
        isApproved: false,
      });
    } else if (role === "buyer") {
      await db.insert(buyers).values({ userId: insertedUser.id });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error during registration" }, { status: 500 });
  }
}
