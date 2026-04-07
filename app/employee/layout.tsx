import { ProtectedShell } from "@/components/layout/protectedRoute";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell role="employee">{children}</ProtectedShell>;
}