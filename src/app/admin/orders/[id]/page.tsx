// src/app/admin/orders/[id]/page.tsx
import OrderDetail from "./OrderDetail";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

async function loadOrder(id: string) {
  const hdrs = headers();
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const host = hdrs.get("host") ?? "localhost:3000";
  const base = `${proto}://${host}`;

  const res = await fetch(`${base}/api/admin/orders/${id}`, {
    headers: { cookie: hdrs.get("cookie") ?? "" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.order ?? null;
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await loadOrder(params.id);
  if (!order) return <div className="p-6">Order not found</div>;
  return <OrderDetail initial={order} />;
}
