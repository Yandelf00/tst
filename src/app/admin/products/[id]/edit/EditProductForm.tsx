// // src/app/admin/products/[id]/edit/EditProductForm.tsx
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";

// type Product = {
//   id: string;
//   name: string;
//   description: string;
//   price: string;
//   imageUrl: string | null;
//   categoryId: string;
//   sellerId: string;
//   isActive: boolean;
//   sellerEmail?: string | null;
//   sellerName?: string | null;
// };

// export default function EditProductForm({ initial }: { initial: Product }) {
//   const router = useRouter();
//   const [name, setName] = useState(initial.name);
//   const [description, setDescription] = useState(initial.description);
//   const [price, setPrice] = useState(initial.price);
//   const [imageUrl, setImageUrl] = useState(initial.imageUrl || "");
//   const [categoryId, setCategoryId] = useState(initial.categoryId);
//   const [sellerId, setSellerId] = useState(initial.sellerId);
//   const [isActive, setIsActive] = useState(initial.isActive);
//   const [error, setError] = useState("");

//   async function onSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setError("");

//     const res = await fetch(`/api/admin/products/${initial.id}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         name,
//         description,
//         price,
//         imageUrl: imageUrl || null,
//         categoryId,
//         isActive,
//         sellerId,
//       }),
//     });

//     if (!res.ok) {
//       const j = await res.json().catch(() => ({}));
//       setError(j?.error || "Failed to update");
//       return;
//     }

//     router.push("/admin/products");
//     router.refresh();
//   }

//   return (
//     <form onSubmit={onSubmit} className="space-y-3">
//       <div className="grid md:grid-cols-2 gap-3">
//         <input
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           placeholder="Name"
//           className="border p-2 rounded"
//         />
//         <input
//           value={price}
//           onChange={(e) => setPrice(e.target.value)}
//           placeholder="Price (e.g. 149.99)"
//           className="border p-2 rounded"
//         />
//         {/* <input
//           value={categoryId}
//           onChange={(e) => setCategoryId(e.target.value)}
//           placeholder="Category ID"
//           className="border p-2 rounded"
//         />
//         <input
//           value={sellerId}
//           onChange={(e) => setSellerId(e.target.value)}
//           placeholder="Seller ID"
//           className="border p-2 rounded"
//         /> */}
//         <input
//           value={imageUrl}
//           onChange={(e) => setImageUrl(e.target.value)}
//           placeholder="Image URL"
//           className="border p-2 rounded md:col-span-2"
//         />
//         <textarea
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//           placeholder="Description"
//           className="border p-2 rounded md:col-span-2 min-h-[120px]"
//         />
//       </div>

//       <label className="flex items-center gap-2">
//         <input
//           type="checkbox"
//           checked={isActive}
//           onChange={(e) => setIsActive(e.target.checked)}
//         />
//         Active
//       </label>

//       {error && <p className="text-red-600 text-sm">{error}</p>}

//       <div className="flex gap-2">
//         <button className="border px-4 py-2 rounded">Save</button>
//         <a href="/admin/products" className="px-4 py-2 rounded border">
//           Cancel
//         </a>
//       </div>
//     </form>
//   );
// }

















// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";

// type Product = {
//   id: string;
//   name: string;
//   description: string;
//   price: string;
//   imageUrl: string | null;
//   categoryId: string;
//   sellerId: string;
//   isActive: boolean;
//   sellerEmail?: string | null;
//   sellerName?: string | null;
// };

// export default function EditProductForm({ initial }: { initial: Product }) {
//   const router = useRouter();
//   const [name, setName] = useState(initial.name);
//   const [description, setDescription] = useState(initial.description);
//   const [price, setPrice] = useState(initial.price);
//   const [imageUrl, setImageUrl] = useState(initial.imageUrl || "");
//   const [categoryId, setCategoryId] = useState(initial.categoryId);
//   const [sellerId, setSellerId] = useState(initial.sellerId);
//   const [isActive, setIsActive] = useState(initial.isActive);
//   const [error, setError] = useState("");
//   const [uploading, setUploading] = useState(false);

//   async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setUploading(true);
//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const res = await fetch("/api/upload", {
//         method: "POST",
//         body: formData,
//       });

//       if (!res.ok) {
//         throw new Error("Upload failed");
//       }

//       const data = await res.json();
//       setImageUrl(data.url);
//     } catch (error) {
//       setError("Failed to upload image");
//     } finally {
//       setUploading(false);
//     }
//   }

//   async function onSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setError("");

//     const res = await fetch(`/api/admin/products/${initial.id}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         name,
//         description,
//         price,
//         imageUrl: imageUrl || null,
//         categoryId,
//         isActive,
//         sellerId,
//       }),
//     });

//     if (!res.ok) {
//       const j = await res.json().catch(() => ({}));
//       setError(j?.error || "Failed to update");
//       return;
//     }

//     router.push("/admin/products");
//     router.refresh();
//   }

//   return (
//     <form onSubmit={onSubmit} className="space-y-6">
//       <div className="grid md:grid-cols-2 gap-6">
//         {/* Name Field */}
//         <div className="space-y-2">
//           <label className="block text-sm font-medium text-[#8B4513]">
//             Product Name *
//           </label>
//           <input
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             placeholder="Enter product name"
//             className="w-full border border-[#e8e1d4] p-3 rounded-lg focus:ring-2 focus:ring-[#d0a933] focus:border-transparent"
//             required
//           />
//         </div>

//         {/* Price Field */}
//         <div className="space-y-2">
//           <label className="block text-sm font-medium text-[#8B4513]">
//             Price (MAD) *
//           </label>
//           <input
//             type="number"
//             step="0.01"
//             value={price}
//             onChange={(e) => setPrice(e.target.value)}
//             placeholder="0.00"
//             className="w-full border border-[#e8e1d4] p-3 rounded-lg focus:ring-2 focus:ring-[#d0a933] focus:border-transparent"
//             required
//           />
//         </div>

//         {/* Category ID Field */}
//         <div className="space-y-2">
//           <label className="block text-sm font-medium text-[#8B4513]">
//             Category ID *
//           </label>
//           <input
//             value={categoryId}
//             onChange={(e) => setCategoryId(e.target.value)}
//             placeholder="Enter category ID"
//             className="w-full border border-[#e8e1d4] p-3 rounded-lg focus:ring-2 focus:ring-[#d0a933] focus:border-transparent"
//             required
//           />
//         </div>

//         {/* Seller ID Field */}
//         <div className="space-y-2">
//           <label className="block text-sm font-medium text-[#8B4513]">
//             Seller ID *
//           </label>
//           <input
//             value={sellerId}
//             onChange={(e) => setSellerId(e.target.value)}
//             placeholder="Enter seller ID"
//             className="w-full border border-[#e8e1d4] p-3 rounded-lg focus:ring-2 focus:ring-[#d0a933] focus:border-transparent"
//             required
//           />
//         </div>

//         {/* Image Upload Field */}
//         <div className="space-y-2 md:col-span-2">
//           <label className="block text-sm font-medium text-[#8B4513]">
//             Product Image
//           </label>
          
//           {/* Image Preview */}
//           {imageUrl && (
//             <div className="mb-4">
//               <img
//                 src={imageUrl}
//                 alt="Product preview"
//                 className="w-32 h-32 object-cover rounded-lg border border-[#e8e1d4]"
//               />
//             </div>
//           )}

//           {/* File Upload */}
//           <div className="flex items-center gap-4">
//             <label className="flex flex-col items-center justify-center w-48 h-32 border-2 border-dashed border-[#d0a933] rounded-lg cursor-pointer hover:bg-[#faf7f2] transition-colors">
//               <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                 <svg className="w-8 h-8 mb-3 text-[#d0a933]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
//                   <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
//                 </svg>
//                 <p className="mb-2 text-sm text-[#8B4513]">
//                   <span className="font-semibold">Click to upload</span>
//                 </p>
//                 <p className="text-xs text-[#b89f75]">PNG, JPG, JPEG (MAX. 5MB)</p>
//               </div>
//               <input
//                 type="file"
//                 className="hidden"
//                 accept="image/*"
//                 onChange={handleImageUpload}
//                 disabled={uploading}
//               />
//             </label>

//             {uploading && (
//               <div className="text-[#8B4513]">Uploading...</div>
//             )}
//           </div>

//           {/* Or use URL fallback */}
//           <div className="mt-4">
//             <p className="text-sm text-[#8B4513] mb-2">Or enter image URL:</p>
//             <input
//               value={imageUrl}
//               onChange={(e) => setImageUrl(e.target.value)}
//               placeholder="https://example.com/image.jpg"
//               className="w-full border border-[#e8e1d4] p-2 rounded-lg focus:ring-2 focus:ring-[#d0a933] focus:border-transparent"
//             />
//           </div>
//         </div>

//         {/* Description Field */}
//         <div className="space-y-2 md:col-span-2">
//           <label className="block text-sm font-medium text-[#8B4513]">
//             Description *
//           </label>
//           <textarea
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             placeholder="Enter product description"
//             className="w-full border border-[#e8e1d4] p-3 rounded-lg focus:ring-2 focus:ring-[#d0a933] focus:border-transparent min-h-[120px]"
//             required
//           />
//         </div>
//       </div>

//       {/* Active Status Field */}
//       <div className="flex items-center gap-3 p-4 border border-[#e8e1d4] rounded-lg">
//         <input
//           type="checkbox"
//           id="isActive"
//           checked={isActive}
//           onChange={(e) => setIsActive(e.target.checked)}
//           className="w-4 h-4 text-[#d0a933] bg-gray-100 border-[#e8e1d4] rounded focus:ring-[#d0a933]"
//         />
//         <label htmlFor="isActive" className="text-sm font-medium text-[#8B4513]">
//           Product is active and visible to customers
//         </label>
//       </div>

//       {error && (
//         <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
//           {error}
//         </div>
//       )}

//       {/* Action Buttons */}
//       <div className="flex gap-3 pt-4">
//         <button
//           type="submit"
//           className="px-6 py-3 bg-[#d0a933] text-white rounded-lg hover:bg-[#b89420] transition-colors font-medium"
//         >
//           Save Changes
//         </button>
//         <a
//           href="/admin/products"
//           className="px-6 py-3 border border-[#e8e1d4] text-[#8B4513] rounded-lg hover:bg-[#faf7f2] transition-colors"
//         >
//           Cancel
//         </a>
//       </div>
//     </form>
//   );
// }

















"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string | null;
  categoryId: string;
  sellerId: string;
  isActive: boolean;
  sellerEmail?: string | null;
  sellerName?: string | null;
};

type Category = {
  id: string;
  name: string;
  iconUrl?: string | null;
};

export default function EditProductForm({ initial }: { initial: Product }) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [price, setPrice] = useState(initial.price);
  const [imageUrl, setImageUrl] = useState(initial.imageUrl || "");
  const [categoryId, setCategoryId] = useState(initial.categoryId);
  const [isActive, setIsActive] = useState(initial.isActive);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch categories on component mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data || []); // Assuming your API returns the array directly
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    }

    fetchCategories();
  }, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      setImageUrl(data.url);
    } catch (error) {
      setError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch(`/api/admin/products/${initial.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        price,
        imageUrl: imageUrl || null,
        categoryId,
        isActive,
      }),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.error || "Failed to update");
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Name Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#8B4513]">
            Product Name *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter product name"
            className="w-full border border-[#e8e1d4] p-3 rounded-lg focus:ring-2 focus:ring-[#d0a933] focus:border-transparent"
            required
          />
        </div>

        {/* Price Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#8B4513]">
            Price (MAD) *
          </label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className="w-full border border-[#e8e1d4] p-3 rounded-lg focus:ring-2 focus:ring-[#d0a933] focus:border-transparent"
            required
          />
        </div>

        {/* Category Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#8B4513]">
            Category *
          </label>
          {loadingCategories ? (
            <div className="w-full border border-[#e8e1d4] p-3 rounded-lg bg-gray-100">
              Loading categories...
            </div>
          ) : (
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border border-[#e8e1d4] p-3 rounded-lg focus:ring-2 focus:ring-[#d0a933] focus:border-transparent"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Empty div to maintain grid layout */}
        <div></div>

        {/* Image Upload Field */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-[#8B4513]">
            Product Image
          </label>
          
          {/* Image Preview */}
          {imageUrl && (
            <div className="mb-4">
              <img
                src={imageUrl}
                alt="Product preview"
                className="w-32 h-32 object-cover rounded-lg border border-[#e8e1d4]"
              />
            </div>
          )}

          {/* File Upload */}
          <div className="flex items-center gap-4">
            <label className="flex flex-col items-center justify-center w-48 h-32 border-2 border-dashed border-[#d0a933] rounded-lg cursor-pointer hover:bg-[#faf7f2] transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-3 text-[#d0a933]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-2 text-sm text-[#8B4513]">
                  <span className="font-semibold">Click to upload</span>
                </p>
                <p className="text-xs text-[#b89f75]">PNG, JPG, JPEG (MAX. 5MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>

            {uploading && (
              <div className="text-[#8B4513]">Uploading...</div>
            )}
          </div>
        </div>

        {/* Description Field */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-[#8B4513]">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter product description"
            className="w-full border border-[#e8e1d4] p-3 rounded-lg focus:ring-2 focus:ring-[#d0a933] focus:border-transparent min-h-[120px]"
            required
          />
        </div>
      </div>

      {/* Active Status Field */}
      <div className="flex items-center gap-3 p-4 border border-[#e8e1d4] rounded-lg">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 text-[#d0a933] bg-gray-100 border-[#e8e1d4] rounded focus:ring-[#d0a933]"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-[#8B4513]">
          Product is active and visible to customers
        </label>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="px-6 py-3 bg-[#d0a933] text-white rounded-lg hover:bg-[#b89420] transition-colors font-medium"
        >
          Save Changes
        </button>
        <a
          href="/admin/products"
          className="px-6 py-3 border border-[#e8e1d4] text-[#8B4513] rounded-lg hover:bg-[#faf7f2] transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}