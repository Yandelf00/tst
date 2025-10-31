import { inArray, eq, ilike, and, gte, lte } from "drizzle-orm";
import { getUserFromCookie, getUserById } from "@/lib/auth";
import { db } from "@/db";
import { products } from "@/db/schema/products";
import { users } from "@/db/schema/users";
import { categories } from "@/db/schema/categories";
import BuyerProductCard from "@/components/BuyerProductCard";
import { LogoutButton } from "@/components/LogoutButton";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function BuyerDashboard({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams; 
  const search   = sp.search   ?? "";
  const category = sp.category ?? "";
  const seller   = sp.seller   ?? "";
  const minPrice = sp.minPrice ?? "";
  const maxPrice = sp.maxPrice ?? "";

  const userId = await getUserFromCookie();
  if (!userId) redirect("/unauthorized");

  const user = await getUserById(userId);
  if (!user || user.role !== "buyer") redirect("/unauthorized");

  const buyerName = user.name || "Buyer";

  const where = [];
  if (search) where.push(ilike(products.name, `%${search}%`));
  if (category) where.push(eq(products.categoryId, category));
  if (seller) where.push(eq(products.sellerId, seller));
  if (minPrice) where.push(gte(products.price, minPrice));
  if (maxPrice) where.push(lte(products.price, maxPrice));

  const rawProducts = await db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      imageUrl: products.imageUrl,
      sellerId: products.sellerId,
    })
    .from(products)
    .where(where.length ? and(...where) : undefined);

  const sellerIds = [...new Set(rawProducts.map((p) => p.sellerId))];
  const sellerUsers = sellerIds.length
    ? await db
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(inArray(users.id, sellerIds))
    : [];

  const productsWithSellers = rawProducts.map((p) => ({
    ...p,
    sellerName:
      sellerUsers.find((s) => s.id === p.sellerId)?.name || "Unknown Seller",
  }));

  const allSellers = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.role, "seller"));

  const allCategories = await db.select().from(categories);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto bg-[#faf7f2] min-h-screen">
     

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-[#e8e1d4] mb-8">
        <h2 className="text-xl font-semibold text-[#3a2615] mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
          Filter Products
        </h2>
        
        <form className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#8B4513] mb-1">Search</label>
            <input
              type="text"
              name="search"
              placeholder="Product name..."
              defaultValue={search}
              className="w-full border border-[#e8e1d4] p-2 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#8B4513] mb-1">Category</label>
            <select
              name="category"
              defaultValue={category}
              className="w-full border border-[#e8e1d4] p-2 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
            >
              <option value="">All Categories</option>
              {allCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#8B4513] mb-1">Seller</label>
            <select
              name="seller"
              defaultValue={seller}
              className="w-full border border-[#e8e1d4] p-2 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
            >
              <option value="">All Sellers</option>
              {allSellers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#8B4513] mb-1">Min Price</label>
            <input
              type="number"
              name="minPrice"
              placeholder="Min"
              defaultValue={minPrice}
              className="w-full border border-[#e8e1d4] p-2 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#8B4513] mb-1">Max Price</label>
            <input
              type="number"
              name="maxPrice"
              placeholder="Max"
              defaultValue={maxPrice}
              className="w-full border border-[#e8e1d4] p-2 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
            />
          </div>
          
          <div className="md:col-span-5 flex justify-end space-x-3 mt-2">
            <button
              type="submit"
              className="bg-[#8B4513] text-white px-6 py-2 rounded-lg hover:bg-[#6B3400] transition-colors duration-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              Apply Filters
            </button>
            
            <Link
              href="/dashboard/buyer"
              className="bg-[#e8e1d4] text-[#8B4513] px-6 py-2 rounded-lg hover:bg-[#d8cdb8] transition-colors duration-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Clear
            </Link>
          </div>
        </form>
      </div>

      {/* Products Grid */}
      <div>
        <h2 className="text-xl font-semibold text-[#3a2615] mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
          Available Products ({productsWithSellers.length})
        </h2>
        
        {productsWithSellers.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-md border border-[#e8e1d4] text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-[#b89f75]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-medium text-[#3a2615] mt-4">No products found</h3>
            <p className="text-[#8B4513] mt-2">Try adjusting your filters to find what you're looking for.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsWithSellers.map((product) => (
              <BuyerProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}