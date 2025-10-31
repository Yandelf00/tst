import { getUserFromCookie, getUserById } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AdminDashboard() {
  const userId = await getUserFromCookie();

  if (!userId) {
    redirect("/unauthorized");
  }

  const user = await getUserById(userId);

  if (!user || user.role !== "admin") {
    redirect("/unauthorized");
  }

  return (
    <div>
      <h1 className="text-xl font-bold">Welcome, Admin</h1>
      <LogoutButton />
    </div>
  );
}
