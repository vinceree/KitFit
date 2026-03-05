import { redirect } from "next/navigation";
import Link from "next/link";
import { getBrand } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brand = await getBrand();
  if (!brand) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-lg font-bold tracking-tight">
              KitFit
            </Link>
            <div className="flex gap-1">
              <Link
                href="/dashboard"
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
              >
                Overview
              </Link>
              <Link
                href="/dashboard/products"
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
              >
                Products
              </Link>
              <Link
                href="/dashboard/demo"
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
              >
                Demo
              </Link>
              <Link
                href="/dashboard/embed"
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
              >
                Embed Code
              </Link>
              <Link
                href="/dashboard/billing"
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
              >
                Billing
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{brand.name}</span>
            <LogoutButton />
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
