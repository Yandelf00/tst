// src/app/admin/products/page.tsx
import Link from "next/link";
import ProductsBrowser from "./products-browser";

export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        {/* Optional: Admin create product page later */}
        {/* <Link href="/admin/products/new" className="px-3 py-2 rounded-md border hover:bg-gray-50">+ New Product</Link> */}
      </div>

      <ProductsBrowser />
    </div>
  );
}
