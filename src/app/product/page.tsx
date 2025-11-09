export const dynamic = "force-static";
import Link from "next/link";

export default function ProductIndexPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <p className="text-gray-700 mb-6">
        Browse featured products on the home page or open a direct product link.
      </p>
      <Link href="/" className="text-brown-700 hover:underline">Go to Home</Link>
    </div>
  );
}
