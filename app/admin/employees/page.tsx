"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirmDialog";
import { LoadingState } from "@/components/ui/loadingState";
import { EmployeeFormModal } from "@/components/employees/employeeFormModal";
import { EmployeeTable } from "@/components/employees/employeeTable";
import {
  createEmployee,
  deleteEmployee,
  getAdminEmployees,
  getDepartments,
  updateEmployee,
} from "@/lib/api/services";
import { Department, Employee } from "@/lib/types";
import { useAuth } from "@/contexts/authContext";
import { Button } from "@/components/ui/button";

export default function AdminEmployeesPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const loadData = useCallback(async () => {
    if (!user) {
      return;
    }

    const [employeesResponse, departmentsResponse] = await Promise.all([
      getAdminEmployees(),
      getDepartments(),
    ]);
    setEmployees(employeesResponse.data);
    setDepartments(departmentsResponse.data);
  }, [user]);

  useEffect(() => {
    loadData()
      .catch((error) =>
        toast.error(
          error instanceof Error ? error.message : "Unable to load employees.",
        ),
      )
      .finally(() => setLoading(false));
  }, [loadData]);

  useEffect(() => {
    if (searchParams.get("dialog") === "create") {
      setDialogMode("create");
      setDialogOpen(true);
    }
  }, [searchParams]);

  const activeDepartmentCount = departments.filter((department) =>
    employees.some((employee) => employee.departmentId === department.id),
  ).length;

  async function handleSubmit(values: {
    name: string;
    email: string;
    password: string;
    role: "admin" | "manager" | "employee";
    gender: "male" | "female" | "other";
    departmentId: string;
    status: "active" | "inactive";
  }) {
    if (!user) {
      return;
    }

    try {
      if (dialogMode === "create") {
        await createEmployee(values);
        toast.success("Employee registered successfully.");
      } else if (selectedEmployee) {
        const payload = values.password
          ? values
          : { ...values, password: undefined };
        await updateEmployee(selectedEmployee.id, payload);
        toast.success("Employee updated successfully.");
      }

      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save employee.",
      );
      throw error;
    }
  }

  async function handleDelete() {
    if (!user || !deleteTarget) {
      return;
    }

    try {
      await deleteEmployee(deleteTarget.id);
      toast.success("Employee deleted successfully.");
      setDeleteTarget(null);
      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete employee.",
      );
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading employees..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-4xl border border-white/70 bg-white/80 p-6 shadow-soft lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">
            Add Employee
          </h2>
         
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
            {employees.length} employees
          </div>
          <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
            {activeDepartmentCount} total departments
          </div>
          <Button
            onClick={() => {
              setDialogMode("create");
              setSelectedEmployee(null);
              setDialogOpen(true);
            }}
          >
            Add employee
          </Button>
        </div>
      </div>
      <EmployeeTable
        employees={employees}
        departments={departments}
        canEdit
        onEdit={(employee) => {
          setDialogMode("edit");
          setSelectedEmployee(employee);
          setDialogOpen(true);
        }}
        onDelete={setDeleteTarget}
      />
      <EmployeeFormModal
        open={isDialogOpen}
        mode={dialogMode}
        employee={selectedEmployee}
        departments={departments}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete employee?"
        description={`This will remove ${deleteTarget?.name ?? "this employee"} from the system.`}
        confirmLabel="Delete employee"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
