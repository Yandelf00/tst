"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import OrdersTable from "./orders-table";

type Row = {
  id: string;
  orderNumber: number | null;
  buyerEmail: string | null;
  buyerName: string | null;
  status: string;
  totalAmount: number; // cents
  createdAt: string;
};

export default function OrdersBrowser() {
  const [q, setQ] = useState("");               // id/email/orderNumber
  const [status, setStatus] = useState("all");  // free text; DB stores string
  const [sellerId, setSellerId] = useState(""); // filter by seller participation

  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, start] = useTransition();

  const qs = useMemo(() => {
    const u = new URLSearchParams();
    if (q.trim()) u.set("q", q.trim());
    if (status !== "all") u.set("status", status);
    if (sellerId.trim()) u.set("sellerId", sellerId.trim());
    const s = u.toString();
    return s ? `?${s}` : "";
  }, [q, status, sellerId]);

  async function fetchRows() {
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders${qs}`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `Failed (${res.status})`);
      }
      const data = await res.json();
      setRows(Array.isArray(data?.orders) ? data.orders : []);
    } catch (e: any) {
      setRows([]);
      setError(e?.message || "Failed to load orders");
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
    <div className="space-y-4">
      <form onSubmit={onFilter} className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-[#8B4513] mb-1">Search</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Order ID, email, or number"
            className="border border-[#e8e1d4] p-2 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] w-72"
          />
        </div>
        
        <div className="flex flex-col">
          <label className="text-sm font-medium text-[#8B4513] mb-1">Seller ID</label>
          <input
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            placeholder="Filter by seller"
            className="border border-[#e8e1d4] p-2 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] w-60"
          />
        </div>
        
        <div className="flex flex-col">
          <label className="text-sm font-medium text-[#8B4513] mb-1">Status</label>
          <input
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="Order status"
            className="border border-[#e8e1d4] p-2 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] w-60"
          />
        </div>
        
        <button 
          className="bg-[#8B4513] text-white px-4 py-2 rounded-lg hover:bg-[#6B3400] transition-colors disabled:opacity-60 h-10"
          disabled={isPending}
        >
          {isPending ? "Filtering..." : "Apply Filters"}
        </button>
        
        <button
          type="button"
          className="border border-[#e8e1d4] text-[#8B4513] px-4 py-2 rounded-lg hover:bg-[#f5e9cd] transition-colors disabled:opacity-60 h-10"
          onClick={() => start(fetchRows)}
          disabled={isPending}
        >
          Refresh
        </button>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <OrdersTable rows={rows} />
    </div>
  );
}