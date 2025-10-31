

// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, buyers, sellers } from "@/db/schema/users";
import { and, eq, ilike, or } from "drizzle-orm";
import bcrypt from "bcrypt";
import { isValidICE, isValidMapsUrl } from "@/lib/validators";

// Force Node runtime (pg needs Node), and disable caching
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/users?role=buyer|seller|all&blocked=true|false|all&q=term
 * Filtered list (no joins yet, to stay stable).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = (searchParams.get("role") || "all").toLowerCase();
    const blocked = (searchParams.get("blocked") || "all").toLowerCase();
    const q = (searchParams.get("q") || "").trim();

    const whereClauses: any[] = [];

    if (role === "buyer") whereClauses.push(eq(users.role, "buyer"));
    if (role === "seller") whereClauses.push(eq(users.role, "seller"));

    if (blocked === "true") whereClauses.push(eq(users.is_blocked, true));
    if (blocked === "false") whereClauses.push(eq(users.is_blocked, false));

    if (q) {
      const like = `%${q}%`;
      whereClauses.push(
        or(
          ilike(users.email, like),
          ilike(users.name, like),
          ilike(users.phone, like)
        )
      );
    }

    let query = db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        role: users.role,
        isBlocked: users.is_blocked,
        isAdmin: users.is_admin,
        createdAt: users.created_at,
      })
      .from(users);

    if (whereClauses.length) {
      query = query.where(and(...whereClauses));
    }

    const rows = await query.orderBy(users.created_at);

    return NextResponse.json({ users: rows });
  } catch (e: any) {
    console.error("ADMIN_USERS_GET error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to load users" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users
 * Create buyer or seller with validations. Uses a transaction to avoid partial inserts.
 *
 * Body:
 * {
 *   email, password, role: "buyer" | "seller",
 *   name, phone, profile_image_url?,
 *   company_name?, ice?, address_url?, address?
 * }
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    email,
    password,
    role,
    name,
    phone,
    profile_image_url,
    company_name,
    ice,
    address_url,
    address,
  } = body || {};

  if (!email || !password || !role || !name || !phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 400 });
  }

  // Validate seller-specific fields BEFORE inserting anything
  if (role === "seller") {
    if (!company_name) {
      return NextResponse.json(
        { error: "Company name is required for sellers" },
        { status: 400 }
      );
    }
    if (!ice || !isValidICE(String(ice))) {
      return NextResponse.json({ error: "ICE must be exactly 15 digits" }, { status: 400 });
    }
    if (!address_url || !isValidMapsUrl(String(address_url))) {
      return NextResponse.json(
        {
          error:
            "Please provide a valid Google Maps link (maps.app.goo.gl / google.com/maps)",
        },
        { status: 400 }
      );
    }
  } else if (role !== "buyer") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  // Transaction: create user, then role-specific row
  await db.transaction(async (tx) => {
    const [u] = await tx
      .insert(users)
      .values({
        email,
        password: hashed,
        name,
        phone,
        role,
        profile_image_url: profile_image_url || null,
        is_blocked: false,
        is_admin: false,
        created_at: new Date(),
      })
      .returning({ id: users.id, role: users.role });

    if (role === "seller") {
      await tx.insert(sellers).values({
        userId: u.id,
        companyName: company_name!,
        address: address || "",
        addressUrl: address_url!,
        ice: String(ice),
        isApproved: false,
      });
    } else {
      // buyer
      await tx.insert(buyers).values({ userId: u.id });
    }
  });

  return NextResponse.json({ success: true });
}
