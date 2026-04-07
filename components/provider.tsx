"use client";

import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/authContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        richColors
        theme="light"
        position="top-right"
        toastOptions={{
          className: "border border-white/60 shadow-soft",
        }}
      />
    </AuthProvider>
  );
}
