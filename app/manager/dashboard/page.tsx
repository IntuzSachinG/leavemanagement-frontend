"use client";

import { useEffect,  useState } from "react";
import { toast } from "sonner";
import { MetricCard } from "@/components/dashboard/metricCard";
import { LoadingState } from "@/components/ui/loadingState";
import {
  getDepartments,
  getLeaveSummary,
  getVisibleEmployees,
} from "@/lib/api/services";
import { Department, Employee, LeaveSummary } from "@/lib/types";
import { useAuth } from "@/contexts/authContext";
import { getDepartmentName } from "@/lib/departmentName";
// import { formatRelativeDate } from "@/lib/dateFormat";

export default function ManagerDashboardPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [summary, setSummary] = useState<LeaveSummary | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    Promise.all([getVisibleEmployees(), getDepartments(), getLeaveSummary()])
      .then(([employeeResponse, departmentResponse, summaryResponse]) => {
        setEmployees(employeeResponse.data);
        setDepartments(departmentResponse.data);
        setSummary(summaryResponse.data);
      })
      .catch((error) =>
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load manager dashboard.",
        ),
      )
      .finally(() => setLoading(false));
  }, [user]);

  // const roleCounts = useMemo(
  //   () => [
  //     {
  //       label: "Managers",
  //       value: employees.filter((employee) => employee.role === "manager")
  //         .length,
  //     },
  //     {
  //       label: "Employees",
  //       value: employees.filter((employee) => employee.role === "employee")
  //         .length,
  //     },
  //   ],
  //   [employees],
  // );

  if (isLoading || !summary || !user) {
    return <LoadingState label="Loading manager dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Visible team"
          value={employees.length}
          hint="This count is scoped to your department by the backend."
          accent="bg-teal-100 text-teal-700"
        />
        <MetricCard
          label="Department"
          value={getDepartmentName(user.departmentId, departments)}
          hint="Managers only see related employees and leaves."
          accent="bg-orange-100 text-orange-700"
        />
        <MetricCard
          label="Pending leaves"
          value={summary.pending}
          hint="Requests waiting for your team decision."
          accent="bg-amber-100 text-amber-700"
        />
       
      </div>
     
    </div>
  );
}
