"use client";

import { useEffect, useState } from "react";
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
      </div>
    </div>
  );
}
