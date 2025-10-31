"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function digitsOnly(v: string) { return v.replace(/\D/g, ""); }
function isValidICE(v: string) { return /^\d{15}$/.test(v); }
function isValidMapsUrl(u: string) {
  try {
    const url = new URL(u);
    const host = url.hostname.toLowerCase();
    const okHost =
      host === "maps.app.goo.gl" ||
      host === "goo.gl" ||
      host === "www.google.com" ||
      host === "google.com";
    const okPath = url.pathname.startsWith("/maps") || host === "maps.app.goo.gl";
    return okHost && okPath;
  } catch { return false; }
}

export default function SellerRegisterPage() {
  const router = useRouter();

  // required by your users table + API
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // seller-specific
  const [companyName, setCompanyName] = useState("");
  const [ice, setICE] = useState("");            // NEW
  const [mapsUrl, setMapsUrl] = useState("");    // NEW

  // profile image (file upload)
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const iceOk = isValidICE(ice);
  const urlOk = isValidMapsUrl(mapsUrl);

  const handleFile = (f: File | null) => {
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!iceOk) return setError("ICE must be exactly 15 digits.");
    if (!urlOk) return setError("Please paste a valid Google Maps link.");

    setSubmitting(true);

    try {
      // 1) Upload profile image if present
      let profileImageUrl = "";
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const uploadRes = await fetch("/api/upload/profile", {
          method: "POST",
          body: fd,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData?.error || "Image upload failed");
        }
        profileImageUrl = uploadData.url; // e.g. /uploads/123_name.png
      }

      // 2) Register seller (send ICE + Maps URL)
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // important!
        body: JSON.stringify({
          email,
          password,
          role: "seller",
          name,
          phone,
          profile_image_url: profileImageUrl || null,
          company_name: companyName,
          ice,                 // NEW
          address_url: mapsUrl // NEW (Google Maps link)
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Registration failed");
      }

      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-4">Register as Seller</h1>

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

        {/* Profile image upload (FILE) */}
        <div className="space-y-2">
          <label className="text-sm">Profile Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            className="w-full border p-2"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded"
            />
          )}
        </div>

        <input
          type="text"
          placeholder="Company Name"
          className="w-full border p-2"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />

        {/* ICE */}
        <div>
          <input
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={15}
            placeholder="ICE (15 digits)"
            className="w-full border p-2"
            value={ice}
            onChange={(e) => setICE(digitsOnly(e.target.value))}
            required
          />
          <p className={`text-xs mt-1 ${iceOk ? "text-green-600" : "text-stone-600"}`}>
            Enter 15 digits. {iceOk ? "Looks good." : ""}
          </p>
        </div>

        {/* Google Maps link */}
        <div>
          <input
            type="url"
            placeholder="Company location — paste Google Maps link"
            className="w-full border p-2"
            value={mapsUrl}
            onChange={(e) => setMapsUrl(e.target.value)}
            required
          />
          <p className={`text-xs mt-1 ${urlOk ? "text-green-600" : "text-stone-600"}`}>
            Accepts links like maps.app.goo.gl / google.com/maps.
          </p>
          {urlOk && (
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="inline-block mt-1 text-xs text-blue-600 underline">
              Open in Google Maps ↗
            </a>
          )}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          className="bg-green-600 text-white px-4 py-2 w-full rounded disabled:opacity-60"
          disabled={submitting || !iceOk || !urlOk}
        >
          {submitting ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
