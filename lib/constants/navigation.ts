import {
  ChartNoAxesColumnIncreasing,
  Building2,
  CalendarDays,
  LayoutDashboard,
  Users,
  ContactRound,
} from "lucide-react";

import { Role } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

export const roleNavigation: Record<Role, NavItem[]> = {
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/employees", label: "Employees", icon: Users },
    { href: "/admin/departments", label: "Departments", icon: Building2 },
    { href: "/admin/leaves", label: "Leave History", icon: CalendarDays },
  ],
  manager: [
    { href: "/manager/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/manager/team", label: "My Team", icon: Users },
    { href: "/manager/leaves", label: "Leave History", icon: CalendarDays },
  ],
  employee: [
    {
      href: "/employee/dashboard",
      label: "Dashboard",
      icon: ChartNoAxesColumnIncreasing,
    },
    { href: "/employee/profile", label: "My Profile", icon: ContactRound },
    { href: "/employee/leaves", label: "My Leaves", icon: CalendarDays },
  ],
};

export const quickActions: Record<Role, { href: string; label: string }> = {
  admin: {
    href: "/admin/employees?dialog=create",
    label: "Add Employee",
  },
  manager: {
    href: "/manager/team?dialog=create",
    label: "Add Employee",
  },
  employee: {
    href: "/employee/leaves?dialog=create",
    label: "Apply Leave",
  },
};

export const roleDefaultRoute: Record<Role, string> = {
  admin: "/admin/dashboard",
  manager: "/manager/dashboard",
  employee: "/employee/dashboard",
};
