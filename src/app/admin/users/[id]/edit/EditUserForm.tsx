"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditUserForm({
  id,
  initial,
}: {
  id: string;
  initial: { name: string | null; phone: string | null; profile_image_url: string | null };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.name ?? "");
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [img, setImg] = useState(initial.profile_image_url ?? "");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || null,
        phone: phone || null,
        profile_image_url: img || null,
      }),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.error || "Failed to save changes");
      return;
    }
    router.push("/admin/users");
    router.refresh();
  }

  async function onDelete() {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.error || "Failed to delete");
      return;
    }
    router.push("/admin/users");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="border p-2 w-full"
      />
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone"
        className="border p-2 w-full"
      />
      <input
        value={img}
        onChange={(e) => setImg(e.target.value)}
        placeholder="Profile image URL"
        className="border p-2 w-full"
      />

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-2">
        <button className="border px-4 py-2 rounded">Save</button>
        <button
          type="button"
          onClick={onDelete}
          className="border px-4 py-2 rounded"
        >
          Delete
        </button>
        <a href="/admin/users" className="px-4 py-2 rounded border">
          Cancel
        </a>
      </div>
    </form>
  );
}
