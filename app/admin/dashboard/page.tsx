"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import {
  getAdminEmployees,
  getDepartments,
  getLeaveSummary,
} from "@/lib/api/services";
import { Department, Employee, LeaveSummary } from "@/lib/types";
import { useAuth } from "@/contexts/authContext";
import { MetricCard } from "@/components/dashboard/metricCard";
import { LoadingState } from "@/components/ui/loadingState";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [summary, setSummary] = useState<LeaveSummary | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    Promise.all([getAdminEmployees(), getDepartments(), getLeaveSummary()])
      .then(([employeesResponse, departmentsResponse, summaryResponse]) => {
        setEmployees(employeesResponse.data);
        setDepartments(departmentsResponse.data);
        setSummary(summaryResponse.data);
      })
      .catch((error) =>
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load admin dashboard.",
        ),
      )
      .finally(() => setLoading(false));
  }, [user]);

  if (isLoading || !summary) {
    return <LoadingState label="Loading admin dashboard..." />;
  }

  const dashboardChartData = [
    {
      label: "Employees",
      value: employees.length,
      color: "#14b8a6",
    },
    {
      label: "Departments",
      value: departments.length,
      color: "#f97316",
    },
    {
      label: "Pending leaves",
      value: summary.pending,
      color: "#f59e0b",
    },
    {
      label: "Total leaves",
      value: summary.total,
      color: "#0ea5e9",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total employees"
          value={employees.length}
          hint="Total count of the employees"
          accent="bg-teal-100 text-teal-700"
        />
        <MetricCard
          label="Total departments"
          value={departments.length}
          hint="Total count of the departments"
          accent="bg-orange-100 text-orange-700"
        />
        <MetricCard
          label="Pending leaves"
          value={summary.pending}
          hint="Requests waiting for admin or manager approvals"
          accent="bg-amber-100 text-amber-700"
        />
        <MetricCard
          label="Total leaves"
          value={summary.total}
          hint="All leave requests recorded in the system"
          accent="bg-sky-100 text-sky-700"
        />
      </div>

      <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Admin analytics
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              Dashboard overview
            </h2>
          </div>
          <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
            {dashboardChartData.length} key metrics
          </div>
        </div>

        <div className="mt-6 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dashboardChartData}
              margin={{ top: 12, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#475569", fontSize: 12, fontWeight: 600 }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "rgba(148, 163, 184, 0.16)" }}
                contentStyle={{
                  border: "1px solid rgba(226, 232, 240, 0.9)",
                  borderRadius: "14px",
                  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
                }}
              />
              <Bar dataKey="value" name="Count" radius={[10, 10, 0, 0]}>
                {dashboardChartData.map((item) => (
                  <Cell key={item.label} fill={item.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
