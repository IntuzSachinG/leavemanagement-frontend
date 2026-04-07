"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { roleNavigation } from "@/lib/constants/navigation";
import { Role } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  role: Role;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ role, isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const navItems = roleNavigation[role];
  const sidebarClassName = [
    "fixed inset-y-0 left-0 z-30 flex w-[280px] flex-col border-r border-white/60 bg-slate-950 px-5 py-6 text-white transition duration-300 lg:translate-x-0",
    isOpen ? "translate-x-0" : "-translate-x-full lg:w-[110px]",
  ].join(" ");

  const brandClassName = [
    "overflow-hidden transition",
    !isOpen ? "lg:w-0 lg:opacity-0" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <button
        className="fixed left-4 top-4 z-40 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-glass lg:hidden"
        onClick={onToggle}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <aside className={sidebarClassName}>
        <div className="flex items-center justify-between pb-8">
          <div className={brandClassName}>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-teal-300">
              {role}
            </p>
            <h2 className="mt-2 text-2xl font-bold">LeaveFlow</h2>
          </div>
          <Button
            variant="ghost"
            className="hidden rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10 lg:inline-flex"
            onClick={onToggle}
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            const linkClassName = [
              "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
              active
                ? "bg-white text-slate-950"
                : "text-slate-200 hover:bg-white/10",
              !isOpen ? "lg:justify-center" : "",
            ]
              .filter(Boolean)
              .join(" ");

            const labelClassName = ["transition", !isOpen ? "lg:hidden" : ""]
              .filter(Boolean)
              .join(" ");

            return (
              <Link key={item.href} href={item.href} className={linkClassName}>
                <Icon className="h-5 w-5 shrink-0" />
                <span className={labelClassName}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
