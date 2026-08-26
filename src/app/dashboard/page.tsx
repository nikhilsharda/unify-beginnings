import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getModulesForUser, getProgressMap, computeGamification } from "@/lib/track";
import { Nav } from "@/components/nav";
import { ModuleIcon } from "@/components/module-icon";
import { BrandGraphic } from "@/components/brand-graphic";
import { RevealBlock, RevealGroup, RevealItem } from "@/components/motion";

const TYPE_LABEL: Record<string, string> = {
  VIDEO: "Video",
  MAP: "World Map",
  QUIZ: "Knowledge Check",
  CHECKLIST: "Human Checklist",
  REFLECTION: "Reflection",
  BRIEFING: "Strategic Briefing",
};

export default async function DashboardPage() {
  const user = await requireUser();
  if (user.role === "ADMIN") redirect("/admin");

  const modules = await getModulesForUser(user);
  const progress = await getProgressMap(user.id);
  const gamification = await computeGamification(user.id, modules);

  const complete = modules.filter((m) => progress.get(m.id)?.status === "COMPLETE").length;
  const total = modules.length;
  const pct = total > 0 ? Math.round((complete / total) * 100) : 0;
  const trackComplete = total > 0 && complete === total;
  const started = complete > 0;
  const firstIncomplete = modules.find((m) => progress.get(m.id)?.status !== "COMPLETE");
  const resumeSlug = firstIncomplete?.slug ?? modules[0]?.slug;

  const levelPct = Math.round((gamification.xpIntoLevel / gamification.levelStep) * 100);

  return (
    <>
      <Nav user={user} />
      <main className="flex-1 bg-gray-100">
        <div className="relative overflow-hidden bg-gray-900 text-white">
          <BrandGraphic tone="red" className="-right-16 -top-16 h-64 w-64" />
          <div className="relative mx-auto max-w-4xl px-6 py-16 text-center">
            <RevealBlock>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-yellow">
                {user.track === "FOUNDATION" ? "Foundation Track" : "Leadership Track"}
                {" · "}
                {trackComplete ? "Session complete" : "About 2 hours, start to finish"}
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                {trackComplete
                  ? `Nicely done, ${user.name.split(" ")[0]}.`
                  : started
                  ? `Welcome back, ${user.name.split(" ")[0]}.`
                  : `Welcome, ${user.name.split(" ")[0]}.`}
              </h1>
              <p className="mx-auto mt-2 max-w-md text-gray-300">
                {trackComplete
                  ? "You've completed every step of your onboarding session."
                  : started
                  ? "Pick up right where you left off."
                  : "One flowing session, no need to schedule anything else. Work through it start to finish."}
              </p>

              <div className="mx-auto mt-8 max-w-sm">
                <div className="flex items-center justify-between text-sm text-gray-300">
                  <span>{complete} of {total} steps complete</span>
                  <span className="font-semibold text-white tabular-nums">{pct}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-brand-red transition-all duration-700 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="mx-auto mt-6 inline-flex items-center gap-3 brand-shape-sm border border-white/15 bg-white/5 px-4 py-2.5">
                <span className="brand-shape-sm flex h-9 w-9 items-center justify-center bg-brand-yellow text-sm font-extrabold text-gray-900">
                  {gamification.level}
                </span>
                <div className="text-left">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Level {gamification.level}
                  </p>
                  <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-brand-yellow" style={{ width: `${levelPct}%` }} />
                  </div>
                </div>
                <span className="text-sm font-bold tabular-nums text-white">{gamification.xp} XP</span>
              </div>

              <div className="mt-8">
                {trackComplete ? (
                  <Link
                    href="/certificate/me"
                    className="press inline-flex items-center gap-2 brand-shape bg-brand-yellow px-8 py-3 text-sm font-bold text-gray-900 hover:brightness-95"
                  >
                    View your certificate
                  </Link>
                ) : (
                  <Link
                    href={`/dashboard/module/${resumeSlug}`}
                    className="press inline-flex items-center gap-2 brand-shape bg-brand-red px-8 py-3 text-sm font-bold text-white hover:brightness-90"
                  >
                    {started ? "Continue session" : "Start session"} &rarr;
                  </Link>
                )}
              </div>
            </RevealBlock>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-6 py-10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Your path
          </p>
          <RevealGroup className="space-y-2">
            {modules.map((m, i) => {
              const status = progress.get(m.id)?.status ?? "NOT_STARTED";
              const isDone = status === "COMPLETE";
              return (
                <RevealItem key={m.id}>
                  <div
                    className={`flex items-center gap-4 brand-shape-sm border p-3 ${
                      isDone ? "border-brand-red/20 bg-white" : "border-gray-200 bg-white/60"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center brand-shape-sm text-xs font-bold ${
                        isDone ? "bg-brand-red text-white" : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {isDone ? <ModuleIcon type={m.type} className="h-4 w-4" /> : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-semibold ${isDone ? "text-gray-900" : "text-gray-600"}`}>
                        {m.title}
                      </p>
                      <p className="truncate text-xs text-gray-400">{TYPE_LABEL[m.type]}</p>
                    </div>
                    {isDone && <span className="shrink-0 text-xs font-semibold text-brand-red">Complete</span>}
                  </div>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </main>
    </>
  );
}
