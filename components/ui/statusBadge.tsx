export function StatusBadge({ value }: { value: string }) {
  const statusClassMap: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-800",
    inactive: "bg-slate-200 text-slate-700",
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    rejected: "bg-rose-100 text-rose-800",
    cancelled: "bg-slate-200 text-slate-700",
  };

  const badgeClassName = statusClassMap[value] ?? "bg-slate-200 text-slate-700";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${badgeClassName}`}
    >
      {value}
    </span>
  );
}
