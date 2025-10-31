"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewUserPage() {
  const router = useRouter();
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const fd = new FormData(e.currentTarget);
    const payload: any = Object.fromEntries(fd.entries());

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.error || "Failed");
      return;
    }

    router.push("/admin/users");
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-4">Create User</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <input name="email" placeholder="Email" className="border p-2" required />
          <input
            name="password"
            placeholder="Temp password"
            type="password"
            className="border p-2"
            required
          />
          <input name="name" placeholder="Name" className="border p-2" required />
          <input name="phone" placeholder="Phone" className="border p-2" required />
        </div>

        <div className="flex gap-3 items-center">
          <label className="font-medium">Role</label>
          <select
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="border p-2"
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
        </div>

        {role === "seller" && (
          <div className="space-y-2 border rounded p-3">
            <input
              name="company_name"
              placeholder="Company name"
              className="border p-2 w-full"
              required
            />
            <input
              name="ice"
              placeholder="ICE (15 digits)"
              className="border p-2 w-full"
              required
            />
            <input
              name="address_url"
              placeholder="Google Maps URL"
              className="border p-2 w-full"
              required
            />
            <input
              name="address"
              placeholder="Address (optional)"
              className="border p-2 w-full"
            />
          </div>
        )}

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-2">
          <button className="border px-4 py-2 rounded">Create</button>
          <a href="/admin/users" className="px-4 py-2 rounded border">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
