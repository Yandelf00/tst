// src/app/categories/page.tsx
import Link from "next/link";
import { db } from "@/db";
import { products } from "@/db/schema/products";
import { categories } from "@/db/schema/categories";
import { desc, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic"; // avoid build-time DB during Netlify build

type CategoryRow = {
  id: string;
  name: string;
  productCount: number;
};

async function getCategories(): Promise<CategoryRow[]> {
  "use server";
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      productCount: sql<number>`count(${products.id})`.as("product_count"),
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id, categories.name)
    .orderBy(desc(sql`count(${products.id})`));

  return rows;
}

export default async function CategoriesPage() {
  const cats = await getCategories();

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Categories</h1>
      </header>

      {cats.length === 0 ? (
        <p className="text-stone-600">No categories yet.</p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {cats.map((c) => (
            <li key={c.id}>
              <Link
                href={`/category/${c.id}`}
                className="block rounded-2xl border bg-white p-4 hover:shadow-md transition"
                title={`${c.name} • ${c.productCount} products`}
              >
                <div className="aspect-square rounded-xl bg-stone-50 grid place-items-center text-stone-700">
                  <span className="text-sm font-medium">{c.name}</span>
                </div>
                <div className="mt-3">
                  <h3 className="font-medium line-clamp-1">{c.name}</h3>
                  <p className="text-xs text-stone-500">
                    {c.productCount} products
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
