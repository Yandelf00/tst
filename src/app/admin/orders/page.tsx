// src/app/admin/orders/page.tsx
import OrdersBrowser from "./orders-browser";

export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Orders</h1>
      <OrdersBrowser />
    </div>
  );
}
