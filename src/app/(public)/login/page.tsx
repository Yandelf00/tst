
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Login failed");
        return;
      }

      const data = await res.json();

      // ✅ NEW: if the user is an admin, go straight to /admin
      if (data.isAdmin === true) {
        router.replace("/admin");
        return;
      }

      // ✅ Keep your existing behavior for buyer/seller
      if (data.role === "buyer") {
        router.push("/dashboard/buyer");
      } else if (data.role === "seller") {
        router.push("/dashboard/seller");
      } else {
        setError("Unknown user role");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-[#e8e1d4] p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-[#D4AF37] p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#3a2615]">Welcome Back</h1>
          <p className="text-[#8B4513] mt-2">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#8B4513] mb-2">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border border-[#e8e1d4] p-3 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8B4513] mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full border border-[#e8e1d4] p-3 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8B4513] text-white py-3 rounded-lg hover:bg-[#6B3400] transition-colors duration-200 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Information Text */}
        <div className="mt-8 p-4 bg-[#f5e9cd] rounded-lg border border-[#e8d9b5]">
          <h3 className="font-semibold text-[#8B4513] mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Important Information
          </h3>
          <p className="text-sm text-[#8B4513]">
            • If you're a buyer, make sure you already have an account in BarberChat<br/>
            • If you're a seller, please contact the admin for account access
          </p>
        </div>

        {/* Additional Links */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[#8B4513]">
            Need help?{" "}
            <Link href="/contact" className="text-[#D4AF37] hover:text-[#8B4513] hover:underline transition-colors">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}