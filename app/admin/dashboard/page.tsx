"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ClipboardCopy,
  Download,
  Filter,
  LayoutDashboard,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdminEmployees,
  getDepartments,
  getLeaveSummary,
} from "@/lib/api/services";
import { Department, Employee, LeaveSummary, Role } from "@/lib/types";
import { useAuth } from "@/contexts/authContext";
import { MetricCard } from "@/components/dashboard/metricCard";
import { LoadingState } from "@/components/ui/loadingState";
import { Button } from "@/components/ui/button";

type RoleFilter = "all" | Role;
type StatusFilter = "all" | "active" | "inactive";
type EmployeeSort = "name" | "department" | "role" | "status";
type NotePriority = "normal" | "high" | "urgent";

interface AdminNote {
  id: string;
  title: string;
  body: string;
  priority: NotePriority;
  isDone: boolean;
  createdAt: string;
}

interface DepartmentInsight {
  id: string;
  name: string;
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  managers: number;
  employees: number;
}

const NOTE_STORAGE_KEY = "admin-dashboard-quick-notes";

const roleFilterOptions: { label: string; value: RoleFilter }[] = [
  { label: "All", value: "all" },
  { label: "Admins", value: "admin" },
  { label: "Managers", value: "manager" },
  { label: "Employees", value: "employee" },
];

const statusFilterOptions: { label: string; value: StatusFilter }[] = [
  { label: "All status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const notePriorityStyles: Record<NotePriority, string> = {
  normal: "bg-slate-100 text-slate-700",
  high: "bg-amber-100 text-amber-700",
  urgent: "bg-rose-100 text-rose-700",
};

const leavePalette = {
  pending: "#f59e0b",
  approved: "#14b8a6",
  rejected: "#ef4444",
  cancelled: "#64748b",
};

function formatPercent(value: number) {
  if (!Number.isFinite(value)) {
    return "0%";
  }

  return `${Math.round(value)}%`;
}

function safePercent(value: number, total: number) {
  if (!total) {
    return 0;
  }

  return (value / total) * 100;
}

function formatDate(value?: string) {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function makeNoteId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `note-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getDepartmentName(
  departmentId: string,
  departmentNameById: Map<string, string>,
) {
  return departmentNameById.get(departmentId) ?? "Unassigned";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function buildEmployeeCsv(
  employees: Employee[],
  departmentNameById: Map<string, string>,
) {
  const headers = ["Name", "Email", "Role", "Status", "Department", "Mobile"];
  const rows = employees.map((employee) => [
    employee.name,
    employee.email,
    employee.role,
    employee.status,
    getDepartmentName(employee.departmentId, departmentNameById),
    employee.mobile ?? "",
  ]);

  return [headers, ...rows]
    .map((row) =>
      row
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [summary, setSummary] = useState<LeaveSummary | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [employeeSort, setEmployeeSort] = useState<EmployeeSort>("name");
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [notesReady, setNotesReady] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [notePriority, setNotePriority] = useState<NotePriority>("normal");

  useEffect(() => {
    if (!user) {
      return;
    }

    Promise.all([getAdminEmployees(), getDepartments(), getLeaveSummary()])
      .then(([employeesResponse, departmentsResponse, summaryResponse]) => {
        setEmployees(employeesResponse.data);
        setDepartments(departmentsResponse.data);
        setSummary(summaryResponse.data);
      })
      .catch((error) =>
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load admin dashboard.",
        ),
      )
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    try {
      const storedNotes = window.localStorage.getItem(NOTE_STORAGE_KEY);

      if (storedNotes) {
        const parsedNotes = JSON.parse(storedNotes) as AdminNote[];
        setNotes(Array.isArray(parsedNotes) ? parsedNotes : []);
      }
    } catch {
      setNotes([]);
    } finally {
      setNotesReady(true);
    }
  }, []);

  useEffect(() => {
    if (!notesReady) {
      return;
    }

    window.localStorage.setItem(NOTE_STORAGE_KEY, JSON.stringify(notes));
  }, [notes, notesReady]);

  const departmentNameById = useMemo(
    () =>
      new Map(
        departments.map((department) => [department.id, department.name]),
      ),
    [departments],
  );

  const roleCounts = useMemo(
    () =>
      employees.reduce<Record<Role, number>>(
        (accumulator, employee) => {
          accumulator[employee.role] += 1;
          return accumulator;
        },
        { admin: 0, manager: 0, employee: 0 },
      ),
    [employees],
  );

  const activeEmployees = useMemo(
    () => employees.filter((employee) => employee.status === "active"),
    [employees],
  );

  const inactiveEmployees = useMemo(
    () => employees.filter((employee) => employee.status === "inactive"),
    [employees],
  );

  const departmentInsights = useMemo<DepartmentInsight[]>(() => {
    const insights = departments.map((department) => {
      const departmentEmployees = employees.filter(
        (employee) => employee.departmentId === department.id,
      );

      return {
        id: department.id,
        name: department.name,
        totalEmployees: departmentEmployees.length,
        activeEmployees: departmentEmployees.filter(
          (employee) => employee.status === "active",
        ).length,
        inactiveEmployees: departmentEmployees.filter(
          (employee) => employee.status === "inactive",
        ).length,
        managers: departmentEmployees.filter(
          (employee) => employee.role === "manager",
        ).length,
        employees: departmentEmployees.filter(
          (employee) => employee.role === "employee",
        ).length,
      };
    });

    return insights.sort((first, second) => {
      if (second.totalEmployees !== first.totalEmployees) {
        return second.totalEmployees - first.totalEmployees;
      }

      return first.name.localeCompare(second.name);
    });
  }, [departments, employees]);

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return employees
      .filter((employee) => {
        const departmentName = getDepartmentName(
          employee.departmentId,
          departmentNameById,
        );
        const matchesSearch =
          !normalizedQuery ||
          employee.name.toLowerCase().includes(normalizedQuery) ||
          employee.email.toLowerCase().includes(normalizedQuery) ||
          departmentName.toLowerCase().includes(normalizedQuery);
        const matchesRole =
          roleFilter === "all" || employee.role === roleFilter;
        const matchesStatus =
          statusFilter === "all" || employee.status === statusFilter;
        const matchesDepartment =
          departmentFilter === "all" ||
          employee.departmentId === departmentFilter;

        return (
          matchesSearch &&
          matchesRole &&
          matchesStatus &&
          matchesDepartment
        );
      })
      .sort((first, second) => {
        if (employeeSort === "department") {
          return getDepartmentName(first.departmentId, departmentNameById)
            .localeCompare(getDepartmentName(second.departmentId, departmentNameById));
        }

        if (employeeSort === "role") {
          return first.role.localeCompare(second.role);
        }

        if (employeeSort === "status") {
          return first.status.localeCompare(second.status);
        }

        return first.name.localeCompare(second.name);
      });
  }, [
    departmentFilter,
    departmentNameById,
    employeeSort,
    employees,
    query,
    roleFilter,
    statusFilter,
  ]);

  const dashboardChartData = useMemo(
    () => [
      {
        label: "Employees",
        value: employees.length,
        color: "#14b8a6",
      },
      {
        label: "Departments",
        value: departments.length,
        color: "#f97316",
      },
      {
        label: "Pending leaves",
        value: summary?.pending ?? 0,
        color: "#f59e0b",
      },
      {
        label: "Active today",
        value: summary?.activeToday ?? 0,
        color: "#0ea5e9",
      },
    ],
    [departments.length, employees.length, summary],
  );

  const leaveStatusData = useMemo(
    () => [
      {
        label: "Pending",
        value: summary?.pending ?? 0,
        color: leavePalette.pending,
      },
      {
        label: "Approved",
        value: summary?.approved ?? 0,
        color: leavePalette.approved,
      },
      {
        label: "Rejected",
        value: summary?.rejected ?? 0,
        color: leavePalette.rejected,
      },
      {
        label: "Cancelled",
        value: summary?.cancelled ?? 0,
        color: leavePalette.cancelled,
      },
    ],
    [summary],
  );

  const openNotesCount = notes.filter((note) => !note.isDone).length;
  const activeDepartmentCount = departmentInsights.filter(
    (department) => department.totalEmployees > 0,
  ).length;
  const approvalRate = safePercent(summary?.approved ?? 0, summary?.total ?? 0);
  const pendingRate = safePercent(summary?.pending ?? 0, summary?.total ?? 0);
  const staffingCoverage = safePercent(
    activeDepartmentCount,
    departments.length,
  );

  const recommendedActions = useMemo(() => {
    const actions: string[] = [];

    if ((summary?.pending ?? 0) > 0) {
      actions.push(`${summary?.pending ?? 0} leave requests need review.`);
    }

    if (inactiveEmployees.length > 0) {
      actions.push(`${inactiveEmployees.length} inactive employees are listed.`);
    }

    if (departmentInsights.some((department) => department.managers === 0)) {
      actions.push("Assign managers to departments without manager coverage.");
    }

    if (openNotesCount > 0) {
      actions.push(`${openNotesCount} admin notes remain open.`);
    }

    if (!actions.length) {
      actions.push("All visible admin signals look stable.");
    }

    return actions;
  }, [departmentInsights, inactiveEmployees.length, openNotesCount, summary]);

  function resetFilters() {
    setQuery("");
    setRoleFilter("all");
    setStatusFilter("all");
    setDepartmentFilter("all");
    setEmployeeSort("name");
  }

  function handleExport() {
    const csv = buildEmployeeCsv(filteredEmployees, departmentNameById);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "admin-dashboard-employees.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Employee report exported.");
  }

  async function handleCopyBriefing() {
    const briefing = [
      "Admin dashboard briefing",
      `Employees: ${employees.length}`,
      `Departments: ${departments.length}`,
      `Active employees: ${activeEmployees.length}`,
      `Pending leaves: ${summary?.pending ?? 0}`,
      `Approved leave rate: ${formatPercent(approvalRate)}`,
      `Open notes: ${openNotesCount}`,
      "",
      "Recommended actions:",
      ...recommendedActions.map((action) => `- ${action}`),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(briefing);
      toast.success("Admin briefing copied.");
    } catch {
      toast.error("Unable to copy briefing.");
    }
  }

  function handleAddNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = noteTitle.trim();
    const body = noteBody.trim();

    if (!title) {
      toast.error("Add a note title first.");
      return;
    }

    setNotes((currentNotes) => [
      {
        id: makeNoteId(),
        title,
        body,
        priority: notePriority,
        isDone: false,
        createdAt: new Date().toISOString(),
      },
      ...currentNotes,
    ]);
    setNoteTitle("");
    setNoteBody("");
    setNotePriority("normal");
    toast.success("Admin note added.");
  }

  function handleToggleNote(noteId: string) {
    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === noteId ? { ...note, isDone: !note.isDone } : note,
      ),
    );
  }

  function handleDeleteNote(noteId: string) {
    setNotes((currentNotes) =>
      currentNotes.filter((note) => note.id !== noteId),
    );
    toast.success("Admin note removed.");
  }

  if (isLoading || !summary) {
    return <LoadingState label="Loading admin dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-soft">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700">
              <LayoutDashboard className="h-4 w-4" />
              Admin command center
            </div>
            <h2 className="mt-4 text-3xl font-bold text-slate-950">
              Welcome back, {user?.name ?? "Admin"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Review people, departments, leave pressure, and daily follow-ups
              from one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={handleCopyBriefing}>
              <ClipboardCopy className="mr-2 h-4 w-4" />
              Copy briefing
            </Button>
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export report
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total employees"
          value={employees.length}
          hint={`${activeEmployees.length} active and ${inactiveEmployees.length} inactive`}
          accent="bg-teal-100 text-teal-700"
        />
        <MetricCard
          label="Departments"
          value={departments.length}
          hint={`${activeDepartmentCount} departments currently have staff`}
          accent="bg-orange-100 text-orange-700"
        />
        <MetricCard
          label="Pending leaves"
          value={summary.pending}
          hint={`${formatPercent(pendingRate)} of all leave requests`}
          accent="bg-amber-100 text-amber-700"
        />
        <MetricCard
          label="Active today"
          value={summary.activeToday}
          hint={`Leave summary updated ${formatDate(summary.lastUpdated)}`}
          accent="bg-sky-100 text-sky-700"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-soft">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Admin analytics
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                Dashboard overview
              </h2>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
              {dashboardChartData.length} key metrics
            </div>
          </div>

          <div className="mt-6 h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardChartData}
                margin={{ top: 12, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#475569", fontSize: 12, fontWeight: 600 }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(148, 163, 184, 0.16)" }}
                  contentStyle={{
                    border: "1px solid rgba(226, 232, 240, 0.9)",
                    borderRadius: "14px",
                    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
                  }}
                />
                <Bar dataKey="value" name="Count" radius={[10, 10, 0, 0]}>
                  {dashboardChartData.map((item) => (
                    <Cell key={item.label} fill={item.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Leave status
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                Request mix
              </h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <CalendarClock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leaveStatusData}
                  dataKey="value"
                  innerRadius={58}
                  outerRadius={86}
                  paddingAngle={3}
                  nameKey="label"
                >
                  {leaveStatusData.map((item) => (
                    <Cell key={item.label} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    border: "1px solid rgba(226, 232, 240, 0.9)",
                    borderRadius: "14px",
                    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {leaveStatusData.map((item) => (
              <div key={item.label} className="rounded-2xl bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <p className="text-xs font-semibold text-slate-500">
                    {item.label}
                  </p>
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.25fr]">
        <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Health signals
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                What needs attention
              </h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <InsightTile
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Approval rate"
              value={formatPercent(approvalRate)}
              tone="text-teal-700 bg-teal-50"
            />
            <InsightTile
              icon={<BriefcaseBusiness className="h-4 w-4" />}
              label="Staffed departments"
              value={formatPercent(staffingCoverage)}
              tone="text-orange-700 bg-orange-50"
            />
            <InsightTile
              icon={<Users className="h-4 w-4" />}
              label="Manager coverage"
              value={roleCounts.manager}
              tone="text-sky-700 bg-sky-50"
            />
          </div>
          <div className="mt-6 space-y-3">
            {recommendedActions.map((action) => (
              <div
                key={action}
                className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-teal-600" />
                <p className="text-sm leading-6 text-slate-700">{action}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Employee explorer
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                Search and segment staff
              </h2>
            </div>
            <Button variant="secondary" onClick={resetFilters}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-[1.3fr_0.75fr_0.75fr]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, email, or department"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />
            </label>
            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            >
              <option value="all">All departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
            <select
              value={employeeSort}
              onChange={(event) =>
                setEmployeeSort(event.target.value as EmployeeSort)
              }
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            >
              <option value="name">Sort by name</option>
              <option value="department">Sort by department</option>
              <option value="role">Sort by role</option>
              <option value="status">Sort by status</option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">
              <Filter className="h-4 w-4" />
              Filters
            </span>
            {roleFilterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRoleFilter(option.value)}
                className={[
                  "rounded-2xl px-3 py-2 text-sm font-semibold transition",
                  roleFilter === option.value
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                ].join(" ")}
              >
                {option.label}
              </button>
            ))}
            {statusFilterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={[
                  "rounded-2xl px-3 py-2 text-sm font-semibold transition",
                  statusFilter === option.value
                    ? "bg-teal-600 text-white"
                    : "bg-teal-50 text-teal-700 hover:bg-teal-100",
                ].join(" ")}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
            <div className="grid grid-cols-[1.1fr_0.8fr_0.6fr_0.6fr] bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
              <span>Employee</span>
              <span>Department</span>
              <span>Role</span>
              <span>Status</span>
            </div>
            <div className="max-h-[420px] overflow-auto">
              {filteredEmployees.length ? (
                filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="grid grid-cols-[1.1fr_0.8fr_0.6fr_0.6fr] items-center gap-3 border-t border-slate-100 px-4 py-4 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-xs font-bold text-white">
                        {getInitials(employee.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-950">
                          {employee.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {employee.email}
                        </p>
                      </div>
                    </div>
                    <span className="truncate font-medium text-slate-700">
                      {getDepartmentName(
                        employee.departmentId,
                        departmentNameById,
                      )}
                    </span>
                    <span className="capitalize text-slate-600">
                      {employee.role}
                    </span>
                    <span
                      className={[
                        "w-fit rounded-full px-2.5 py-1 text-xs font-bold capitalize",
                        employee.status === "active"
                          ? "bg-teal-100 text-teal-700"
                          : "bg-rose-100 text-rose-700",
                      ].join(" ")}
                    >
                      {employee.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="border-t border-slate-100 px-4 py-10 text-center text-sm font-medium text-slate-500">
                  No employees match the selected filters.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-soft">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Department workload
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                Team distribution
              </h2>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
              {activeDepartmentCount} staffed
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {departmentInsights.map((department) => {
              const width = safePercent(
                department.totalEmployees,
                employees.length,
              );

              return (
                <div key={department.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">
                        {department.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {department.managers} managers, {department.employees} employees
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-2xl font-bold text-slate-950">
                        {department.totalEmployees}
                      </p>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Total staff
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-teal-500"
                      style={{ width: `${Math.max(width, 4)}%` }}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-teal-100 px-2.5 py-1 text-teal-700">
                      {department.activeEmployees} active
                    </span>
                    <span className="rounded-full bg-rose-100 px-2.5 py-1 text-rose-700">
                      {department.inactiveEmployees} inactive
                    </span>
                    {department.managers === 0 ? (
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-700">
                        Needs manager
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Quick notes
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                Admin follow-ups
              </h2>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
              {openNotesCount} open
            </div>
          </div>

          <form onSubmit={handleAddNote} className="mt-6 space-y-3">
            <input
              value={noteTitle}
              onChange={(event) => setNoteTitle(event.target.value)}
              placeholder="Note title"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
            <textarea
              value={noteBody}
              onChange={(event) => setNoteBody(event.target.value)}
              placeholder="Optional details"
              rows={3}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={notePriority}
                onChange={(event) =>
                  setNotePriority(event.target.value as NotePriority)
                }
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 sm:flex-1"
              >
                <option value="normal">Normal priority</option>
                <option value="high">High priority</option>
                <option value="urgent">Urgent priority</option>
              </select>
              <Button type="submit" className="sm:min-w-36">
                Add note
              </Button>
            </div>
          </form>

          <div className="mt-6 space-y-3">
            {notes.length ? (
              notes.map((note) => (
                <article
                  key={note.id}
                  className={[
                    "rounded-2xl border p-4 transition",
                    note.isDone
                      ? "border-slate-100 bg-slate-50 opacity-70"
                      : "border-slate-200 bg-white",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={[
                            "rounded-full px-2.5 py-1 text-xs font-bold capitalize",
                            notePriorityStyles[note.priority],
                          ].join(" ")}
                        >
                          {note.priority}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          {formatDate(note.createdAt)}
                        </span>
                      </div>
                      <h3
                        className={[
                          "mt-3 font-bold text-slate-950",
                          note.isDone ? "line-through" : "",
                        ].join(" ")}
                      >
                        {note.title}
                      </h3>
                      {note.body ? (
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {note.body}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleNote(note.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 transition hover:bg-teal-100"
                        aria-label={
                          note.isDone ? "Mark note open" : "Mark note done"
                        }
                      >
                        {note.isDone ? (
                          <RefreshCw className="h-4 w-4" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(note.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 transition hover:bg-rose-100"
                        aria-label="Delete note"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl bg-slate-50 p-6 text-center">
                <XCircle className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-500">
                  No admin notes yet.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function InsightTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div
        className={[
          "inline-flex h-9 w-9 items-center justify-center rounded-2xl",
          tone,
        ].join(" ")}
      >
        {icon}
      </div>
      <p className="mt-3 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
    </div>
  );
}
