import { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export function Select({
  label,
  error,
  className,
  children,
  ...props
}: SelectProps) {
  const selectClassName = [
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label className="block space-y-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <select className={selectClassName} {...props}>
        {children}
      </select>
      {error ? (
        <span className="text-xs font-medium text-rose-600">{error}</span>
      ) : null}
    </label>
  );
}
