


// src/components/nav/PublicNav.tsx
import Link from "next/link";
import Logo from "@/components/Logo";

export default function PublicNav() {
  const links = [
    { href: "/", label: "Home" },
    { href: "/brands", label: "Companies" }, 
    { href: "/login", label: "Login" },
  ];

  return (
    <header className="w-full border-b border-[#e8e1d4] bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <Logo />
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
      </div>
    </header>
  );
}