"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProductForm({ categories }: { categories: any[] }) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Price HT in MAD (integer, no separators)
  const [priceHT, setPriceHT] = useState("");
  const ttc = priceHT ? Math.round(Number(priceHT) * 1.2) : 0;

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  function digitsOnly(v: string) {
    return v.replace(/\D/g, "");
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to upload image");
    }

    const data = await response.json();
    return data.imageUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setError("");

    try {
      let imageUrl = "";

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const res = await fetch("/api/products/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: Number(priceHT), // store MAD HT as integer
          imageUrl,
          categoryId,
        }),
      });

      if (res.ok) {
        router.push("/dashboard/seller/products");
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-beige-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-beige-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-1">
              Product Name
            </label>
            <input
              className="w-full border border-beige-300 rounded-lg px-4 py-2 focus:ring-brown-500 focus:border-brown-500"
              placeholder="e.g. Professional Scissors"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full border border-beige-300 rounded-lg px-4 py-2 focus:ring-brown-500 focus:border-brown-500"
              placeholder="Describe your product..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
          </div>

          {/* Price HT */}
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-1">
              Price (HT) MAD
            </label>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="e.g. 120"
              className="w-full border border-beige-300 rounded-lg px-4 py-2 focus:ring-brown-500 focus:border-brown-500"
              value={priceHT}
              onChange={(e) => setPriceHT(digitsOnly(e.target.value))}
              required
            />
            <p className="text-xs text-stone-500 mt-1">No commas or dots.</p>
          </div>

          {/* Auto TTC */}
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-1">
              Price (TTC) MAD
            </label>
            <input
              value={ttc ? String(ttc) : ""}
              readOnly
              className="w-full border border-beige-300 rounded-lg px-4 py-2 bg-stone-50"
            />
            <p className="text-xs text-stone-500 mt-1">Calculated as HT × 1.2</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-700 mb-1">
              Category
            </label>
            <select
              className="w-full border border-beige-300 rounded-lg px-4 py-2 focus:ring-brown-500 focus:border-brown-500"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-700 mb-1">
              Product Image
            </label>
            <div className="mt-1 flex items-center">
              <label className="cursor-pointer">
                <span className="inline-flex items-center px-4 py-2 border border-beige-300 rounded-lg bg-white text-sm font-medium text-brown-700 hover:bg-beige-50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Upload Image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </label>
              {imagePreview && (
                <div className="ml-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg border border-beige-300"
                  />
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4 border-t border-beige-200">
            <button
              type="button"
              onClick={() => router.push("/dashboard/seller/products")}
              className="px-6 py-2 border border-brown-700 text-sm font-medium rounded-md text-brown-700 bg-white hover:bg-beige-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brown-700 hover:bg-brown-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Add Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
