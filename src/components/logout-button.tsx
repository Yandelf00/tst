// src/components/logout-button.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton({
  className = "px-3 py-2 rounded border",
  label = "Logout",
}: {
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={onLogout} className={className} disabled={loading}>
      {loading ? "…" : label}
    </button>
  );
}
