import { ReactNode } from "react";
import { headers } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const headerList = await headers();
  const currentPath = headerList.get("x-pathname") ?? "";

  return (
    <div className="min-h-screen lg:flex">
      <AppSidebar currentPath={currentPath} />
      <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
