import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Nav } from "@/components/nav";
import { BrandGraphic } from "@/components/brand-graphic";
import { RevealBlock, RevealGroup, RevealItem } from "@/components/motion";

export default async function LeadershipPortalPage() {
  const user = await requireUser();
  if (user.track !== "LEADERSHIP") redirect("/dashboard");

  const briefings = await prisma.module.findMany({
    where: { type: "BRIEFING", track: "LEADERSHIP" },
    orderBy: { order: "asc" },
  });

  return (
    <>
      <Nav user={user} />
      <main className="flex-1 bg-gray-100">
        <div className="relative overflow-hidden bg-gray-900 text-white">
          <BrandGraphic tone="blue" className="-right-16 -top-16 h-64 w-64" />
          <div className="relative mx-auto max-w-5xl px-6 py-14">
            <RevealBlock>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-yellow">
                Leadership Portal
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                What Director-level ownership looks like here.
              </h1>
              <p className="quote mt-5 max-w-2xl text-lg leading-relaxed text-gray-300">
                &ldquo;65% of our leadership is women. 34% of our leaders are under 30. We
                hand over real responsibility early, on purpose.&rdquo;
              </p>
            </RevealBlock>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-6 py-10">
          <RevealGroup className="space-y-4">
            {briefings.map((b) => (
              <RevealItem key={b.id}>
                <Link
                  href={`/dashboard/module/${b.slug}`}
                  className="elev-hover block brand-shape border border-gray-300 bg-white p-6"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">
                    Strategic Briefing
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-gray-900">{b.title}</h2>
                  {b.subtitle && <p className="mt-1 text-sm text-gray-500">{b.subtitle}</p>}
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
          {briefings.length === 0 && (
            <p className="text-sm text-gray-500">No briefings published yet.</p>
          )}
        </div>
      </main>
    </>
  );
}
