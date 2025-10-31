// src/app/admin/users/users-browser.tsx
"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import UsersTable from "./users-table";

type Row = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: "buyer" | "seller";
  isBlocked: boolean;
  isAdmin: boolean;
  createdAt: string;
  sellerId?: string | null;
  companyName?: string | null;
  addressUrl?: string | null;
  ice?: string | null;
  buyerId?: string | null;
};

export default function UsersBrowser() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState<"all" | "buyer" | "seller">("all");
  const [blocked, setBlocked] = useState<"all" | "true" | "false">("all");

  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, start] = useTransition();

  const qs = useMemo(() => {
    const u = new URLSearchParams();
    if (q.trim()) u.set("q", q.trim());
    if (role !== "all") u.set("role", role);
    if (blocked !== "all") u.set("blocked", blocked);
    const s = u.toString();
    return s ? `?${s}` : "";
  }, [q, role, blocked]);

  async function fetchRows() {
    setError(null);
    try {
      const res = await fetch(`/api/admin/users${qs}`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `Failed (${res.status})`);
      }

      const data = await res.json();
      setRows(Array.isArray(data?.users) ? data.users : []);
    } catch (e: any) {
      setRows([]);
      setError(e?.message || "Failed to load users");
    }
  }

  useEffect(() => {
    fetchRows(); // initial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onFilter(e: React.FormEvent) {
    e.preventDefault();
    start(fetchRows);
  }

  return (
    <div className="space-y-3">
      <form onSubmit={onFilter} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search email/name/phone"
          className="border p-2 rounded w-72"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          className="border p-2 rounded"
        >
          <option value="all">All roles</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
        </select>
        <select
          value={blocked}
          onChange={(e) => setBlocked(e.target.value as any)}
          className="border p-2 rounded"
        >
          <option value="all">All</option>
          <option value="false">Active</option>
          <option value="true">Blocked</option>
        </select>
        <button className="border px-3 rounded" disabled={isPending}>
          {isPending ? "Filtering..." : "Filter"}
        </button>
        <button
          type="button"
          className="border px-3 rounded"
          onClick={() => start(fetchRows)}
          disabled={isPending}
        >
          Refresh
        </button>
      </form>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <UsersTable rows={rows as any} />
    </div>
  );
}
