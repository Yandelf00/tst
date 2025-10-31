// src/app/admin/categories/categories-table.tsx
"use client";

type Row = { id: string; name: string };

export default function CategoriesTable({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-auto border rounded">
      <table className="min-w-[600px] w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">ID</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} className="border-t">
              <td className="p-2">{c.name}</td>
              <td className="p-2 text-gray-500">{c.id}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td className="p-4 text-center text-gray-500" colSpan={2}>
                No categories
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
