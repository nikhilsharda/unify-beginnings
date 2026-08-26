import Image from "next/image";
import { MSM_LOGO_DATA_URI } from "@/lib/logo";
import { prisma } from "@/lib/db";
import { loginAs } from "./actions";
import { RevealBlock, RevealGroup, RevealItem } from "@/components/motion";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = ["#E8252A", "#005BAA", "#FCAF17"];

export default async function LoginPage() {
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { track: "asc" }, { name: "asc" }],
    include: { cohort: true },
  });

  const admins = users.filter((u) => u.role === "ADMIN");
  const leadership = users.filter(
    (u) => u.role === "LEARNER" && u.track === "LEADERSHIP"
  );
  const foundation = users.filter(
    (u) => u.role === "LEARNER" && u.track === "FOUNDATION"
  );

  const groups = [
    {
      label: "Foundation Track",
      hint: "Director-level and below",
      people: foundation,
    },
    {
      label: "Leadership Track",
      hint: "Director and above, includes the Leadership Portal",
      people: leadership,
    },
    { label: "Admin", hint: "Mission Score and content editor", people: admins },
  ];

  return (
    <main className="relative flex min-h-[100dvh] w-full flex-col md:flex-row">
      {/* Left: sign-in */}
      <div className="flex w-full flex-col justify-center bg-white px-6 py-12 sm:px-12 md:w-1/2 md:px-16">
        <div className="mx-auto w-full max-w-md">
          <RevealBlock>
            <Image
              src={MSM_LOGO_DATA_URI}
              alt="MSM Unify"
              width={130}
              height={42}
              className="h-8 w-auto"
              priority
              unoptimized
            />
          </RevealBlock>
          <RevealBlock delay={0.06}>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-brand-blue">
              Unify Beginnings
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-gray-900">
              Start your onboarding session.
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              One sitting, about 2 hours. Pick your name to begin, no password needed.
            </p>
          </RevealBlock>

          <RevealBlock delay={0.12} className="mt-8 max-h-[52vh] space-y-8 overflow-y-auto pr-1 scrollbar-thin md:max-h-[56vh]">
            {groups.map(
              (group) =>
                group.people.length > 0 && (
                  <section key={group.label}>
                    <div className="mb-3 flex items-baseline gap-2">
                      <h2 className="text-sm font-bold text-gray-900">{group.label}</h2>
                      <span className="text-xs text-gray-400">{group.hint}</span>
                    </div>
                    <RevealGroup className="space-y-2">
                      {group.people.map((u, i) => (
                        <RevealItem key={u.id}>
                          <form action={loginAs.bind(null, u.id)}>
                            <button
                              type="submit"
                              className="group elev-hover press flex w-full items-center gap-3 brand-shape-sm border border-gray-200 bg-white p-3 text-left"
                            >
                              <span
                                className="flex h-10 w-10 shrink-0 items-center justify-center brand-shape-sm text-xs font-bold text-white"
                                style={{
                                  background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                                }}
                              >
                                {initials(u.name)}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold text-gray-900 group-hover:text-brand-red">
                                  {u.name}
                                </span>
                                <span className="block truncate text-xs text-gray-500">
                                  {u.title}
                                </span>
                              </span>
                              <span className="shrink-0 text-gray-300 group-hover:text-brand-red">
                                &rarr;
                              </span>
                            </button>
                          </form>
                        </RevealItem>
                      ))}
                    </RevealGroup>
                  </section>
                )
            )}
          </RevealBlock>

          <RevealBlock delay={0.18}>
            <p className="mt-8 text-xs text-gray-400">
              Pilot demo login. Real SSO or magic-link sign-in slots in here later without
              touching any other page.
            </p>
          </RevealBlock>
        </div>
      </div>

      {/* Right: brand panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gray-900 md:block">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, rgba(232,37,42,0.35), transparent 45%), radial-gradient(circle at 80% 75%, rgba(0,91,170,0.35), transparent 50%)",
          }}
        />
        <svg className="absolute inset-0 h-full w-full opacity-[0.07]" viewBox="0 0 100 100" preserveAspectRatio="none">
          {Array.from({ length: 13 }).map((_, i) => (
            <line key={`h${i}`} x1={0} x2={100} y1={i * 8} y2={i * 8} stroke="white" strokeWidth={0.1} />
          ))}
          {Array.from({ length: 13 }).map((_, i) => (
            <line key={`v${i}`} y1={0} y2={100} x1={i * 8} x2={i * 8} stroke="white" strokeWidth={0.1} />
          ))}
        </svg>

        <div className="absolute -right-24 -top-24 h-96 w-96 brand-shape-lg border border-white/10" />
        <div className="absolute -bottom-32 -left-16 h-72 w-72 brand-shape-lg bg-brand-red/10" />

        <div className="relative flex h-full flex-col justify-end p-14 text-white">
          <RevealBlock delay={0.15}>
            <p className="quote max-w-md text-2xl leading-snug text-white">
              &ldquo;Building Nations with Education and Workforce Development.&rdquo;
            </p>
            <p className="mt-3 text-sm text-gray-400">Sanjay Laul, Founder, MSM Unify</p>

            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
              <div>
                <p className="text-2xl font-bold tabular-nums text-brand-yellow">30+</p>
                <p className="mt-1 text-xs text-gray-400">Countries</p>
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums text-brand-yellow">400+</p>
                <p className="mt-1 text-xs text-gray-400">Partner institutions</p>
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums text-brand-yellow">1M+</p>
                <p className="mt-1 text-xs text-gray-400">Lives impacted</p>
              </div>
            </div>
          </RevealBlock>
        </div>
      </div>
    </main>
  );
}
