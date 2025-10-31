"use client";

export default function CheckoutButton({ disabled }: { disabled: boolean }) {
  const handleCheckout = async () => {
    try {
      const res = await fetch("/api/orders/create", { method: "POST" }); // <- fix
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Failed to place order");
        return;
      }
      const data = await res.json();
      window.location.href = "/dashboard/buyer/orders";
    } catch (e) {
      alert("Failed to place order");
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={disabled}
      className="mt-4 w-full bg-black text-white py-2 rounded disabled:opacity-60"
    >
      Checkout
    </button>
  );
}
