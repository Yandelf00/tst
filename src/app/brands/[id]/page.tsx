// src/app/brands/[id]/page.tsx
import Link from "next/link";
import { db } from "@/db";
import { products } from "@/db/schema/products";
import { sellers } from "@/db/schema/users";
import { and, desc, eq, like, sql } from "drizzle-orm";
import BuyerProductCard from "@/components/BuyerProductCard";

export const revalidate = 60;

const PAGE_SIZE = 24;

type PageProps = {
  params: { id: string }; // sellers.userId
  searchParams: { page?: string; q?: string; sort?: string };
};

async function getBrand(id: string) {
  "use server";
  const [row] = await db
    .select({ id: sellers.userId, name: sellers.companyName })
    .from(sellers)
    .where(eq(sellers.userId, id))
    .limit(1);
  return row ?? null;
}

async function getProductsByBrand(opts: {
  sellerId: string;
  q?: string;
  sort?: string;
  page: number;
}) {
  "use server";
  const { sellerId, q, sort, page } = opts;

  const where = and(
    eq(products.sellerId, sellerId),
    q ? like(products.name, `%${q}%`) : undefined
  );

  const orderBy = (() => {
    switch (sort) {
      case "price-asc":
        return products.price;
      case "price-desc":
        return desc(products.price);
      case "newest":
      default:
        return desc(products.createdAt);
    }
  })();

  const offset = (page - 1) * PAGE_SIZE;

  const items = await db
    .select({
      id: products.id,
      name: products.name,
      // NOTE: BuyerProductCard expects cents. Your homepage currently
      // passes products.price directly. We will keep it consistent here.
      // If your DB value is dollars, convert to cents instead:
      // priceCents: sql<number>`(${products.price} * 100)::int`,
      priceCents: products.price as unknown as number,
      imageUrl: products.imageUrl,
      sellerName: sql<string>`${(await import("@/db/schema/users")).sellers.companyName}`,
    })
    .from(products)
    .innerJoin(sellers, eq(products.sellerId, sellers.userId))
    .where(where)
    .orderBy(orderBy)
    .limit(PAGE_SIZE)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(products)
    .where(where);

  return { items, total };
}

export default async function BrandPage({ params, searchParams }: PageProps) {
  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const q = searchParams.q;
  const sort = searchParams.sort || "newest";

  const brand = await getBrand(params.id);
  if (!brand) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-2xl font-semibold">Brand not found</h1>
        <p className="mt-2 text-stone-600">
          The brand you’re looking for does not exist.
        </p>
        <Link href="/brands" className="mt-4 inline-block text-blue-600 underline">
          Back to Brands
        </Link>
      </main>
    );
  }

  const { items, total } = await getProductsByBrand({
    sellerId: brand.id,
    q,
    sort,
    page,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{brand.name}</h1>
          <p className="text-stone-500">{total} products</p>
        </div>

        {/* Filters */}
        <form className="flex items-center gap-2" action="">
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search in this brand..."
            className="border rounded-xl px-3 py-2 w-56"
          />
          <select
            name="sort"
            defaultValue={sort}
            className="border rounded-xl px-3 py-2"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
          <button className="px-4 py-2 rounded-xl bg-black text-white">
            Apply
          </button>
          <Link href="/brands" className="px-4 py-2 rounded-xl border">
            All Brands
          </Link>
        </form>
      </div>

      {/* Products */}
      {items.length === 0 ? (
        <p className="text-stone-600">No products found for this brand.</p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((p) => (
            <li key={p.id}>
              <BuyerProductCard
                product={{
                  id: p.id,
                  name: p.name,
                  price: p.priceCents as unknown as number,
                  imageUrl: p.imageUrl ?? undefined,
                  sellerName: brand.name,
                }}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }).map((_, i) => {
            const n = i + 1;
            const sp = new URLSearchParams();
            if (q) sp.set("q", q);
            if (sort) sp.set("sort", sort);
            sp.set("page", String(n));
            return (
              <Link
                key={n}
                href={`?${sp.toString()}`}
                className={`px-3 py-2 rounded-lg border ${
                  n === page ? "bg-black text-white" : "bg-white"
                }`}
              >
                {n}
              </Link>
            );
          })}
        </nav>
      )}
    </main>
  );
}
