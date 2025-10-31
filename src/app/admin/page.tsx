// src/app/admin/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserFromCookie, getUserById } from "@/lib/auth";

export const dynamic = "force-dynamic";

const tiles = [

  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/categories", label: "Categories" },
];

export default async function AdminPage() {
  // Gate: only admins
  const uid = await getUserFromCookie();
  if (!uid) redirect("/unauthorized");
  const me = await getUserById(uid);
  if (!me || !(me.is_admin || me.role === "admin")) redirect("/unauthorized");

  return (
    <div className="p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-gray-600">Quick access to all admin sections.</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {tiles.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className="
              group relative overflow-hidden rounded-2xl border border-amber-200/60
              bg-gradient-to-br from-amber-50 to-white p-8
              shadow-sm hover:shadow-xl transition
              focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300
            "
          >
            {/* subtle decorative glow */}
            <div className="pointer-events-none absolute -top-16 -right-20 h-56 w-56 rounded-full bg-amber-200/30 blur-3xl opacity-70 group-hover:opacity-100 transition" />
            <div className="relative flex items-center gap-3">
              <span className="text-xl md:text-2xl font-semibold text-amber-900">
                {label}
              </span>
              <span
                className="
                  ml-auto text-amber-800/60 text-lg
                  translate-x-0 group-hover:translate-x-1 transition
                "
              >
               
              </span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
