"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoadingState } from "@/components/ui/loadingState";
import { getDepartments, getVisibleEmployees } from "@/lib/api/services";
import { Department, Employee } from "@/lib/types";
import { useAuth } from "@/contexts/authContext";
import { getDepartmentName } from "@/lib/departmentName";

export default function EmployeeProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Employee | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    Promise.all([getVisibleEmployees(), getDepartments()])
      .then(([profileResponse, departmentResponse]) => {
        setProfile(profileResponse.data[0] ?? null);
        setDepartments(departmentResponse.data);
      })
      .catch((error) =>
        toast.error(
          error instanceof Error ? error.message : "Unable to load profile.",
        ),
      )
      .finally(() => setLoading(false));
  }, [user]);

  if (isLoading || !profile) {
    return <LoadingState label="Loading profile..." />;
  }

  return (
    <section className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">
        My profile
      </p>
      <h2 className="mt-3 text-3xl font-bold text-slate-950">{profile.name}</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Email</p>
          <p className="mt-2 font-semibold text-slate-950">{profile.email}</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Department</p>
          <p className="mt-2 font-semibold text-slate-950">
            {getDepartmentName(profile.departmentId, departments)}
          </p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Role</p>
          <p className="mt-2 font-semibold capitalize text-slate-950">
            {profile.role}
          </p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Mobile</p>
          <p className="mt-2 font-semibold text-slate-950">
            {profile.mobile || "Not provided"}
          </p>
        </div>
      </div>
    </section>
  );
}
