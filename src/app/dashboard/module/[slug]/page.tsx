import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { ModuleIcon } from "@/components/module-icon";
import { WorldMap } from "@/components/modules/world-map";
import { getModulesForUser, getAdjacentModuleSlugs } from "@/lib/track";
import {
  markVideoWatched,
  submitQuiz,
  toggleChecklistItem,
  submitReflection,
  markMapExplored,
} from "./actions";

const TYPE_LABEL: Record<string, string> = {
  VIDEO: "Video",
  MAP: "World Map",
  QUIZ: "Knowledge Check",
  CHECKLIST: "Human Checklist",
  REFLECTION: "Reflection & Feedback",
  BRIEFING: "Strategic Briefing",
};

export default async function ModulePage(
  props: PageProps<"/dashboard/module/[slug]">
) {
  const { slug } = await props.params;
  const search = await props.searchParams;
  const user = await requireUser();

  const module = await prisma.module.findUnique({
    where: { slug },
    include: {
      quizQuestions: { orderBy: { order: "asc" } },
      checklistItems: { orderBy: { order: "asc" } },
      mapPoints: { orderBy: { order: "asc" } },
      reflectionQs: { orderBy: { order: "asc" } },
    },
  });
  if (!module) notFound();
  if (module.track !== "BOTH" && module.track !== user.track) notFound();

  const allModules = await getModulesForUser(user);
  const { index, total, nextSlug, isLast } = getAdjacentModuleSlugs(allModules, module.id);
  const continueHref = isLast ? "/certificate/me" : `/dashboard/module/${nextSlug}`;
  const continueLabel = isLast ? "Finish & get certificate" : "Continue";

  const progress = await prisma.progress.findUnique({
    where: { userId_moduleId: { userId: user.id, moduleId: module.id } },
  });
  const done = progress?.status === "COMPLETE";
  const showResult = search.result === "1";

  const lastAttempt =
    module.type === "QUIZ"
      ? await prisma.quizAttempt.findFirst({
          where: { userId: user.id, moduleId: module.id },
          orderBy: { createdAt: "desc" },
        })
      : null;

  const checklistDone =
    module.type === "CHECKLIST"
      ? new Set(
          (
            await prisma.checklistCompletion.findMany({
              where: {
                userId: user.id,
                itemId: { in: module.checklistItems.map((i) => i.id) },
              },
            })
          ).map((c) => c.itemId)
        )
      : new Set<string>();

  return (
    <>
      <Nav user={user} />
      <div className="border-b border-gray-300 bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-3">
          <span className="shrink-0 text-xs font-semibold tabular-nums text-gray-500">
            Step {index + 1} of {total}
          </span>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-brand-red transition-all duration-500 ease-out"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
        </div>
      </div>
      <main className="flex-1 bg-gray-100">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-brand-red">
            &larr; Back to My Path
          </Link>

          <div className="mt-4 flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center brand-shape-sm bg-gray-900 text-brand-yellow">
              <ModuleIcon type={module.type} className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">
                {TYPE_LABEL[module.type]}
              </p>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{module.title}</h1>
              {module.subtitle && <p className="mt-1 text-gray-500">{module.subtitle}</p>}
            </div>
          </div>

          {module.body && (
            <p className="mt-6 max-w-2xl leading-relaxed text-gray-700">{module.body}</p>
          )}

          {module.quoteText && (
            <blockquote className="quote mt-8 max-w-2xl text-xl leading-snug text-gray-800">
              &ldquo;{module.quoteText}&rdquo;
              {module.quoteAuthor && (
                <footer className="mt-3 text-sm not-italic font-semibold tracking-wide text-brand-red">
                  {module.quoteAuthor}
                </footer>
              )}
            </blockquote>
          )}

          <div className="mt-8">
            {module.type === "VIDEO" && (
              <div>
                {module.videoIsPlaceholder || !module.videoUrl ? (
                  <div className="flex aspect-video w-full flex-col items-center justify-center brand-shape-lg bg-gray-900 text-white">
                    <span className="brand-shape-sm flex h-16 w-16 items-center justify-center bg-brand-red">
                      <ModuleIcon type="VIDEO" className="h-8 w-8" />
                    </span>
                    <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-brand-yellow">
                      Video coming soon
                    </p>
                    <p className="mt-1 text-sm text-gray-300">{module.title}</p>
                  </div>
                ) : (
                  <video
                    src={module.videoUrl}
                    controls
                    className="aspect-video w-full brand-shape-lg bg-black"
                  />
                )}
                <form action={markVideoWatched.bind(null, module.id)} className="mt-6">
                  <button
                    type="submit"
                    className="press brand-shape bg-brand-red px-6 py-2.5 text-sm font-bold text-white hover:brightness-90"
                  >
                    {progress?.status === "COMPLETE" ? "Watched, mark again" : "I've watched this"}
                  </button>
                </form>
              </div>
            )}

            {module.type === "MAP" && (
              <>
                <WorldMap points={module.mapPoints} />
                <form action={markMapExplored.bind(null, module.id)} className="mt-6">
                  <button
                    type="submit"
                    className="press brand-shape bg-brand-red px-6 py-2.5 text-sm font-bold text-white hover:brightness-90"
                  >
                    {progress?.status === "COMPLETE" ? "Explored, mark again" : "I've explored the map"}
                  </button>
                </form>
              </>
            )}

            {module.type === "QUIZ" && (
              <div>
                {showResult && lastAttempt && (
                  <div
                    className={`brand-shape mb-6 border p-5 ${
                      lastAttempt.passed
                        ? "border-brand-red/30 bg-white"
                        : "border-gray-300 bg-gray-100"
                    }`}
                  >
                    <p className="text-lg font-bold text-gray-900">
                      Score: {lastAttempt.scorePct}%
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {lastAttempt.passed
                        ? `Nice work, you've cleared the ${module.passThreshold}% mark and earned this badge.`
                        : `You need ${module.passThreshold}% to earn the badge. Retake any time, no penalty.`}
                    </p>
                  </div>
                )}
                <form action={submitQuiz.bind(null, module.id)} className="space-y-6">
                  {module.quizQuestions.map((q, qi) => {
                    const options: string[] = JSON.parse(q.options);
                    return (
                      <fieldset
                        key={q.id}
                        className="elev-1 brand-shape border border-gray-300 bg-white p-5"
                      >
                        <legend className="text-sm font-bold text-gray-900">
                          {qi + 1}. {q.question}
                        </legend>
                        <div className="mt-3 space-y-2">
                          {options.map((opt, oi) => (
                            <label
                              key={oi}
                              className="flex cursor-pointer items-center gap-3 brand-shape-sm border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:border-brand-red"
                            >
                              <input
                                type="radio"
                                name={`q_${q.id}`}
                                value={oi}
                                required
                                className="accent-[color:var(--brand-red)]"
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    );
                  })}
                  <button
                    type="submit"
                    className="press brand-shape bg-brand-red px-6 py-2.5 text-sm font-bold text-white hover:brightness-90"
                  >
                    Submit answers
                  </button>
                </form>
              </div>
            )}

            {module.type === "CHECKLIST" && (
              <div className="space-y-3">
                {module.checklistItems.map((item) => {
                  const done = checklistDone.has(item.id);
                  return (
                    <form
                      key={item.id}
                      action={toggleChecklistItem.bind(null, module.id, item.id)}
                      className={`elev-hover flex items-center gap-4 brand-shape border p-4 ${
                        done ? "border-brand-red/30 elev-1" : "border-gray-300"
                      } bg-white`}
                    >
                      <button
                        type="submit"
                        name="completedWith"
                        value=""
                        className={`flex h-6 w-6 shrink-0 items-center justify-center brand-shape-sm border-2 text-xs font-bold ${
                          done
                            ? "border-brand-red bg-brand-red text-white"
                            : "border-gray-400 text-transparent"
                        }`}
                      >
                        ✓
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900">{item.label}</p>
                        {item.helper && (
                          <p className="text-xs text-gray-500">{item.helper}</p>
                        )}
                      </div>
                      {done && (
                        <span className="text-xs font-medium text-gray-500">
                          Confirmed live
                        </span>
                      )}
                    </form>
                  );
                })}
                <p className="pt-1 text-xs text-gray-500">
                  These moments happen with a real person, check each one off together, in
                  person or on a call. Nothing here completes on its own.
                </p>
              </div>
            )}

            {module.type === "REFLECTION" && (
              <form action={submitReflection.bind(null, module.id)} className="space-y-5">
                {module.reflectionQs.map((q) => (
                  <div key={q.id}>
                    <label className="block text-sm font-bold text-gray-900">{q.prompt}</label>
                    <textarea
                      name={`rq_${q.id}`}
                      rows={3}
                      required
                      className="mt-2 w-full brand-shape-sm border border-gray-300 p-3 text-sm text-gray-800 focus:border-brand-red focus:outline-none"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-bold text-gray-900">
                    How likely are you to recommend MSM Unify as a place to work? (0–10)
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Array.from({ length: 11 }).map((_, n) => (
                      <label key={n}>
                        <input type="radio" name="nps" value={n} required className="peer sr-only" />
                        <span className="flex h-9 w-9 cursor-pointer items-center justify-center brand-shape-sm border border-gray-300 text-sm font-semibold text-gray-700 peer-checked:border-brand-red peer-checked:bg-brand-red peer-checked:text-white">
                          {n}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="press brand-shape bg-brand-red px-6 py-2.5 text-sm font-bold text-white hover:brightness-90"
                >
                  Submit reflection
                </button>
              </form>
            )}

            {module.type === "BRIEFING" && (
              <div>
                <div className="brand-shape border border-gray-300 bg-white p-6 leading-relaxed text-gray-700 whitespace-pre-line">
                  {module.body}
                </div>
                <form action={markVideoWatched.bind(null, module.id)} className="mt-6">
                  <button
                    type="submit"
                    className="press brand-shape bg-brand-red px-6 py-2.5 text-sm font-bold text-white hover:brightness-90"
                  >
                    {progress?.status === "COMPLETE" ? "Reviewed, mark again" : "I've reviewed this briefing"}
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="mt-10 flex items-center justify-between border-t border-gray-300 pt-6">
            <span className="text-xs text-gray-400">
              {done ? "Marked complete" : "You can continue and come back to this later"}
            </span>
            <Link
              href={continueHref}
              className="press brand-shape bg-gray-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-black"
            >
              {continueLabel} &rarr;
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
