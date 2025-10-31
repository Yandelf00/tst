"use client";

import { useTransition } from "react";

type Row = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: "buyer" | "seller";
  isBlocked: boolean;
  isAdmin: boolean;
  createdAt: string;
  sellerId: string | null;
  companyName: string | null;
  addressUrl: string | null;
  ice: string | null;
  buyerId: string | null;
};

export default function UsersTable({ rows }: { rows: Row[] }) {
  const [isPending, start] = useTransition();

  const toggleBlock = (id: string, block: boolean) => {
    start(async () => {
      await fetch(`/api/admin/users/${id}/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ block }),
      });
      location.reload();
    });
  };

  return (
    <div className="overflow-auto border rounded">
      <table className="min-w-[900px] w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-2">Email</th>
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">Role</th>
            <th className="text-left p-2">Blocked</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.name}</td>
              <td className="p-2">{u.isAdmin ? "admin" : u.role}</td>
              <td className="p-2">
                {u.role === "seller" ? u.companyName ?? "(pending)" : "-"}
              </td>
              <td className="p-2">{u.isBlocked ? "Yes" : "No"}</td>
              <td className="p-2 flex gap-2">
                <a
                  href={`/admin/users/${u.id}/edit`}
                  className="px-2 py-1 border rounded"
                >
                  Edit
                </a>
                <button
                  onClick={() => toggleBlock(u.id, !u.isBlocked)}
                  className="px-2 py-1 border rounded"
                  disabled={isPending}
                >
                  {u.isBlocked ? "Unblock" : "Block"}
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td className="p-4 text-center text-gray-500" colSpan={6}>
                No users
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
