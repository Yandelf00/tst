// src/app/dashboard/seller/layout.tsx
import type { ReactNode } from "react";
import SellerNav from "@/components/nav/SellerNav";

export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <SellerNav />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
