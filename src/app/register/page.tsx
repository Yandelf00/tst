"use client";

import Link from "next/link";

export default function RegisterLandingPage() {
  return (
    <div className="p-6 max-w-sm mx-auto text-center">
      <h1 className="text-xl font-bold mb-4">Register As</h1>

      <div className="space-y-4">
        <Link
          href="/register/buyer"
          className="block bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          🧍 Register as Buyer
        </Link>

        <Link
          href="/register/seller"
          className="block bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          🏢 Register as Seller
        </Link>
      </div>
    </div>
  );
}
