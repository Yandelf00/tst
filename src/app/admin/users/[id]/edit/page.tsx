import Link from "next/link";
import UsersTable from "../../users-table";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

type SearchParams = { q?: string; role?: string; blocked?: string };

function buildQuery(sp: SearchParams) {
  const qs = new URLSearchParams();
  if (sp.q) qs.set("q", sp.q);
  if (sp.role && sp.role !== "all") qs.set("role", sp.role);
  if (sp.blocked && sp.blocked !== "all") qs.set("blocked", sp.blocked);
  return qs.toString();
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const q = searchParams?.q ?? "";
  const role = (searchParams?.role ?? "all").toLowerCase();
  const blocked = (searchParams?.blocked ?? "all").toLowerCase();

  // Build absolute URL + forward cookies so the protected API works server-side
  const hdrs = await headers();
  const proto = hdrs.get("x-forwarded-proto") || "http";
  const host = hdrs.get("host")!;
  const base = `${proto}://${host}`;
  const qs = buildQuery({ q, role, blocked });

  let rows: any[] = [];
  try {
    const res = await fetch(`${base}/api/admin/users?${qs}`, {
      headers: { cookie: hdrs.get("cookie") || "" },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      rows = Array.isArray(data?.users) ? data.users : [];
    }
  } catch {
    // fall through with empty rows
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Link
          href="/admin/users/new"
          className="px-3 py-2 rounded-md border hover:bg-gray-50"
        >
          + New User
        </Link>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          placeholder="Search email/name/phone"
          defaultValue={q}
          className="border p-2 rounded w-72"
        />
        <select name="role" defaultValue={role} className="border p-2 rounded">
          <option value="all">All roles</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
        </select>
        <select name="blocked" defaultValue={blocked} className="border p-2 rounded">
          <option value="all">All</option>
          <option value="false">Active</option>
          <option value="true">Blocked</option>
        </select>
        <button className="border px-3 rounded">Filter</button>
      </form>

      <UsersTable rows={rows as any} />
    </div>
  );
}
