import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getModulesForUser, getProgressMap } from "@/lib/track";
import { Nav } from "@/components/nav";

export default async function AdminPage() {
  const admin = await requireAdmin();

  const users = await prisma.user.findMany({
    where: { role: "LEARNER" },
    orderBy: { name: "asc" },
    include: { cohort: true },
  });

  const rows = await Promise.all(
    users.map(async (u) => {
      const modules = await getModulesForUser(u);
      const progress = await getProgressMap(u.id);
      const complete = modules.filter((m) => progress.get(m.id)?.status === "COMPLETE").length;
      const total = modules.length;

      const attempts = await prisma.quizAttempt.findMany({ where: { userId: u.id } });
      const avgQuiz =
        attempts.length > 0
          ? Math.round(attempts.reduce((s, a) => s + a.scorePct, 0) / attempts.length)
          : null;

      const reflections = await prisma.reflection.findMany({ where: { userId: u.id } });
      const avgNps =
        reflections.length > 0
          ? Math.round(
              (reflections.reduce((s, r) => s + r.npsScore, 0) / reflections.length) * 10
            ) / 10
          : null;

      const hasCert = (await prisma.certificate.count({ where: { userId: u.id } })) > 0;

      return { user: u, complete, total, avgQuiz, avgNps, hasCert };
    })
  );

  const withQuiz = rows.filter((r) => r.avgQuiz !== null);
  const withNps = rows.filter((r) => r.avgNps !== null);
  const orgAvgQuiz =
    withQuiz.length > 0
      ? Math.round(withQuiz.reduce((s, r) => s + (r.avgQuiz ?? 0), 0) / withQuiz.length)
      : null;
  const orgAvgNps =
    withNps.length > 0
      ? Math.round(
          (withNps.reduce((s, r) => s + (r.avgNps ?? 0), 0) / withNps.length) * 10
        ) / 10
      : null;
  const orgCertRate =
    rows.length > 0 ? Math.round((rows.filter((r) => r.hasCert).length / rows.length) * 100) : 0;

  return (
    <>
      <Nav user={admin} />
      <main className="flex-1 bg-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-blue">
            Admin
          </p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">Onboarding Mission Score</h1>
          <p className="mt-1 text-sm text-gray-500">
            Every joiner&rsquo;s progress, quiz performance, and Day-1 sentiment, at a glance.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="brand-shape border border-gray-300 bg-white p-5">
              <p className="text-xs font-semibold uppercase text-gray-500">Joiners tracked</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{rows.length}</p>
              <p className="mt-1 text-xs text-gray-500">{orgCertRate}% certified</p>
            </div>
            <div className="brand-shape border border-gray-300 bg-white p-5">
              <p className="text-xs font-semibold uppercase text-gray-500">Avg quiz score</p>
              <p className="mt-1 text-3xl font-bold text-brand-red">
                {orgAvgQuiz !== null ? `${orgAvgQuiz}%` : "-"}
              </p>
            </div>
            <div className="brand-shape border border-gray-300 bg-white p-5">
              <p className="text-xs font-semibold uppercase text-gray-500">Avg Day-1 NPS</p>
              <p className="mt-1 text-3xl font-bold text-brand-blue">
                {orgAvgNps !== null ? orgAvgNps : "-"}
              </p>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto brand-shape border border-gray-300 bg-white scrollbar-thin">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-gray-300 bg-gray-100 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Track</th>
                  <th className="px-4 py-3">Cohort</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Avg Quiz</th>
                  <th className="px-4 py-3">Day-1 NPS</th>
                  <th className="px-4 py-3">Certificate</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const pct = r.total > 0 ? Math.round((r.complete / r.total) * 100) : 0;
                  return (
                    <tr key={r.user.id} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{r.user.name}</p>
                        <p className="text-xs text-gray-500">{r.user.title}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`brand-shape-sm px-2 py-0.5 text-xs font-semibold ${
                            r.user.track === "LEADERSHIP"
                              ? "bg-brand-blue/10 text-brand-blue"
                              : "bg-brand-red/10 text-brand-red"
                          }`}
                        >
                          {r.user.track === "LEADERSHIP" ? "Leadership" : "Foundation"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.user.cohort?.name ?? "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-brand-red"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {r.complete}/{r.total}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {r.avgQuiz !== null ? `${r.avgQuiz}%` : "-"}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {r.avgNps !== null ? r.avgNps : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {r.hasCert ? (
                          <span className="text-xs font-semibold text-brand-red">Issued</span>
                        ) : (
                          <span className="text-xs text-gray-400">Pending</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
