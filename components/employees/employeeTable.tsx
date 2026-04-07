import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/emptyState";
import { StatusBadge } from "@/components/ui/statusBadge";
import { Department, Employee } from "@/lib/types";
import { getDepartmentName } from "@/lib/departmentName";

interface EmployeeTableProps {
  employees: Employee[];
  departments: Department[];
  canEdit?: boolean;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
}

export function EmployeeTable({
  employees,
  departments,
  canEdit = false,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  if (!employees.length) {
    return (
      <EmptyState
        title="No employees found"
        description="Add employees or adjust filters to see results here."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-4xl border border-white/70 bg-white/85 shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-slate-950 text-sm text-white">
            <tr>
              <th className="px-5 py-4">Employee</th>
              <th className="px-5 py-4">Role</th>
              <th className="px-5 py-4">Department</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Mobile</th>
              {canEdit ? <th className="px-5 py-4">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr
                key={employee.id}
                className="border-t border-slate-100 text-sm text-slate-700"
              >
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-950">
                    {employee.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {employee.email}
                  </p>
                </td>
                <td className="px-5 py-4 capitalize">{employee.role}</td>
                <td className="px-5 py-4">
                  {getDepartmentName(employee.departmentId, departments)}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge value={employee.status} />
                </td>
                <td className="px-5 py-4">{employee.mobile || "Not shared"}</td>
                {canEdit ? (
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        className="px-3 py-2"
                        onClick={() => onEdit?.(employee)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="danger"
                        className="px-3 py-2"
                        onClick={() => onDelete?.(employee)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
