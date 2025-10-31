// src/app/admin/categories/categories-browser.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import CategoriesTable from "./categories-table";

type Row = { id: string; name: string };

export default function CategoriesBrowser() {
  const [rows, setRows] = useState<Row[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, start] = useTransition();

  async function load() {
    setError(null);
    try {
      const res = await fetch("/api/admin/categories", {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `Failed (${res.status})`);
      }
      const data = await res.json();
      setRows(Array.isArray(data?.categories) ? data.categories : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load categories");
      setRows([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required");
      return;
    }

    start(async () => {
      try {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: trimmed }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || `Failed (${res.status})`);
        }
        setName("");
        await load();
      } catch (e: any) {
        setError(e?.message || "Failed to create");
      }
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onCreate} className="flex gap-2 items-center">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="border p-2 rounded w-72"
        />
        <button className="border px-3 py-2 rounded" disabled={isPending}>
          {isPending ? "Adding..." : "Add category"}
        </button>
      </form>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <CategoriesTable rows={rows} />
    </div>
  );
}
