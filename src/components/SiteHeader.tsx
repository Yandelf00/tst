"use client";

import Link from "next/link";
import { ShoppingCart, UserRound, Menu } from "lucide-react";
import { useState } from "react";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      {/* Announcement bar */}
      <div className="bg-black text-white text-xs">
        <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between">
          <p>
            {" "}
            Grooming Sales - Up to 50% OFF + Free Express Delivery on All
            Orders!
          </p>
        </div>
      </div>

      {/* Main nav */}
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="md:hidden p-2" onClick={() => setOpen((v) => !v)}>
            <Menu className="h-5 w-5" />
          </button>
          <Link
            href="/"
            className="text-lg font-extrabold tracking-tight text-black"
          >
            HAYB
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-stone-700">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <Link href="/browse" className="hover:text-black">
            Products
          </Link>
          <Link href="/brands" className="hover:text-black">
            Brands
          </Link>
          <Link href="/contact" className="hover:text-black">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="flex items-center gap-1 text-sm text-stone-700 hover:text-black"
          >
            <UserRound className="h-4 w-4" /> Login
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-black text-white px-3 py-2 text-sm hover:bg-gray-800"
          >
            Create account
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            className="p-2 text-stone-700 hover:text-black"
          >
            <ShoppingCart className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <nav className="px-4 py-3 flex flex-col gap-2 text-sm">
            <Link href="/" onClick={() => setOpen(false)} className="py-2">
              Home
            </Link>
            <Link
              href="/browse"
              onClick={() => setOpen(false)}
              className="py-2"
            >
              Products
            </Link>
            <Link
              href="/brands"
              onClick={() => setOpen(false)}
              className="py-2"
            >
              Brands
            </Link>
            <Link href="/categories" className="hover:text-black">
              Categories
            </Link>

            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="py-2"
            >
              Contact
            </Link>

          </nav>
        </div>
      )}
    </header>
  );
}
