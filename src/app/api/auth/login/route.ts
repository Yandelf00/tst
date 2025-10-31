import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, buyers } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { verifyOnPartner } from "@/lib/externalAuth";

const EXTERNAL_CHECK_ON = process.env.BUYER_EXTERNAL_CHECK !== "off";

async function issueSession(user: any) {
  const isAdmin = Boolean(user.is_admin);

  const res = NextResponse.json({
    success: true,
    userId: user.id,
    role: user.role,
    isAdmin,
  });

  res.cookies.set("session", String(user.id), {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  res.cookies.set("role_hint", isAdmin ? "admin" : user.role ?? "buyer", {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  // ------------------------------
  // If the user already exists locally:
  // ------------------------------
  if (user) {
    const isAdmin = Boolean(user.is_admin);

    // Admins: local bcrypt check only
    if (isAdmin) {
      if (!(await bcrypt.compare(password, user.password))) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      return issueSession(user);
    }

    // Sellers: local bcrypt check only
    if (user.role === "seller") {
      if (!(await bcrypt.compare(password, user.password))) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      return issueSession(user);
    }

    // Buyers:
    // - If EXTERNAL_CHECK_ON is OFF => treat like local auth (bcrypt)
    // - If ON => verify against partner (skip local bcrypt)
    if (user.role === "buyer") {
      if (!EXTERNAL_CHECK_ON) {
        if (!(await bcrypt.compare(password, user.password))) {
          return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }
        return issueSession(user);
      }

      const verdict = await verifyOnPartner(email, password);
      if (verdict === "ok") return issueSession(user);
      if (verdict === "unavailable") {
        return NextResponse.json(
          { error: "External verification is temporarily unavailable. Please try again shortly." },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: "Make sure you are registered on the partner website." },
        { status: 403 }
      );
    }

    // Unknown role
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // ------------------------------
  // If the user does NOT exist locally:
  // - When EXTERNAL_CHECK_ON is OFF => do NOT JIT-create; return 401.
  // - When ON => verify on partner and JIT-provision buyer if OK.
  // ------------------------------
  if (!EXTERNAL_CHECK_ON) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const verdict = await verifyOnPartner(email, password);
  if (verdict !== "ok") {
    if (verdict === "unavailable") {
      return NextResponse.json(
        { error: "External verification is temporarily unavailable. Please try again shortly." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Make sure you are registered on the partner website." },
      { status: 403 }
    );
  }

  // Create a "shadow" local buyer. We do not store/need the partner password.
  const placeholderHash = await bcrypt.hash(randomUUID(), 10);

  const [created] = await db
    .insert(users)
    .values({
      email,
      password: placeholderHash, // never used for buyers when external check is ON
      name: email.split("@")[0],
      phone: "",
      role: "buyer",
      profile_image_url: null,
      is_blocked: false,
      is_admin: false,
      created_at: new Date(),
    })
    .returning({
      id: users.id,
      email: users.email,
      role: users.role,
      is_admin: users.is_admin,
    });

  // create buyer row
  await db.insert(buyers).values({ userId: created.id });

  return issueSession(created);
}
