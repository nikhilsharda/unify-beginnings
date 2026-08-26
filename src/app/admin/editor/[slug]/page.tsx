import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Nav } from "@/components/nav";
import {
  updateModuleBasics,
  addQuizQuestion,
  deleteQuizQuestion,
  addChecklistItem,
  deleteChecklistItem,
  addMapPoint,
  deleteMapPoint,
  addReflectionQuestion,
  deleteReflectionQuestion,
} from "./actions";

export default async function EditorModulePage(
  props: PageProps<"/admin/editor/[slug]">
) {
  const { slug } = await props.params;
  const admin = await requireAdmin();
  const m = await prisma.module.findUnique({
    where: { slug },
    include: {
      quizQuestions: { orderBy: { order: "asc" } },
      checklistItems: { orderBy: { order: "asc" } },
      mapPoints: { orderBy: { order: "asc" } },
      reflectionQs: { orderBy: { order: "asc" } },
    },
  });
  if (!m) notFound();

  return (
    <>
      <Nav user={admin} />
      <main className="flex-1 bg-gray-100">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <Link href="/admin/editor" className="text-sm font-medium text-gray-500 hover:text-brand-red">
            &larr; All modules
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">{m.title}</h1>
          <p className="text-sm text-gray-500">
            {m.type} &middot; {m.track}
          </p>

          <form
            action={updateModuleBasics.bind(null, m.id)}
            className="mt-6 space-y-4 brand-shape border border-gray-300 bg-white p-6"
          >
            <h2 className="text-sm font-bold uppercase tracking-wide text-brand-blue">
              Copy
            </h2>
            <Field label="Title">
              <input name="title" defaultValue={m.title} className="input" />
            </Field>
            <Field label="Subtitle">
              <input name="subtitle" defaultValue={m.subtitle ?? ""} className="input" />
            </Field>
            <Field label="Body">
              <textarea name="body" defaultValue={m.body} rows={5} className="input" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Quote text">
                <input name="quoteText" defaultValue={m.quoteText ?? ""} className="input" />
              </Field>
              <Field label="Quote author">
                <input name="quoteAuthor" defaultValue={m.quoteAuthor ?? ""} className="input" />
              </Field>
            </div>
            {(m.type === "VIDEO" || m.type === "BRIEFING") && (
              <div className="grid grid-cols-2 gap-4 items-end">
                <Field label="Video URL">
                  <input name="videoUrl" defaultValue={m.videoUrl ?? ""} className="input" />
                </Field>
                <label className="flex items-center gap-2 pb-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="videoIsPlaceholder"
                    defaultChecked={m.videoIsPlaceholder}
                  />
                  Show branded placeholder (no real video yet)
                </label>
              </div>
            )}
            {m.type === "QUIZ" && (
              <Field label="Pass threshold (%)">
                <input
                  name="passThreshold"
                  type="number"
                  defaultValue={m.passThreshold}
                  className="input w-28"
                />
              </Field>
            )}
            <button type="submit" className="brand-shape-sm bg-brand-red px-5 py-2 text-sm font-bold text-white hover:brightness-90">
              Save copy
            </button>
          </form>

          {m.type === "QUIZ" && (
            <section className="mt-6 brand-shape border border-gray-300 bg-white p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-brand-blue">
                Quiz questions
              </h2>
              <div className="mt-4 space-y-3">
                {m.quizQuestions.map((q, i) => {
                  const opts: string[] = JSON.parse(q.options);
                  return (
                    <div key={q.id} className="brand-shape-sm border border-gray-200 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-900">
                          {i + 1}. {q.question}
                        </p>
                        <form action={deleteQuizQuestion.bind(null, m.id, q.id)}>
                          <button className="text-xs font-medium text-gray-400 hover:text-brand-red">
                            Remove
                          </button>
                        </form>
                      </div>
                      <ul className="mt-2 space-y-1 text-xs text-gray-600">
                        {opts.map((o, oi) => (
                          <li key={oi} className={oi === q.correctIndex ? "font-bold text-brand-red" : ""}>
                            {oi === q.correctIndex ? "✓ " : "• "}
                            {o}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              <form action={addQuizQuestion.bind(null, m.id)} className="mt-5 space-y-3 border-t border-gray-200 pt-5">
                <Field label="New question">
                  <input name="question" required className="input" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <input name="opt0" placeholder="Option A" required className="input" />
                  <input name="opt1" placeholder="Option B" required className="input" />
                  <input name="opt2" placeholder="Option C" className="input" />
                  <input name="opt3" placeholder="Option D" className="input" />
                </div>
                <Field label="Correct option index (0 = A, 1 = B, ...)">
                  <input name="correctIndex" type="number" defaultValue={0} min={0} max={3} className="input w-24" />
                </Field>
                <Field label="Explanation (optional)">
                  <input name="explanation" className="input" />
                </Field>
                <button type="submit" className="brand-shape-sm bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
                  Add question
                </button>
              </form>
            </section>
          )}

          {m.type === "CHECKLIST" && (
            <section className="mt-6 brand-shape border border-gray-300 bg-white p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-brand-blue">
                Checklist items
              </h2>
              <div className="mt-4 space-y-2">
                {m.checklistItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between brand-shape-sm border border-gray-200 p-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                      {item.helper && <p className="text-xs text-gray-500">{item.helper}</p>}
                    </div>
                    <form action={deleteChecklistItem.bind(null, m.id, item.id)}>
                      <button className="text-xs font-medium text-gray-400 hover:text-brand-red">Remove</button>
                    </form>
                  </div>
                ))}
              </div>
              <form action={addChecklistItem.bind(null, m.id)} className="mt-5 space-y-3 border-t border-gray-200 pt-5">
                <Field label="Item label">
                  <input name="label" required className="input" />
                </Field>
                <Field label="Helper text (optional)">
                  <input name="helper" className="input" />
                </Field>
                <button type="submit" className="brand-shape-sm bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
                  Add item
                </button>
              </form>
            </section>
          )}

          {m.type === "MAP" && (
            <section className="mt-6 brand-shape border border-gray-300 bg-white p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-brand-blue">
                Map points
              </h2>
              <div className="mt-4 space-y-2">
                {m.mapPoints.map((p) => (
                  <div key={p.id} className="flex items-center justify-between brand-shape-sm border border-gray-200 p-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {p.country} <span className="text-xs font-normal text-gray-400">({p.x}%, {p.y}%)</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {p.partners} partners &middot; {p.channelPartners} channel partners &middot; {p.livesImpacted} lives
                      </p>
                    </div>
                    <form action={deleteMapPoint.bind(null, m.id, p.id)}>
                      <button className="text-xs font-medium text-gray-400 hover:text-brand-red">Remove</button>
                    </form>
                  </div>
                ))}
              </div>
              <form action={addMapPoint.bind(null, m.id)} className="mt-5 space-y-3 border-t border-gray-200 pt-5">
                <div className="grid grid-cols-3 gap-3">
                  <input name="country" placeholder="Country" required className="input" />
                  <input name="x" type="number" step="0.1" placeholder="X % (0-100)" required className="input" />
                  <input name="y" type="number" step="0.1" placeholder="Y % (0-100)" required className="input" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input name="partners" type="number" placeholder="Partners" className="input" />
                  <input name="channelPartners" type="number" placeholder="Channel partners" className="input" />
                  <input name="livesImpacted" type="number" placeholder="Lives impacted" className="input" />
                </div>
                <textarea name="blurb" placeholder="Blurb" rows={2} className="input" />
                <button type="submit" className="brand-shape-sm bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
                  Add point
                </button>
              </form>
            </section>
          )}

          {m.type === "REFLECTION" && (
            <section className="mt-6 brand-shape border border-gray-300 bg-white p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-brand-blue">
                Reflection questions
              </h2>
              <div className="mt-4 space-y-2">
                {m.reflectionQs.map((q) => (
                  <div key={q.id} className="flex items-center justify-between brand-shape-sm border border-gray-200 p-3">
                    <p className="text-sm text-gray-900">{q.prompt}</p>
                    <form action={deleteReflectionQuestion.bind(null, m.id, q.id)}>
                      <button className="text-xs font-medium text-gray-400 hover:text-brand-red">Remove</button>
                    </form>
                  </div>
                ))}
              </div>
              <form action={addReflectionQuestion.bind(null, m.id)} className="mt-5 flex gap-3 border-t border-gray-200 pt-5">
                <input name="prompt" placeholder="New reflection question" required className="input flex-1" />
                <button type="submit" className="brand-shape-sm bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
                  Add
                </button>
              </form>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-gray-600">{label}</span>
      {children}
    </label>
  );
}
