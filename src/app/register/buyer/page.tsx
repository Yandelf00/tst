"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BuyerRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState(""); // ✅ phone state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    let profileImageUrl = "";

    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload/profile", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      profileImageUrl = uploadData.url;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        role: "buyer",
        name, // ✅ send name
        phone, // ✅ send phone
        profile_image_url: profileImageUrl,
      }),
    });

    if (res.ok) {
      router.push("/login");
    } else {
      const data = await res.json();
      setError(data.error || "Registration failed");
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-4">Register as Buyer</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          className="w-full border p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Phone Number"
          className="w-full border p-2"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/*"
          className="w-full border p-2"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button className="bg-blue-600 text-white px-4 py-2 w-full rounded">
          Register
        </button>
      </form>
    </div>
  );
}
