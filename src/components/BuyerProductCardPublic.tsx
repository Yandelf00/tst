"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        setIsLoggedIn(data.isAuthenticated);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleClick = () => {
    if (isLoggedIn) {
      router.push(`/product/${product.id}`);
    } else {
      // Redirect to login page
      router.push('/login');
    }
  };

  const priceHT = Math.round(Number(product.price) || 0);
  const priceTTC = Math.round(priceHT * 1.2);

  return (
    <div
      className="group relative bg-white border border-[#e8e1d4] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-[#d0a933]"
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
      </div>

      {/* Product Details */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-[#3a2615] line-clamp-2 leading-tight min-h-[2.5rem]">
            {product.name}
          </h3>
        </div>

        {/* Price */}
        <div className="mb-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-[#8B4513]">
              MAD {priceTTC}
            </span>
            <span className="text-xs text-gray-500">TTC</span>
          </div>
          <span className="text-sm text-gray-600">HT: MAD {priceHT}</span>
        </div>
      </div>
    </div>
  );
}