// src/components/site-nav.tsx
import Link from "next/link";
import LogoutButton from "@/components/logout-button";
import { getUserFromCookie, getUserById } from "@/lib/auth";

type NavLink = { href: string; label: string };

function Links({ items }: { items: NavLink[] }) {
  return (
    <nav className="flex flex-wrap gap-3">
      {items.map((it) => (
        <Link
          key={it.href + it.label}
          href={it.href}
          className="px-3 py-2 rounded hover:bg-gray-50 border"
        >
          {it.label}
        </Link>
      ))}
    </nav>
  );
}

export default async function SiteNav() {
  const userId = await getUserFromCookie();
  const user = userId ? await getUserById(userId) : null;

  const isAuthed = !!user;
  const isAdmin = !!user?.is_admin;
  const role = isAdmin ? "admin" : user?.role ?? null;

  // Public (before login)
  const publicLinks: NavLink[] = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/companies", label: "Companies" },
    { href: "/categories", label: "Categories" },
    { href: "/contact", label: "Contact us" },
    { href: "/login", label: "Login" },
  ];

  // Buyer
  const buyerLinks: NavLink[] = [
    { href: "/dashboard/buyer", label: "Dashboard" },
    { href: "/cart", label: "My Cart" },      // adjust if your path differs
    { href: "/orders", label: "My Orders" },  // adjust if your path differs
  ];

  // Seller (keep minimal to avoid breaking existing flows)
  const sellerLinks: NavLink[] = [
    { href: "/dashboard/seller", label: "Dashboard" },
  ];

  // Admin
  const adminLinks: NavLink[] = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/categories", label: "Categories" },
  ];

  let leftLinks: NavLink[] = publicLinks;
  let showLogout = false;

  if (isAuthed) {
    showLogout = true;
    if (isAdmin) leftLinks = adminLinks;
    else if (role === "seller") leftLinks = sellerLinks;
    else if (role === "buyer") leftLinks = buyerLinks;
  }

  return (
    <header className="w-full border-b bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold text-lg">
          Barber Shop
        </Link>

        <div className="flex items-center gap-3">
          <Links items={leftLinks} />
          {showLogout && <LogoutButton />}
        </div>
      </div>
    </header>
  );
}
