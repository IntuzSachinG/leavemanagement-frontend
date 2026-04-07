import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-panel max-w-xl rounded-[36px] border border-white/70 p-8 text-center shadow-glass">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-600">
          404
        </p>
        <h1 className="mt-4 text-4xl font-bold text-slate-950">
          Page not found
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Sorry For In-Convienient The Page You Try To Find Not Available In Our Domain
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/">
            <Button>Back to Home page</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
