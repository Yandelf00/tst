// src/app/admin/products/[id]/edit/page.tsx
import EditProductForm from "./EditProductForm";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

async function loadProduct(id: string) {
  const hdrs = headers();
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const host = hdrs.get("host") ?? "localhost:3000";
  const base = `${proto}://${host}`;

  const res = await fetch(`${base}/api/admin/products/${id}`, {
    headers: { cookie: hdrs.get("cookie") ?? "" },
    cache: "no-store",
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data?.product ?? null;
}

export default async function AdminEditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await loadProduct(params.id);
  if (!product) return <div className="p-6">Product not found</div>;

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">Edit Product</h1>
      <EditProductForm initial={product} />
    </div>
  );
}
