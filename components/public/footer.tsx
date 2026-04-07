import Link from "next/link";

export function Footer() {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:px-6 lg:px-8">
      <div className="glass-panel mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 rounded-[28px] border border-white/70 px-5 py-4 text-center shadow-glass sm:flex-row sm:text-left">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Employee easily track their leave approvals 
          </p>
          <p className="text-xs text-slate-600">
            Modern employee and leave management system
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-700">
          <Link href="/login" className="transition hover:text-slate-950">
            Login
          </Link>
          <Link href="/signup" className="transition hover:text-slate-950">
            Create account
          </Link>
        </div>
      </div>
    </footer>
  );
}
