import { getUserFromCookie, getUserById } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { products } from "@/db/schema/products";
import { categories } from "@/db/schema/categories";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import EditProductForm from "@/components/EditProductForm";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const userId = await getUserFromCookie();
  if (!userId) redirect("/unauthorized");

  const user = await getUserById(userId);
  if (!user || user.role !== "seller") redirect("/unauthorized");

  // Get the product and verify it belongs to the seller
  const product = await db
    .select()
    .from(products)
    .where(
      and(eq(products.id, params.id), eq(products.sellerId, user.id))
    )
    .limit(1);

  if (product.length === 0) {
    redirect("/dashboard/seller/products");
  }

  const categoryList = await db.select().from(categories);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">✏️ Edit Product</h1>
        <Link
          href="/dashboard/seller/products"
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          ← Back to Products
        </Link>
      </div>
      <EditProductForm
  product={{
    ...product[0],
    price: parseFloat(product[0].price) // ✅ convert string to number
  }}
  categories={categoryList}
/>

    </div>
  );
}
