// src/app/page.tsx
import Link from "next/link";
import BuyerProductCardPublic from "@/components/BuyerProductCardPublic";

import { db } from "@/db";
import { products } from "@/db/schema/products";
import { sellers } from "@/db/schema/users";              // companyName
import { orderItems } from "@/db/schema/orders";
import { categories } from "@/db/schema/categories";       // <-- adjust path if needed
import { desc, eq, sql } from "drizzle-orm";

type CardProduct = {
  id: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  sellerName: string; // companyName
};

type Brand = { id: string; brandName: string; productCount: number };
type CategoryCard = { id: string; name: string; productCount: number };

async function getBestSelling(): Promise<CardProduct[]> {
  "use server";
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      priceCents: products.price,
      imageUrl: products.imageUrl,
      sellerName: sellers.companyName,
      sold: sql<number>`sum(${orderItems.quantity})`.as("sold"),
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .innerJoin(sellers, eq(products.sellerId, sellers.userId))
    .groupBy(
      products.id,
      products.name,
      products.price,
      products.imageUrl,
      sellers.companyName
    )
    .orderBy(desc(sql`sum(${orderItems.quantity})`))
    .limit(8);

  return rows;
}

async function getExplore(): Promise<CardProduct[]> {
  "use server";
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      priceCents: products.price,
      imageUrl: products.imageUrl,
      sellerName: sellers.companyName,
    })
    .from(products)
    .innerJoin(sellers, eq(products.sellerId, sellers.userId))
    .orderBy(desc(products.createdAt))
    .limit(12);

  return rows;
}

async function getNewArrivals(): Promise<CardProduct[]> {
  "use server";
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      priceCents: products.price,
      imageUrl: products.imageUrl,
      sellerName: sellers.companyName,
      createdAt: products.createdAt,
    })
    .from(products)
    .innerJoin(sellers, eq(products.sellerId, sellers.userId))
    .orderBy(desc(products.createdAt))
    .limit(8);

  return rows.map(({ createdAt, ...rest }) => rest);
}

/** Real brands = sellers who have products */
async function getBrands(): Promise<Brand[]> {
  "use server";
  const rows = await db
    .select({
      id: sellers.userId,
      brandName: sellers.companyName,
      productCount: sql<number>`count(${products.id})`.as("product_count"),
    })
    .from(products)
    .innerJoin(sellers, eq(products.sellerId, sellers.userId))
    .groupBy(sellers.userId, sellers.companyName)
    .orderBy(desc(sql`count(${products.id})`))
    .limit(6);

  return rows;
}

/** Real categories = categories that have products */
async function getCategories(): Promise<CategoryCard[]> {
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
    .orderBy(desc(sql`count(${products.id})`))
    .limit(8);

  return rows;
}

export default async function HomePage() {
  const [bestSelling, explore, newArrivals, brands, cats] = await Promise.all([
    getBestSelling(),
    getExplore(),
    getNewArrivals(),
    getBrands(),
    getCategories(),
  ]);

  const featured =
    bestSelling.find((p) => p.imageUrl) ||
    newArrivals.find((p) => p.imageUrl) ||
    explore.find((p) => p.imageUrl) ||
    null;

  const colors = ["bg-brown-700", "bg-brown-600", "bg-brown-800", "bg-brown-900"];

  return (
    <main className="bg-beige-50">
      {/* HERO (your design) */}
      <section className="bg-black relative isolate  text-white m-7">
        <div className=" mx-auto max-w-7xl px-4 py-16 lg:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold leading-tight">
              Barber-Grade
            </h1>
            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold leading-tight">
              <span className="text-beige-200">Products</span>
            </h1>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/browse"
                className="px-6 py-3 rounded-lg bg-yellow-600 text-brown-900 font-medium hover:bg-yellow-00 transition"
              >
                Join US Now
              </Link>
            </div>
          </div>

          <div className="relative">
  <div className="absolute -top-8 -right-8 w-60 h-60 bg-beige-200/10 rounded-full blur-3xl" />
  <div className="relative rounded-2xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-white/15 aspect-[16/9] bg-brown-700/30">
    <img
      src="/image1.png"       // <-- place image at /public/image1.jpg
      alt="Featured"
      className="w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-brown-900/10 to-transparent" />
  </div>
</div>

        </div>
      </section>

      {/* BRANDS — sellers.companyName */}
      <section className="bg-beige-100 my-10 py-8 shadow-lg transition ">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {brands.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-center p-4 grayscale hover:grayscale-0 transition"
                title={`${b.brandName} • ${b.productCount} products`}
              >
                <span className="text-brown-800 font-medium">
                  {b.brandName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BEST SELLING */}
      <Section
        title="Barber's Choice"
        subtitle="Top selling professional tools"
        moreHref="/best"
      >
        <ProductGrid items={bestSelling} />
      </Section>

 {/* CATEGORIES — horizontal scroll, no scrollbar */}
<section className="mx-auto max-w-7xl px-4 py-12">
  <h2 className="text-2xl font-bold text-brown-800 mb-6">
    Shop by Category
  </h2>

  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
    {cats.map((c, i) => (
      <Link
        key={c.id}
        href={`/category/${c.id}`}
        className={`${colors[i % colors.length]} text-white w-32 h-32 rounded-lg p-4 flex-shrink-0 flex flex-col justify-end hover:opacity-90 transition`}
        title={`${c.name} • ${c.productCount} products`}
      >
        <h3 className="text-sm font-medium">{c.name}</h3>
        <span className="text-white/80 text-xs mt-1">
          {c.productCount} products
        </span>
      </Link>
    ))}
  </div>
</section>




      {/* EXPLORE */}
      <Section
        title="Professional Essentials"
        subtitle="Everything for your barber station"
      >
        <ProductGrid items={explore} />
      </Section>

      {/* PROMO */}
      <section className="bg-brown-800 text-white py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <blockquote className="text-2xl md:text-3xl font-light italic text-beige-200">
            “HAYB provides the quality tools that help me deliver precision cuts
            every time. My clients notice the difference.”
          </blockquote>
          <div className="mt-8">
            <p className="font-medium text-beige-200">Marcus Johnson</p>
            <p className="text-beige-200/80">Master Barber, Shear Excellence</p>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <Section
        title="New Arrivals"
        subtitle="Fresh tools for your collection"
        moreHref="/new"
      >
        <ProductGrid items={newArrivals} />
      </Section>

    
      
    </main>
  );
}

function Section({
  title,
  subtitle,
  children,
  moreHref,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  moreHref?: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-brown-800">
            {title}
          </h2>
          {subtitle && <p className="text-brown-600 mt-1">{subtitle}</p>}
        </div>
        {moreHref && (
          <Link
            href={moreHref}
            className="mt-4 md:mt-0 inline-flex items-center text-sm font-medium text-brown-700 hover:text-brown-900 hover:underline"
          >
            View all
            <svg
              className="ml-1 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        )}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function ProductGrid({ items }: { items: CardProduct[] }) {
  if (!items?.length)
    return (
      <div className="py-12 text-center">
        <p className="text-brown-600">No products available at this time.</p>
      </div>
    );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((p) => (
        <BuyerProductCardPublic
          key={p.id}
          product={{
            id: p.id,
            name: p.name,
            price: p.priceCents,
            imageUrl: p.imageUrl,
            sellerName: p.sellerName,
          }}
        />
      ))}
    </div>
  );
}
