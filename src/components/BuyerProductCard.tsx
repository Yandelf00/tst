"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CardProduct = {
  id: string;
  name: string;
  price: number;                // HT MAD (integer)
  imageUrl?: string | null;
  sellerName?: string | null;
  sellerImageUrl?: string | null;
  originalPrice?: number | null;
};

export default function BuyerProductCard({ product }: { product: CardProduct }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [sellerImageError, setSellerImageError] = useState(false);

  const handleClick = () => router.push(`/product/${product.id}`);

  const priceHT = Math.round(Number(product.price) || 0);
  const priceTTC = Math.round(priceHT * 1.2);

  async function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    setErr(null);
    setOk(false);
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to add to cart");
      }
      setOk(true);
      setTimeout(() => setOk(false), 1500);
    } catch (e: any) {
      setErr(e?.message || "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="group relative bg-white border border-[#e8e1d4] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-[#D4AF37]"
      onClick={handleClick}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden aspect-square bg-[#fdf6e3]">
        {product.imageUrl && !imageError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-90"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#b89f75]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}

        {/* Quick view indicator */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-white font-medium text-sm bg-[#8B4513] bg-opacity-90 px-3 py-1 rounded-full">
            View Details
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-[#3a2615] line-clamp-2 leading-tight min-h-[2.5rem]">
            {product.name}
          </h3>
        </div>

        {/* Seller */}
        {/* <div className="flex items-center gap-2 mb-3">
          {product.sellerImageUrl && !sellerImageError ? (
            <div className="relative h-6 w-6 rounded-full overflow-hidden border border-[#e8e1d4] flex-shrink-0">
              <img
                src={product.sellerImageUrl}
                alt={product.sellerName ?? "Seller"}
                className="w-full h-full object-cover"
                onError={() => setSellerImageError(true)}
              />
            </div>
          ) : (
            <div className="h-6 w-6 rounded-full bg-[#f5e9cd] flex items-center justify-center flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8B4513"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          )}
          <p className="text-xs text-[#8B4513] truncate">{product.sellerName || "Seller"}</p>
        </div> */}

        {/* Price */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-[#8B4513]">
              MAD {priceTTC}
            </span>
            <span className="text-xs text-gray-500">TTC</span>
          </div>
          <span className="text-sm text-gray-600">HT: MAD {priceHT}</span>
        </div>

        {/* Add to cart button */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {/* Status messages */}
            <div className="h-5 text-xs">
              {ok && <span className="text-green-600 font-medium">✓ Added to cart!</span>}
              {err && <span className="text-red-600">{err}</span>}
            </div>
          </div>

        
        </div>
      </div>


    </div>
  );
}