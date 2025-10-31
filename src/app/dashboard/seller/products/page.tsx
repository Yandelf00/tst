import { getUserFromCookie, getUserById } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { products } from "@/db/schema/products";
import { eq } from "drizzle-orm";
import Link from "next/link";

export default async function SellerProductsPage() {
  const userId = await getUserFromCookie();
  if (!userId) redirect("/unauthorized");

  const user = await getUserById(userId);
  if (!user || user.role !== "seller") redirect("/unauthorized");

  const sellerProducts = await db
    .select()
    .from(products)
    .where(eq(products.sellerId, user.id));

  return (
    <div className="min-h-screen bg-beige-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brown-800">My Products</h1>
            <p className="text-brown-600">
              {sellerProducts.length} product{sellerProducts.length !== 1 ? 's' : ''} listed
            </p>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link
              href="/dashboard/seller/add"
              className="bg-brown-700 text-beige-100 px-6 py-2 rounded-lg hover:bg-brown-800 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New
            </Link>
            <Link
              href="/dashboard/seller"
              className="border border-brown-700 text-brown-700 px-6 py-2 rounded-lg hover:bg-beige-100 transition-colors"
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        {sellerProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-beige-200 p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-beige-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-brown-800">No products yet</h3>
            <p className="mt-1 text-brown-600">Get started by adding your first product</p>
            <Link
              href="/dashboard/seller/add"
              className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brown-700 hover:bg-brown-800"
            >
              Add Product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellerProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-beige-200 hover:shadow-md transition-all duration-300">
                {product.imageUrl && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-semibold text-brown-800">{product.name}</h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-beige-100 text-brown-800">
                      ${product.price}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-brown-600 line-clamp-2">{product.description}</p>
                  <div className="mt-4">
                    <Link
                      href={`/dashboard/seller/products/edit/${product.id}`}
                      className="w-full flex items-center justify-center px-4 py-2 border border-brown-700 text-sm font-medium rounded-md text-brown-700 bg-white hover:bg-beige-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
