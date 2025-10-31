// src/app/dashboard/buyer/layout.tsx
import type { ReactNode } from "react";
import BuyerNav from "@/components/nav/BuyerNav";

export default function BuyerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <BuyerNav />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
