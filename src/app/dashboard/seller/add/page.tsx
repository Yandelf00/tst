// src/app/dashboard/seller/add/page.tsx

import { getUserFromCookie, getUserById } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { categories } from "@/db/schema/categories";
import AddProductForm from "@/components/AddProductForm";
import Link from "next/link";

export default async function AddProductPage() {
  const userId = await getUserFromCookie();
  if (!userId) redirect("/unauthorized");

  const user = await getUserById(userId);
  if (!user || user.role !== "seller") redirect("/unauthorized");

  const categoryList = await db.select().from(categories);

  return (
    <div className="min-h-screen bg-beige-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-beige-200">
        <div className="bg-brown-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-beige-100">➕ Add New Product</h1>
              <p className="text-beige-200 mt-1">Create your product listing</p>
            </div>
            <Link 
              href="/dashboard/seller/products" 
              className="flex items-center space-x-1 text-beige-100 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span>Back to Products</span>
            </Link>
          </div>
        </div>
        
        <div className="p-6">
          <AddProductForm categories={categoryList} />
        </div>
      </div>
    </div>
  );
}