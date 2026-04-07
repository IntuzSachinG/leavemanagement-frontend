"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirmDialog";
import { LeaveTable } from "@/components/leaves/leaveTable";
import { LoadingState } from "@/components/ui/loadingState";
import {
  approveLeave,
  getDepartments,
  getLeaveHistory,
  rejectLeave,
} from "@/lib/api/services";
import { Department, LeaveRecord } from "@/lib/types";
import { useAuth } from "@/contexts/authContext";

export default function ManagerLeavesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);

  const [isLoading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [status, setStatus] = useState<string>();
  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();

  const [pendingAction, setPendingAction] = useState<{
    type: "approve" | "reject";
    leave: LeaveRecord;
  } | null>(null);

  useEffect(() => {
    const pageParam = Number(searchParams.get("page")) || 1;
    const statusParam = searchParams.get("status") || undefined;
    const start = searchParams.get("startDate") || undefined;
    const end = searchParams.get("endDate") || undefined;

    setPage(pageParam);
    setStatus(statusParam);
    setStartDate(start);
    setEndDate(end);
  }, [searchParams]);

  function updateURL(params: Record<string, any>) {
    const query = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value) query.set(key, String(value));
      else query.delete(key);
    });

    router.push(`?${query.toString()}`);
  }

  const loadData = useCallback(async () => {
    if (!user) return;

    setIsFetching(true);

    try {
      const [deptRes, leaveRes] = await Promise.all([
        getDepartments(),
        getLeaveHistory({
          page,
          limit: 10,
          status,
          startDate,
          endDate,
        }),
      ]);

      setDepartments(deptRes.data);
      setLeaves(leaveRes.data.data);
      setTotalPages(leaveRes.data.totalPages);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  }, [user, page, status, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleDecision() {
    if (!pendingAction) return;

    try {
      if (pendingAction.type === "approve"|| pendingAction.type === "reject") {
        await approveLeave(pendingAction.leave.id);
          toast.success("Leave approved successfully");
      } else {
        await rejectLeave(pendingAction.leave.id);
          toast.success("Leave approved successfully");
      }

      
      setPendingAction(null);
      loadData();
    } catch {
      toast.error("Action failed");
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading manager leaves..." />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Department Leave History</h2>

      <div className="flex flex-wrap gap-4">
        <select
          className="border px-3 py-2 rounded"
          value={status || ""}
          onChange={(e) => {
            const value = e.target.value || undefined;
            setStatus(value);
            setPage(1);

            updateURL({ status: value, page: 1 });
          }}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <input
          type="date"
          className="border px-3 py-2 rounded"
          value={startDate || ""}
          onChange={(e) => {
            const value = e.target.value || undefined;
            setStartDate(value);
            setPage(1);

            updateURL({ startDate: value, page: 1 });
          }}
        />

        <input
          type="date"
          className="border px-3 py-2 rounded"
          value={endDate || ""}
          onChange={(e) => {
            const value = e.target.value || undefined;
            setEndDate(value);
            setPage(1);

            updateURL({ endDate: value, page: 1 });
          }}
        />
      </div>

      {isFetching && <p className="text-sm text-gray-500">Updating...</p>}

      <LeaveTable
        leaves={leaves}
        departments={departments}
        role="manager"
        onApprove={(leave) => setPendingAction({ type: "approve", leave })}
        onReject={(leave) => setPendingAction({ type: "reject", leave })}
      />

      <div className="flex justify-center gap-4">
        <button
          disabled={page === 1 || isFetching}
          onClick={() => {
            const newPage = page - 1;
            setPage(newPage);
            updateURL({ page: newPage });
          }}
          className="border px-4 py-2 rounded"
        >
          Prev
        </button>

        <span>
          Page {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages || isFetching}
          onClick={() => {
            const newPage = page + 1;
            setPage(newPage);
            updateURL({ page: newPage });
          }}
          className="border px-4 py-2 rounded"
        >
          Next
        </button>
      </div>

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title="Confirm action"
        description="Are you sure?"
        confirmLabel="Yes"
        onClose={() => setPendingAction(null)}
        onConfirm={handleDecision}
      />
    </div>
  );
}
