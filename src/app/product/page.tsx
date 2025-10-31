

import { db } from "@/db";
import { products } from "@/db/schema/products";
import { categories } from "@/db/schema/categories";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

export default async function ProductDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const product = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      imageUrl: products.imageUrl,
      categoryId: products.categoryId,
      sellerId: products.sellerId,
    })
    .from(products)
    .where(eq(products.id, id))
    .then((res) => res[0]);

  if (!product) notFound();

  const sellerUser = await db
    .select({ id: users.id, name: users.name, profileImage: users.profile_image_url })
    .from(users)
    .where(eq(users.id, product.sellerId))
    .then((r) => r[0]);

  const category = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.id, product.categoryId))
    .then((r) => r[0]);

  const priceHT = Math.round(Number(product.price) || 0);
  const priceTTC = Math.round(priceHT * 1.2);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-[#faf7f2] min-h-screen">
      <Link
        href="/dashboard/buyer"
        className="inline-flex items-center mb-6 text-sm text-[#8B4513] hover:text-[#D4AF37] transition-colors duration-200 font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Products
      </Link>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#e8e1d4]">
        <div className="md:flex">
          {/* Product Image */}
          <div className="md:w-1/2 p-6 flex items-center justify-center bg-[#fdf6e3]">
            {product.imageUrl ? (
              <div className="relative w-full h-80 md:h-96 overflow-hidden rounded-xl">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="object-contain w-full h-full"
                />
              </div>
            ) : (
              <div className="w-full h-80 md:h-96 bg-[#f5e9cd] rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-[#b89f75]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="md:w-1/2 p-6 md:p-8 space-y-6">
            <div>
              <span className="inline-block px-3 py-1 text-xs font-semibold text-[#8B4513] bg-[#f5e9cd] rounded-full">
                {category?.name || "Uncategorized"}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-[#3a2615] mt-3 mb-2">{product.name}</h1>
              
              <div className="flex items-center mt-4">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span className="ml-2 text-sm text-gray-500">(24 reviews)</span>
              </div>
            </div>

            <div className="border-t border-b border-[#e8e1d4] py-5">
              <div className="flex items-center">
                <div className="mr-4">
                  <span className="text-2xl font-bold text-[#8B4513]">MAD {priceTTC}</span>
                  <span className="block text-sm text-gray-600">TTC</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">HT: MAD {priceHT}</span>
                </div>
              </div>
            </div>

            {product.description && (
              <div>
                <h2 className="text-lg font-semibold text-[#3a2615] mb-3">Product Description</h2>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            <div className="flex items-center text-sm text-gray-700">
              <div className="flex-shrink-0 mr-3">
                {sellerUser?.profileImage ? (
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={sellerUser.profileImage}
                    alt={sellerUser?.name || "Seller"}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-[#f5e9cd] flex items-center justify-center">
                    <span className="text-[#8B4513] font-medium">
                      {sellerUser?.name ? sellerUser.name.charAt(0).toUpperCase() : "U"}
                    </span>
                  </div>
                )}
              </div>
             {/* < <div>
                <span className="block text-gray-500">Sold by</span>
                <span className="font-medium text-[#3a2615]">{sellerUser?.name || "Unknown Seller"}</span>
              </div>> */}
            </div>

            <AddToCartButton productId={product.id} />
          </div>
        </div>
      </div>
    </div>
  );
}