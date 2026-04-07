import { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  const textareaClassName = [
    "min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label className="block space-y-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <textarea className={textareaClassName} {...props} />
      {error ? (
        <span className="text-xs font-medium text-rose-600">{error}</span>
      ) : null}
    </label>
  );
}
