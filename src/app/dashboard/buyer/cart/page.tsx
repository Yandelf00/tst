import { db } from "@/db";
import { cartItems } from "@/db/schema/cart";
import { products } from "@/db/schema/products";
import { eq } from "drizzle-orm";
import { getUserFromCookie, getUserById } from "@/lib/auth";
import { redirect } from "next/navigation";
import CartItemRow from "@/components/CartItemRow";
import Link from "next/link";
import CheckoutButton from "@/components/CheckoutButton";

export default async function BuyerCartPage() {
  const userId = await getUserFromCookie();
  if (!userId) redirect("/unauthorized");

  const user = await getUserById(userId);
  if (!user || user.role !== "buyer") redirect("/unauthorized");

  // Fetch cart items + product info
  const rows = await db
    .select({
      cartId: cartItems.id,
      productId: products.id,
      quantity: cartItems.quantity,
      name: products.name,
      price: products.price,
      imageUrl: products.imageUrl,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, user.id));

  const lineItems = rows.map((r) => {
    const priceNum = parseFloat(String(r.price));
    return { ...r, priceNum, lineTotal: priceNum * r.quantity };
  });

  const total = lineItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const tax = total * 0.2; // 20% tax
  const finalTotal = total + tax;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto bg-[#faf7f2] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 p-4 bg-white rounded-xl shadow-md border border-[#e8e1d4]">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold text-[#3a2615] flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            Your Shopping Cart
          </h1>
          <p className="text-[#8B4513] mt-1 ml-11">
            {lineItems.length} item{lineItems.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        <Link
          href="/dashboard/buyer"
          className="flex items-center text-[#8B4513] hover:text-[#6B3400] transition-colors duration-200 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Continue Shopping
        </Link>
      </div>

      {lineItems.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-md border border-[#e8e1d4] text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-[#b89f75]" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          </svg>
          <h3 className="text-xl font-medium text-[#3a2615] mt-4">Your cart is empty</h3>
          <p className="text-[#8B4513] mt-2 mb-6">Add some products to get started!</p>
          <Link
            href="/dashboard/buyer"
            className="inline-flex items-center bg-[#8B4513] text-white px-6 py-3 rounded-lg hover:bg-[#6B3400] transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-md border border-[#e8e1d4]">
              <h2 className="text-lg font-semibold text-[#3a2615] mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                Cart Items
              </h2>
              <div className="space-y-4">
                {lineItems.map((item) => (
                  <CartItemRow key={item.cartId} item={item} />
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-md border border-[#e8e1d4] p-6 h-fit">
            <h2 className="text-xl font-semibold text-[#3a2615] mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 5.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 10l1.293-1.293zm4 0a1 1 0 010 1.414L11.586 10l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Order Summary
            </h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">MAD {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (20%)</span>
                <span className="font-medium">MAD {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-[#e8e1d4]">
                <span className="text-lg font-semibold text-[#3a2615]">Total</span>
                <span className="text-lg font-bold text-[#8B4513]">MAD {finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <CheckoutButton disabled={lineItems.length === 0} />
            
            <p className="text-xs text-gray-500 mt-4 text-center">
              By completing your purchase you agree to our Terms of Service
            </p>
          </div>
        </div>
      )}
    </div>
  );
}