// src/app/admin/products/products-table.tsx
"use client";

import { useTransition } from "react";

type Row = {
  id: string;
  name: string;
  description: string;
  price: string; // decimal as string
  imageUrl: string | null;
  categoryId: string;
  sellerId: string;
  isActive: boolean;
  createdAt: string;
  sellerEmail: string | null;
  sellerName: string | null;
};

export default function ProductsTable({
  rows,
  onAfterAction,
}: {
  rows: Row[];
  onAfterAction: () => void;
}) {
  const [isPending, start] = useTransition();

  const onDelete = (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    start(async () => {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error || "Failed to delete");
        return;
      }
      onAfterAction();
    });
  };

  return (
    <div className="overflow-auto border rounded">
      <table className="min-w-[1000px] w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">Seller</th>
            <th className="text-left p-2">Price</th>
            <th className="text-left p-2">Active</th>
            <th className="text-left p-2">Created</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-2">
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-gray-500 truncate max-w-[360px]">
                  {p.description}
                </div>
              </td>
              <td className="p-2">
                <div>{p.sellerEmail || p.sellerId}</div>
                <div className="text-xs text-gray-500">{p.sellerName}</div>
              </td>
              <td className="p-2">{p.price}</td>
              <td className="p-2">{p.isActive ? "Yes" : "No"}</td>
              <td className="p-2">{new Date(p.createdAt).toLocaleString()}</td>
              <td className="p-2 flex gap-2">
                <a
                  href={`/admin/products/${p.id}/edit`}
                  className="px-2 py-1 border rounded"
                >
                  Edit
                </a>
                {/* <button
                  onClick={() => onDelete(p.id)}
                  className="px-2 py-1 border rounded"
                  disabled={isPending}
                >
                  Delete
                </button> */}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td className="p-4 text-center text-gray-500" colSpan={6}>
                No products
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
