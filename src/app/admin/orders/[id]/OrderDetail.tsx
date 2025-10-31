// src/app/admin/orders/[id]/OrderDetail.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  sellerId: string;
  sellerEmail: string | null;
  sellerName: string | null;
  quantity: number;
  price: number; // cents
  shipmentStatus: string;
  trackingNumber: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
};

type Order = {
  id: string;
  orderNumber: number | null;
  buyerId: string;
  buyerEmail: string | null;   // kept for compatibility, not displayed
  buyerName: string | null;
  buyerPhone: string | null;   // <-- added
  status: string;
  totalAmount: number; // cents
  createdAt: string;
  items: Item[];
};

function fmtMAD(cents: number | null | undefined) {
  if (cents == null) return "-";
  return `${(cents / 100).toFixed(2)} MAD`;
}

function getStatusBadgeClass(status: string) {
  switch (status.toLowerCase()) {
    case "delivered":
      return "bg-green-100 text-green-800";
    case "shipped":
      return "bg-blue-100 text-blue-800";
    case "confirmed":
    case "paid":
      return "bg-purple-100 text-purple-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function OrderDetail({ initial }: { initial: Order }) {
  const router = useRouter();
  const [status, setStatus] = useState(initial.status);
  const [error, setError] = useState("");

  async function saveStatus() {
    setError("");
    const res = await fetch(`/api/admin/orders/${initial.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.error || "Failed to update status");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#3a2615]">
            Order {initial.orderNumber ? `#${initial.orderNumber}` : initial.id.slice(0, 8)}
          </h1>
          <p className="text-[#8B4513] text-sm mt-1">
            Created: {new Date(initial.createdAt).toLocaleString()}
          </p>
        </div>
        <a 
          href="/admin/orders" 
          className="flex items-center gap-2 text-[#8B4513] hover:text-[#6B3400] transition-colors px-4 py-2 rounded-lg border border-[#e8e1d4] hover:bg-[#f5e9cd]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Orders
        </a>
      </div>

      {/* Order Info Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Buyer Info */}
        <div className="bg-white border border-[#e8e1d4] rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-[#3a2615] mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Buyer Information
          </h2>
          <div className="space-y-2">
            <div>
              <div className="text-sm text-[#8B4513]">Phone</div>
              <div className="font-medium">{initial.buyerPhone ?? "-"}</div>
            </div>
            <div>
              <div className="text-sm text-[#8B4513]">Name</div>
              <div className="font-medium">{initial.buyerName ?? "Not provided"}</div>
            </div>
            <div>
              <div className="text-sm text-[#8B4513]">Buyer ID</div>
              <div className="font-mono text-sm">{initial.buyerId}</div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        {/* <div className="bg-white border border-[#e8e1d4] rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-[#3a2615] mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
            Order Details
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#8B4513]">Total Amount:</span>
              <span className="font-bold text-lg text-[#3a2615]">{fmtMAD(initial.totalAmount)}</span>
            </div>
            
            <div className="pt-3 border-t border-[#e8e1d4]">
              <div className="flex items-center gap-3">
                <label className="text-[#8B4513] font-medium min-w-[60px]">Status:</label>
                <input
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="border border-[#e8e1d4] p-2 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] flex-1"
                  placeholder="pending, paid, shipped, delivered, cancelled"
                />
                <button 
                  onClick={saveStatus} 
                  className="bg-[#8B4513] text-white px-4 py-2 rounded-lg hover:bg-[#6B3400] transition-colors"
                >
                  Save
                </button>
              </div>
              {error && (
                <div className="bg-red-100 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mt-2">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div> */}
      </div>

      {/* Order Items */}
      <div className="bg-white border border-[#e8e1d4] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#e8e1d4]">
          <h2 className="text-lg font-semibold text-[#3a2615] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            Order Items ({initial.items.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#faf7f2]">
              <tr>
                <th className="text-left p-3 text-sm font-semibold text-[#8B4513]">Product</th>
                <th className="text-left p-3 text-sm font-semibold text-[#8B4513]">Seller</th>
                <th className="text-left p-3 text-sm font-semibold text-[#8B4513]">Qty</th>
                <th className="text-left p-3 text-sm font-semibold text-[#8B4513]">Price</th>
                {/* <th className="text-left p-3 text-sm font-semibold text-[#8B4513]">Shipment Status</th> */}
              </tr>
            </thead>
            <tbody>
              {initial.items.map((it) => (
                <tr key={it.id} className="border-t border-[#e8e1d4] hover:bg-[#faf7f2]">
                  <td className="p-3">
                    <div className="font-medium text-[#3a2615]">{it.productName}</div>
                    <div className="text-xs text-[#8B4513]">ID: {it.productId.slice(0, 8)}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{it.sellerEmail ?? it.sellerId.slice(0, 8)}</div>
                    <div className="text-xs text-[#8B4513]">{it.sellerName ?? "No name"}</div>
                  </td>
                  <td className="p-3 font-medium">{it.quantity}</td>
                  <td className="p-3 font-medium">{fmtMAD(it.price)}</td>
                  {/* <td className="p-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(it.shipmentStatus)}`}>
                      {it.shipmentStatus}
                    </span>
                    {it.trackingNumber && (
                      <div className="text-xs text-[#8B4513] mt-1">Track: {it.trackingNumber}</div>
                    )}
                  </td> */}
                </tr>
              ))}
              {initial.items.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-[#8B4513]" colSpan={5}>
                    No items in this order
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
