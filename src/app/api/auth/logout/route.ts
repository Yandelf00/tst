// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("session", "", { path: "/", expires: new Date(0) });
  response.cookies.set("role_hint", "", { path: "/", expires: new Date(0) });
  return response;
}
