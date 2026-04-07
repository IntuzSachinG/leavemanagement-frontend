import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
  altLabel,
  altHref,
  altText,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  altLabel: string;
  altHref: string;
  altText: string;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-hero-mesh" />
      <div className="section-shell relative flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[40px] bg-slate-950 p-8 text-white shadow-glass sm:p-10">
            <Link
              href="/"
              className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300"
            >
              LeaveFlow
            </Link>
            <h1 className="mt-6 text-4xl font-bold leading-tight">{title}</h1>
            <p className="mt-4 text-base leading-7 text-slate-300">
              {subtitle}
            </p>
            <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-5">
              <p className="text-sm leading-7 text-slate-200">
                Create Your Work Space and connect with your own workspace
              </p>
            </div>
          </div>
          <div className="glass-panel rounded-[40px] border border-white/70 p-6 shadow-glass sm:p-8">
            {children}
            <p className="mt-6 text-center text-sm text-slate-600">
              {altText}{" "}
              <Link href={altHref} className="font-semibold text-slate-950">
                {altLabel}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
