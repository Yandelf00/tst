// src/app/admin/layout.tsx
import type { ReactNode } from "react";
import { getUserFromCookie, getUserById } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic"; // avoid edge caching of auth UI

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const userId = await getUserFromCookie();
  if (!userId) {
    redirect("/unauthorized");
    return null;
  }

  const user = await getUserById(userId);
  if (!user?.is_admin) {
    redirect("/unauthorized");
    return null;
  }

  return (
    <div className="min-h-screen flex bg-[#faf7f2]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#e8e1d4] p-6 space-y-8 shadow-md">
        {/* Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-[#e8e1d4]">
          <div className="bg-[#D4AF37] p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-lg text-[#3a2615]">Admin Panel</div>
            <div className="text-sm text-[#8B4513]">Welcome, {user.name}</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <Link 
            href="/admin" 
            className="flex items-center gap-3 p-3 rounded-lg text-[#3a2615] hover:bg-[#f5e9cd] hover:text-[#8B4513] transition-colors duration-200 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D4AF37] group-hover:text-[#8B4513]" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span>Dashboard</span>
          </Link>

          <Link 
            href="/admin/orders" 
            className="flex items-center gap-3 p-3 rounded-lg text-[#3a2615] hover:bg-[#f5e9cd] hover:text-[#8B4513] transition-colors duration-200 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D4AF37] group-hover:text-[#8B4513]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
            <span>Orders</span>
          </Link>

          <Link 
            href="/admin/products" 
            className="flex items-center gap-3 p-3 rounded-lg text-[#3a2615] hover:bg-[#f5e9cd] hover:text-[#8B4513] transition-colors duration-200 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D4AF37] group-hover:text-[#8B4513]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
            <span>Products</span>
          </Link>

          <Link 
            href="/admin/users" 
            className="flex items-center gap-3 p-3 rounded-lg text-[#3a2615] hover:bg-[#f5e9cd] hover:text-[#8B4513] transition-colors duration-200 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D4AF37] group-hover:text-[#8B4513]" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            <span>Users</span>
          </Link>

          <Link 
            href="/admin/categories" 
            className="flex items-center gap-3 p-3 rounded-lg text-[#3a2615] hover:bg-[#f5e9cd] hover:text-[#8B4513] transition-colors duration-200 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D4AF37] group-hover:text-[#8B4513]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M17 10a1 1 0 01-1 1H4a1 1 0 010-2h12a1 1 0 011 1zM4 8a1 1 0 100-2 1 1 0 000 2zm0 4a1 1 0 100 2 1 1 0 000-2zm13-1a1 1 0 10-2 0 1 1 0 002 0zm-1 5a1 1 0 110-2 1 1 0 010 2zM4 16a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span>Categories</span>
          </Link>

          
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="bg-white rounded-xl shadow-md border border-[#e8e1d4] p-6 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}