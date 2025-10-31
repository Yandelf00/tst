"use client";

type Row = {
  id: string;
  orderNumber: number | null;
  buyerEmail: string | null;
  buyerName: string | null;
  status: string;
  totalAmount: number; // cents
  createdAt: string;
};

function fmtMAD(cents: number | null | undefined) {
  if (cents == null) return "-";
  return `${(cents / 100).toFixed(2)} MAD`;
}

export default function OrdersTable({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-auto border border-[#e8e1d4] rounded-xl shadow-sm">
      <table className="min-w-[900px] w-full text-sm">
        <thead className="bg-[#faf7f2]">
          <tr>
            <th className="text-left p-3 text-sm font-semibold text-[#8B4513]">Order</th>
            <th className="text-left p-3 text-sm font-semibold text-[#8B4513]">Buyer</th>
            <th className="text-left p-3 text-sm font-semibold text-[#8B4513]">Total</th>
            <th className="text-left p-3 text-sm font-semibold text-[#8B4513]">Created</th>
            <th className="text-left p-3 text-sm font-semibold text-[#8B4513]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.id} className="border-t border-[#e8e1d4] hover:bg-[#faf7f2] transition-colors">
              <td className="p-3 font-medium text-[#3a2615]">
                {o.orderNumber ? `#${o.orderNumber}` : o.id.slice(0, 8)}
              </td>
              <td className="p-3">
                <div className="font-medium">{o.buyerEmail ?? "-"}</div>
                <div className="text-xs text-[#8B4513]">{o.buyerName ?? ""}</div>
              </td>
              <td className="p-3 font-semibold text-[#3a2615]">
                {fmtMAD(o.totalAmount)}
              </td>
              <td className="p-3 text-[#8B4513]">
                {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "-"}
              </td>
              <td className="p-3">
                <a
                  href={`/admin/orders/${o.id}`}
                  className="inline-flex items-center px-3 py-1.5 text-sm bg-[#8B4513] text-white rounded-lg hover:bg-[#6B3400] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  View
                </a>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td className="p-6 text-center text-[#8B4513]" colSpan={5}>
                <div className="flex flex-col items-center justify-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#b89f75] mb-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  </svg>
                  No orders found
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}