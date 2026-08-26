import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Nav } from "@/components/nav";
import { ModuleIcon } from "@/components/module-icon";

export default async function EditorIndexPage() {
  const admin = await requireAdmin();
  const modules = await prisma.module.findMany({
    orderBy: [{ track: "asc" }, { day: "asc" }, { order: "asc" }],
  });

  return (
    <>
      <Nav user={admin} />
      <main className="flex-1 bg-gray-100">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-blue">
            Admin
          </p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">Content Editor</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update module copy, quiz questions, video links, and map points, no deploy
            needed.
          </p>

          <div className="mt-8 space-y-3">
            {modules.map((m) => (
              <Link
                key={m.id}
                href={`/admin/editor/${m.slug}`}
                className="flex items-center gap-4 brand-shape border border-gray-300 bg-white p-4 hover:border-brand-red hover:shadow-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center brand-shape-sm bg-gray-100 text-brand-red">
                  <ModuleIcon type={m.type} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900">{m.title}</p>
                  <p className="text-xs text-gray-500">
                    {m.track} &middot; {m.type}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
