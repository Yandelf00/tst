import { Product } from "@/types";

export default function ProductCard({ product }: { product: Product }) {
  const priceHT = Math.round(Number(product.price) || 0);
  const priceTTC = Math.round(priceHT * 1.2);

  return (
    <div className="border border-beige-300 rounded-xl p-4 bg-white hover:shadow-lg transition-all duration-300 group">
      {product.imageUrl && (
        <div className="relative overflow-hidden rounded-lg mb-4 h-48">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brown-900/30 to-transparent" />
        </div>
      )}
      <h2 className="text-xl font-bold text-yellow-800 mb-2">{product.name}</h2>
      <p className="text-sm text-yellow-600 mb-3 line-clamp-2">{product.description}</p>

      <div className="flex justify-between items-center">
        <div className="text-yellow-700">
          <div className="text-base font-semibold">
            MAD {priceTTC} <span className="text-xs font-normal text-stone-600">TTC</span>
          </div>
          <div className="text-xs text-stone-600">HT: MAD {priceHT}</div>
        </div>
        <span className="text-xs bg-beige-200 text-yellow-800 px-2 py-1 rounded-full">
          In Stock
        </span>
      </div>
    </div>
  );
}
