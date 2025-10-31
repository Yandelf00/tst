// src/app/admin/users/page.tsx
import Link from "next/link";
import UsersBrowser from "./users-browser";

export const dynamic = "force-dynamic";

export default function AdminUsersPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Link
          href="/admin/users/new"
          className="px-3 py-2 rounded-md border hover:bg-gray-50"
        >
          + New User
        </Link>
      </div>

      {/* Client component handles filters + fetching with cookies */}
      <UsersBrowser />
    </div>
  );
}
