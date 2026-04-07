export function LoadingState({ label = "Loading data..." }: { label?: string }) {
  return (
    <div className="flex min-h-60 items-center justify-center">
      <div className="flex items-center gap-3 rounded-full bg-white/80 px-5 py-3 shadow-soft">
        <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
    </div>
  );
}
