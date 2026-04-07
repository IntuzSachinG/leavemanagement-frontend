"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirmDialog";
import { LeaveRequestModal } from "@/components/leaves/leaveRequestModal";
import { LeaveTable } from "@/components/leaves/leaveTable";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loadingState";
import {
  applyLeave,
  cancelLeave,
  getDepartments,
  getLeaveHistory,
} from "@/lib/api/services";
import { Department, LeaveRecord } from "@/lib/types";
import { useAuth } from "@/contexts/authContext";

export default function EmployeeLeavesPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<LeaveRecord | null>(null);

  const loadData = useCallback(async () => {
    if (!user) {
      return;
    }

    const [departmentResponse, leaveResponse] = await Promise.all([
      getDepartments(),
      getLeaveHistory({ page: 1, limit: 20 }),
    ]);

    setDepartments(departmentResponse.data);
    setLeaves(leaveResponse.data.data);
  }, [user]);

  useEffect(() => {
    loadData()
      .catch((error) =>
        toast.error(
          error instanceof Error ? error.message : "Unable to load leaves.",
        ),
      )
      .finally(() => setLoading(false));
  }, [loadData]);

  useEffect(() => {
    if (searchParams.get("dialog") === "create") {
      setDialogOpen(true);
    }
  }, [searchParams]);

  async function handleApply(payload: {
    startDate: string;
    endDate: string;
    reason: string;
  }) {
    if (!user) {
      return;
    }

    try {
      await applyLeave(payload);
      toast.success("Leave request created successfully.");
      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to submit leave.",
      );
      throw error;
    }
  }

  async function handleCancel() {
    if (!user || !cancelTarget) {
      return;
    }

    try {
      await cancelLeave(cancelTarget.id);
      toast.success("Request Cancel successfully.");
      setCancelTarget(null);
      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to cancel leave.",
      );
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading your leaves..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-4xl border border-white/70 bg-white/80 p-6 shadow-soft lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">My leaves</h2>
          <p className="mt-2 text-sm text-slate-600">
            Apply for leave, and track the status of leaves
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>Apply leave</Button>
      </div>
      <LeaveTable
        leaves={leaves}
        departments={departments}
        role="employee"
        onCancel={setCancelTarget}
      />
      <LeaveRequestModal
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleApply}
      />
      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel leave request?"
        description="Are you sure!!"
        confirmLabel="Cancel leave"
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
      />
    </div>
  );
}
