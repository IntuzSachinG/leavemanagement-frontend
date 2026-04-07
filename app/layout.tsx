import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/provider";

export const metadata: Metadata = {
  title: "Employee And Leave Management",
  description:
    "Modern Employee and Leave Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
