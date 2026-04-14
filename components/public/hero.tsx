import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarRange,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const highlights = [
  "Track leave at one place with leave pages",
  "Manage leave and employees",
  "Leave approvals and department controls",
];

const cards = [
  {
    title: "Employees",
    description:
      "Create employees, assign departments, track leave of employees",
    icon: Users,
  },
  {
    title: "Leave Visibility",
    description:
      "Track pending, approved, rejected, and cancelled leave requests from history page",
    icon: CalendarRange,
  },
  {
    title: "Department",
    description: "Department Add By Admin and Manager",
    icon: Building2,
  },
];

export function Hero() {
  return (
    <section className="section-shell relative pt-28">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[40px] border border-white/60 bg-hero-mesh p-8 shadow-soft sm:p-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-sm font-semibold text-slate-800">
            <BadgeCheck className="h-4 w-4 text-emerald-600" />
            Employee and leave management control for growing teams
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
            Request, Approve, Track Effortless leave tracking for modern teams.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
            Give your employees the transparency they deserve with a simple,
            self-service leave portal.Eliminate scheduling conflicts, track
            accruals automatically, and get a clear view of team availability.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/login">
              <Button className="w-full sm:w-auto cursor-pointer">
                Start with Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            {/* <Link href="/signup">
              <Button variant="secondary" className="w-full sm:w-auto cursor-pointer">
                Create Employee Account
              </Button>
            </Link> */}
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {highlights.map((highlight) => (
              <div
                key={highlight}
                className="rounded-3xl border border-white/80 bg-white/70 p-4"
              >
                <p className="text-sm font-medium text-slate-700">
                  {highlight}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="glass-panel rounded-4xl border border-white/70 p-6 shadow-soft"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-2xl font-bold text-slate-950">
                  {card.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
