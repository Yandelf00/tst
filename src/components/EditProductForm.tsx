
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // HT MAD
  imageUrl: string | null;
  categoryId: string;
}

export default function EditProductForm({
  product,
  categories,
}: {
  product: Product;
  categories: any[];
}) {
  const router = useRouter();

  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);

  // Price HT in MAD
  const [priceHT, setPriceHT] = useState(String(product.price));
  const ttc = priceHT ? Math.round(Number(priceHT) * 1.2) : 0;

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    product.imageUrl || ""
  );
  const [categoryId, setCategoryId] = useState(product.categoryId.toString());
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError("");

    try {
      let imageUrl = product.imageUrl || "";
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const res = await fetch(`/api/products/edit/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: Number(priceHT), // HT MAD
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
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/products/delete/${product.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/dashboard/seller/products");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete product");
      }
    } catch (err) {
      setError("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          className="w-full border p-2 rounded"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
        />

        {/* Price HT */}
        <div>
          <label className="block text-sm font-medium text-brown-700 mb-1">
            Price (HT) MAD
          </label>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-full border p-2 rounded"
            placeholder="Price HT"
            value={priceHT}
            onChange={(e) => setPriceHT(digitsOnly(e.target.value))}
            required
          />
          <p className="text-xs text-stone-500 mt-1">No commas or dots.</p>
        </div>

        {/* Price TTC (auto) */}
        <div>
          <label className="block text-sm font-medium text-brown-700 mb-1">
            Price (TTC) MAD
          </label>
          <input
            value={ttc ? String(ttc) : ""}
            readOnly
            className="w-full border p-2 rounded bg-stone-50"
          />
          <p className="text-xs text-stone-500 mt-1">Calculated as HT × 1.2</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Product Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border p-2 rounded"
          />
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded border"
              />
            </div>
          )}
        </div>

        <select
          className="w-full border p-2 rounded"
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

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isUpdating}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isUpdating ? "Updating..." : "Update Product"}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Deleting..." : "🗑️ Delete"}
          </button>
        </div>
      </form>
    </div>
  );
}
