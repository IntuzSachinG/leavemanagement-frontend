import { ArrowUpRight } from "lucide-react";

export function MetricCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number | string;
  hint: string;
  accent: string;
}) {
  return (
    <article className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <h3 className="mt-3 text-4xl font-bold text-slate-950">{value}</h3>
        </div>
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accent}`}
        >
          <ArrowUpRight className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-sm text-slate-600">{hint}</p>
    </article>
  );
}
