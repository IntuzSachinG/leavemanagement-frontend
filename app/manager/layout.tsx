import { ProtectedShell } from "@/components/layout/protectedRoute";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedShell role="manager">{children}</ProtectedShell>;
}
