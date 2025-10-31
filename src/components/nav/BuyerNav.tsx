

// src/components/nav/BuyerNav.tsx
import Link from "next/link";
import LogoutButton from "@/components/logout-button";
import Logo from "@/components/Logo";

export default function BuyerNav() {
  const links = [
    { href: "/dashboard/buyer", label: "Dashboard" },
    { href: "/dashboard/buyer/cart", label: "My Cart" },
    { href: "/dashboard/buyer/orders", label: "My Orders" },
  ];

  return (
    <header className="w-full border-b border-[#e8e1d4] bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <Logo />
        <div className="flex items-center gap-4">
          <nav className="flex flex-wrap gap-2">
            {links.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className="px-4 py-2 rounded-lg text-[#8B4513] hover:bg-[#f5e9cd] hover:text-[#6B3400] transition-colors duration-200 font-medium"
              >
                {it.label}
              </Link>
            ))}
          </nav>
          <div className="border-l border-[#e8e1d4] h-6 mx-2"></div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}