import { Pencil, Trash2 } from "lucide-react";
import { Department } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/emptyState";

interface DepartmentTableProps {
  departments: Department[];
  employeeCounts: Record<string, number>;
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
}

export function DepartmentTable({
  departments,
  employeeCounts,
  onEdit,
  onDelete,
}: DepartmentTableProps) {
  if (!departments.length) {
    return (
      <EmptyState
        title="No departments found"
        description="Create the first department to organize employees cleanly."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-4xl border border-white/70 bg-white/85 shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-slate-950 text-sm text-white">
            <tr>
              <th className="px-5 py-4">Department</th>
              <th className="px-5 py-4">Employees</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((department) => (
              <tr
                key={department.id}
                className="border-t border-slate-100 text-sm text-slate-700"
              >
                <td className="px-5 py-4 font-semibold text-slate-950">
                  {department.name}
                </td>
                <td className="px-5 py-4">
                  {employeeCounts[department.id] ?? 0}
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      className="px-3 py-2"
                      onClick={() => onEdit(department)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="danger"
                      className="px-3 py-2"
                      onClick={() => onDelete(department)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
