import { getUserFromCookie, getUserById } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import Link from "next/link";

export default async function SellerDashboard() {
  const userId = await getUserFromCookie();

  if (!userId) {
    redirect("/unauthorized");
  }

  const user = await getUserById(userId);

  if (!user || user.role !== "seller") {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-beige-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-beige-200">
        <div className="bg-brown-800 p-6">
          <h1 className="text-3xl font-bold text-beige-100">Seller Dashboard</h1>
          <p className="text-beige-200 mt-1">Welcome back</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/dashboard/seller/products"
              className="block p-6 bg-beige-100 rounded-lg border border-beige-300 hover:border-brown-600 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-brown-700 text-beige-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-brown-800">My Products</h2>
                  <p className="text-brown-600">Manage your product listings</p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/seller/add"
              className="block p-6 bg-beige-100 rounded-lg border border-beige-300 hover:border-brown-600 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-brown-700 text-beige-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-brown-800">Add Product</h2>
                  <p className="text-brown-600">Create new product listing</p>
                </div>
              </div>
            </Link>

            {/* NEW: My Orders link */}
            <Link
              href="/dashboard/seller/orders"
              className="block p-6 bg-beige-100 rounded-lg border border-beige-300 hover:border-brown-600 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-brown-700 text-beige-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2v-7H3v7a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-brown-800">My Orders</h2>
                  <p className="text-brown-600">View orders containing your products</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="pt-6 border-t border-beige-200">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
