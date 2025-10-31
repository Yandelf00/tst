
// src/app/layout.tsx
import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Barber Shop",
  description: "Marketplace",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
