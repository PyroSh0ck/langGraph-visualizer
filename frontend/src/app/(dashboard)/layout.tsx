import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full">
      <AppSidebar />
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
