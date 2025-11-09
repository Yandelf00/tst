// src/app/brands/page.tsx
import Link from "next/link";
import { db } from "@/db";
import { products } from "@/db/schema/products";
import { sellers } from "@/db/schema/users"; // has userId + companyName
import { desc, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic"; // avoid build-time DB during Netlify build

type BrandRow = {
  id: string;
  name: string;
  productCount: number;
};

async function getBrands(): Promise<BrandRow[]> {
  "use server";
  const rows = await db
    .select({
      id: sellers.userId,
      name: sellers.companyName,
      productCount: sql<number>`count(${products.id})`.as("product_count"),
    })
    .from(sellers)
    .leftJoin(products, eq(products.sellerId, sellers.userId))
    .groupBy(sellers.userId, sellers.companyName)
    .orderBy(desc(sql`count(${products.id})`));

  return rows;
}

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">fournisseurs</h1>
      </header>

      {brands.length === 0 ? (
        <p className="text-stone-600">No brands yet.</p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {brands.map((b) => (
            <li key={b.id}>
              <Link
                href={`/brands/${b.id}`}
                className="block rounded-2xl border bg-white p-4 hover:shadow-md transition"
                title={`${b.name} • ${b.productCount} products`}
              >
                <div className="aspect-square rounded-xl bg-stone-50 grid place-items-center text-stone-500">
                  {/* If you later add a seller logo, render it here */}
                  <span className="text-sm">{b.name}</span>
                </div>
                <div className="mt-3">
                  <h3 className="font-medium line-clamp-1">{b.name}</h3>
                  <p className="text-xs text-stone-500">
                    {b.productCount} products
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
