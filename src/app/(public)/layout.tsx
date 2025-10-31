// src/app/(public)/layout.tsx
import type { ReactNode } from "react";
import PublicNav from "@/components/nav/PublicNav";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PublicNav />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
