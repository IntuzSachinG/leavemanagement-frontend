import {  CircleCheck, CircleX, SquareX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/emptyState";
import { StatusBadge } from "@/components/ui/statusBadge";
import { Department, LeaveRecord, Role } from "@/lib/types";
import { getDepartmentName } from "@/lib/departmentName";
import { formatDate } from "@/lib/dateFormat";

interface LeaveTableProps {
  leaves: LeaveRecord[];
  departments: Department[];
  role: Role;
  onApprove?: (leave: LeaveRecord) => void;
  onReject?: (leave: LeaveRecord) => void;
  onCancel?: (leave: LeaveRecord) => void;
}

export function LeaveTable({
  leaves,
  departments,
  role,
  onApprove,
  onReject,
  onCancel,
}: LeaveTableProps) {
  if (!leaves.length) {
    return (
      <EmptyState
        title="No leave records found"
        description="When leave requests arrive, they will appear here come back later"
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
              <th className="px-5 py-4">Department</th>
              <th className="px-5 py-4">Reason</th>
              <th className="px-5 py-4">Start date</th>
              <th className="px-5 py-4">End date</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => {
              const departmentId = leave.employee?.departmentId ?? "";
              const canModerate =
                role !== "employee" && leave.status === "pending";
              const canCancel =
                role === "employee" &&
                ["pending", "approved"].includes(leave.status);

              return (
                <tr
                  key={leave.id}
                  className="border-t border-slate-100 text-sm text-slate-700"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-950">
                      {leave.employee?.name ?? "You"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {leave.employee?.email ?? "Your request"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    {getDepartmentName(departmentId, departments)}
                  </td>
                  <td className="max-w-xs px-5 py-4">{leave.reason}</td>
                  <td className="px-5 py-4">{formatDate(leave.startDate)}</td>
                  <td className="px-5 py-4">{formatDate(leave.endDate)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge value={leave.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {canModerate ? (
                        <>
                          <Button
                            variant="secondary"
                            className="px-3 py-2"
                            onClick={() => onApprove?.(leave)}
                          >
                            < CircleCheck className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="danger"
                            className="px-3 py-2"
                            onClick={() => onReject?.(leave)}
                          >
                            <CircleX className="h-4 w-4" />
                          </Button>
                        </>
                      ) : null}
                      {canCancel ? (
                        <Button
                          variant="secondary"
                          className="px-3 py-2"
                          onClick={() => onCancel?.(leave)}
                        >
                          <SquareX className="h-4 w-4" />
                        </Button>
                      ) : null}
                      {!canModerate && !canCancel ? (
                        <span className="text-xs text-slate-500">
                          No actions
                        </span>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
