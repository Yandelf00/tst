// src/app/admin/_components/PendingSellerRow.tsx
"use client";

import { useTransition } from "react";

type Row = {
  sellerId: string;
  companyName: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: string | null;
};

export default function PendingSellerRow({ row }: { row: Row }) {
  const [pending, start] = useTransition();

  const act = (endpoint: "approve" | "reject") =>
    start(async () => {
      await fetch(`/api/admin/sellers/${row.sellerId}/${endpoint}`, { method: "POST" });
      location.reload();
    });

  return (
    <tr className="border-t">
      <td className="p-2">{row.companyName ?? "-"}</td>
      <td className="p-2">{row.contactName ?? row.contactEmail ?? "-"}</td>
      <td className="p-2">{row.contactPhone ?? "-"}</td>
      <td className="p-2 flex gap-2">
        <button
          onClick={() => act("approve")}
          className="px-2 py-1 border rounded bg-green-600 text-white disabled:opacity-50"
          disabled={pending}
        >
          Approve
        </button>
        <button
          onClick={() => act("reject")}
          className="px-2 py-1 border rounded bg-red-600 text-white disabled:opacity-50"
          disabled={pending}
        >
          Reject
        </button>
      </td>
    </tr>
  );
}
