// src/app/admin/products/products-browser.tsx
"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import ProductsTable from "./products-table";

type Row = {
  id: string;
  name: string;
  description: string;
  price: string; // decimal comes as string
  imageUrl: string | null;
  categoryId: string;
  sellerId: string;
  isActive: boolean;
  createdAt: string;
  sellerEmail: string | null;
  sellerName: string | null;
};

export default function ProductsBrowser() {
  const [q, setQ] = useState("");
  const [sellerEmail, setSellerEmail] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [active, setActive] = useState<"all" | "true" | "false">("all");

  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, start] = useTransition();

  const qs = useMemo(() => {
    const u = new URLSearchParams();
    if (q.trim()) u.set("q", q.trim());
    if (sellerEmail.trim()) u.set("sellerEmail", sellerEmail.trim());
    if (sellerId.trim()) u.set("sellerId", sellerId.trim());
    if (categoryId.trim()) u.set("categoryId", categoryId.trim());
    if (active !== "all") u.set("active", active);
    const s = u.toString();
    return s ? `?${s}` : "";
  }, [q, sellerEmail, sellerId, categoryId, active]);

  async function fetchRows() {
    setError(null);
    try {
      const res = await fetch(`/api/admin/products${qs}`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `Failed (${res.status})`);
      }
      const data = await res.json();
      setRows(Array.isArray(data?.products) ? data.products : []);
    } catch (e: any) {
      setRows([]);
      setError(e?.message || "Failed to load products");
    }
  }

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onFilter(e: React.FormEvent) {
    e.preventDefault();
    start(fetchRows);
  }

  return (
    <div className="space-y-3">
      <form onSubmit={onFilter} className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name/description"
          className="border p-2 rounded w-64"
        />
        <input
          value={sellerEmail}
          onChange={(e) => setSellerEmail(e.target.value)}
          placeholder="Seller email"
          className="border p-2 rounded w-56"
        />
        {/* <input
          value={sellerId}
          onChange={(e) => setSellerId(e.target.value)}
          placeholder="Seller ID"
          className="border p-2 rounded w-56"
        /> */}
        {/* <input
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          placeholder="Category ID"
          className="border p-2 rounded w-56"
        /> */}
        <select
          value={active}
          onChange={(e) => setActive(e.target.value as any)}
          className="border p-2 rounded"
        >
          <option value="all">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
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

      <ProductsTable rows={rows} onAfterAction={() => start(fetchRows)} />
    </div>
  );
}
