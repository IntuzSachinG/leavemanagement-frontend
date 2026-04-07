"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  EmployeeFormModal,
  EmployeeFormValue,
} from "@/components/employees/employeeFormModal";
import { EmployeeTable } from "@/components/employees/employeeTable";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loadingState";
import {
  createManagerEmployee,
  getDepartments,
  getVisibleEmployees,
} from "@/lib/api/services";
import { Department, Employee } from "@/lib/types";
import { useAuth } from "@/contexts/authContext";

export default function ManagerTeamPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) {
      return;
    }

    const [employeeResponse, departmentResponse] = await Promise.all([
      getVisibleEmployees(),
      getDepartments(),
    ]);

    setEmployees(employeeResponse.data);
    setDepartments(departmentResponse.data);
  }, [user]);

  useEffect(() => {
    loadData()
      .catch((error) =>
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load team members.",
        ),
      )
      .finally(() => setLoading(false));
  }, [loadData]);

  useEffect(() => {
    if (searchParams.get("dialog") === "create") {
      setDialogOpen(true);
    }
  }, [searchParams]);

  async function handleCreateEmployee(values: EmployeeFormValue) {
    if (!user?.departmentId) {
      return;
    }

    try {
      await createManagerEmployee({
        ...values,
        role: "employee",
        departmentId: user.departmentId,
      });
      toast.success("Employee registered successfully");
      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create employee.",
      );
      throw error;
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading your team..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-4xl border border-white/70 bg-white/80 p-6 shadow-soft lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">My team</h2>
          <p className="mt-2 text-sm text-slate-600">
            Managers add employees
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>Add employee</Button>
      </div>
      <EmployeeTable employees={employees} departments={departments} />
      <EmployeeFormModal
        open={isDialogOpen}
        mode="create"
        departments={departments}
        managerMode
        managerDepartmentId={user?.departmentId}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreateEmployee}
      />
    </div>
  );
}
