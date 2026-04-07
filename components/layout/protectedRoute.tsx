"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { AppHeader } from "@/components/layout/appHeader";
import { LoadingState } from "@/components/ui/loadingState";
import { roleDefaultRoute } from "@/lib/constants/navigation";
import { Role } from "@/lib/types";
import { useAuth } from "@/contexts/authContext";

export function ProtectedShell({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoading, user } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, router, user]);

  useEffect(() => {
    if (!isLoading && user && user.role !== role) {
      router.replace(roleDefaultRoute[user.role]);
    }
  }, [isLoading, role, router, user]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  if (isLoading || !user || user.role !== role) {
    return <LoadingState label="Preparing your workspace..." />;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f9fcff_0%,#fef9f1_100%)]">
      <Sidebar
        role={role}
        isOpen={isSidebarOpen}
        onToggle={() => setSidebarOpen((value) => !value)}
      />
      <main
        className={`min-h-screen p-4 pt-20 transition-all lg:pt-4 ${isSidebarOpen ? "lg:ml-70" : "lg:ml-27.5"}`}
      >
        <AppHeader role={role} />
        {children}
      </main>
    </div>
  );
}
