import { ProtectedShell } from "@/components/layout/protectedRoute";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedShell role="admin">{children}</ProtectedShell>;
}
