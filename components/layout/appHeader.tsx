"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { quickActions } from "@/lib/constants/navigation";
import { Role } from "@/lib/types";
import { useAuth } from "@/contexts/authContext";

export function AppHeader({ role }: { role: Role }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const action = quickActions[role];
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  async function handleLogout() {
    await logout();
    toast.success("Logout successfully.");
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-20 mb-6 flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">
          {roleLabel}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">
          Welcome back, {user?.name ?? "Team member"}
        </h1>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={handleLogout} className="w-full sm:w-auto">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
