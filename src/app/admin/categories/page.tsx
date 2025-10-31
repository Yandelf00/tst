// src/app/admin/categories/page.tsx
import CategoriesBrowser from "./categories-browser";

export const dynamic = "force-dynamic";

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Categories</h1>
      <CategoriesBrowser />
    </div>
  );
}
