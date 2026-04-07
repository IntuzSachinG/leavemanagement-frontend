"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirmDialog";
import { LoadingState } from "@/components/ui/loadingState";
import { DepartmentFormModal } from "@/components/departments/departmentFormModal";
import { DepartmentTable } from "@/components/departments/departmentTable";
import { Button } from "@/components/ui/button";
import {
  createDepartment,
  deleteDepartment,
  getAdminEmployees,
  getDepartments,
  updateDepartment,
} from "@/lib/api/services";
import { Department, Employee } from "@/lib/types";
import { useAuth } from "@/contexts/authContext";

export default function AdminDepartmentsPage() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) {
      return;
    }

    const [departmentsResponse, employeesResponse] = await Promise.all([
      getDepartments(),
      getAdminEmployees(),
    ]);
    setDepartments(departmentsResponse.data);
    setEmployees(employeesResponse.data);
  }, [user]);

  useEffect(() => {
    loadData()
      .catch((error) =>
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load departments.",
        ),
      )
      .finally(() => setLoading(false));
  }, [loadData]);

  const employeeCounts = useMemo(
    () =>
      employees.reduce<Record<string, number>>((accumulator, employee) => {
        accumulator[employee.departmentId] =
          (accumulator[employee.departmentId] ?? 0) + 1;
        return accumulator;
      }, {}),
    [employees],
  );

  async function handleSubmit(payload: { name: string }) {
    if (!user) {
      return;
    }

    try {
      if (selectedDepartment) {
        await updateDepartment(selectedDepartment.id, payload);
        toast.success("Department updated successfully.");
      } else {
        await createDepartment(payload);
        toast.success("Department created successfully.");
      }

      await loadData();
      setSelectedDepartment(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save department.",
      );
      throw error;
    }
  }

  async function handleDelete() {
    if (!user || !deleteTarget) {
      return;
    }

    try {
      await deleteDepartment(deleteTarget.id);
      toast.success("Department deleted successfully.");
      setDeleteTarget(null);
      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete department.",
      );
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading departments..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-4xl border border-white/70 bg-white/80 p-6 shadow-soft lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">
            Department management
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Add departments
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedDepartment(null);
            setDialogOpen(true);
          }}
        >
          Add department
        </Button>
      </div>
      <DepartmentTable
        departments={departments}
        employeeCounts={employeeCounts}
        onEdit={(department) => {
          setSelectedDepartment(department);
          setDialogOpen(true);
        }}
        onDelete={setDeleteTarget}
      />
      <DepartmentFormModal
        open={dialogOpen}
        department={selectedDepartment}
        onClose={() => {
          setDialogOpen(false);
          setSelectedDepartment(null);
        }}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete department?"
        description={`This will remove ${deleteTarget?.name ?? "this department"} from the system.`}
        confirmLabel="Delete department"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
