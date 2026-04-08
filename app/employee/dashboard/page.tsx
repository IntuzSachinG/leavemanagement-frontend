"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MetricCard } from "@/components/dashboard/metricCard";
import { LoadingState } from "@/components/ui/loadingState";
import {
  getLeaveHistory,
  getLeaveSummary,
  getVisibleEmployees,
} from "@/lib/api/services";
import { Employee, LeaveRecord, LeaveSummary } from "@/lib/types";
import { useAuth } from "@/contexts/authContext";
import { formatDate } from "@/lib/dateFormat";
import { StatusBadge } from "@/components/ui/statusBadge";

export default function EmployeeDashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Employee | null>(null);
  const [summary, setSummary] = useState<LeaveSummary | null>(null);
  const [recentLeaves, setRecentLeaves] = useState<LeaveRecord[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    Promise.all([
      getVisibleEmployees(),
      getLeaveSummary(),
      getLeaveHistory({ page: 1, limit: 4 }),
    ])
      .then(([profileResponse, summaryResponse, leaveResponse]) => {
        setProfile(profileResponse.data[0] ?? null);
        setSummary(summaryResponse.data);
        setRecentLeaves(leaveResponse.data.data);
      })
      .catch((error) =>
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load employee dashboard.",
        ),
      )
      .finally(() => setLoading(false));
  }, [user]);

  if (isLoading || !summary || !profile) {
    return <LoadingState label="Loading employee dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Profile role"
          value={profile.role}
          hint="Current role"
          accent="bg-teal-100 text-teal-700"
        />
        <MetricCard
          label="Pending leaves"
          value={summary.pending}
          hint="Waiting for approval"
          accent="bg-amber-100 text-amber-700"
        />
        <MetricCard
          label="Approved leaves"
          value={summary.approved}
          hint="Approved leaves visible here."
          accent="bg-emerald-100 text-emerald-700"
        />
        
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
       
        <section className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-soft">
          <h2 className="text-2xl font-bold text-slate-950">
            Recent leave requests
          </h2>
          <div className="mt-5 space-y-4">
            {recentLeaves.map((leave) => (
              <div key={leave.id} className="rounded-3xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-950">{leave.reason}</p>
                 
                   <StatusBadge value={leave.status} />
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
