import { prisma } from "@/lib/db";
import type { User } from "@prisma/client";

export type ModuleWithChildren = Awaited<
  ReturnType<typeof getModulesForUser>
>[number];

export async function getModulesForUser(user: User) {
  const modules = await prisma.module.findMany({
    where: { OR: [{ track: "BOTH" }, { track: user.track }] },
    orderBy: [{ day: "asc" }, { order: "asc" }],
    include: {
      quizQuestions: { orderBy: { order: "asc" } },
      checklistItems: { orderBy: { order: "asc" } },
      mapPoints: { orderBy: { order: "asc" } },
      reflectionQs: { orderBy: { order: "asc" } },
    },
  });
  return modules;
}

const XP_BASE: Record<string, number> = {
  VIDEO: 100,
  MAP: 100,
  CHECKLIST: 100,
  BRIEFING: 100,
  QUIZ: 100,
  REFLECTION: 150,
};

const LEVEL_STEP = 300;

export function levelForXp(xp: number) {
  return 1 + Math.floor(xp / LEVEL_STEP);
}

export function xpIntoLevel(xp: number) {
  return xp % LEVEL_STEP;
}

/** XP per module: flat base, quiz modules add a bonus equal to their best score %. */
export async function computeGamification(userId: string, modules: ModuleWithChildren[]) {
  const progress = await getProgressMap(userId);
  const attempts = await prisma.quizAttempt.findMany({ where: { userId } });
  const bestScoreByModule = new Map<string, number>();
  for (const a of attempts) {
    const prev = bestScoreByModule.get(a.moduleId) ?? 0;
    if (a.scorePct > prev) bestScoreByModule.set(a.moduleId, a.scorePct);
  }

  let xp = 0;
  const badges: { moduleId: string; type: string; title: string }[] = [];
  for (const m of modules) {
    if (progress.get(m.id)?.status !== "COMPLETE") continue;
    let gained = XP_BASE[m.type] ?? 100;
    if (m.type === "QUIZ") gained += bestScoreByModule.get(m.id) ?? 0;
    xp += gained;
    badges.push({ moduleId: m.id, type: m.type, title: m.title });
  }

  return { xp, level: levelForXp(xp), xpIntoLevel: xpIntoLevel(xp), levelStep: LEVEL_STEP, badges };
}

export async function getProgressMap(userId: string) {
  const rows = await prisma.progress.findMany({ where: { userId } });
  const map = new Map<string, (typeof rows)[number]>();
  for (const r of rows) map.set(r.moduleId, r);
  return map;
}

export async function markProgress(
  userId: string,
  moduleId: string,
  status: "IN_PROGRESS" | "COMPLETE"
) {
  await prisma.progress.upsert({
    where: { userId_moduleId: { userId, moduleId } },
    create: {
      userId,
      moduleId,
      status,
      completedAt: status === "COMPLETE" ? new Date() : null,
    },
    update: {
      status,
      completedAt: status === "COMPLETE" ? new Date() : undefined,
    },
  });
}

export function getAdjacentModuleSlugs(
  modules: ModuleWithChildren[],
  currentModuleId: string
) {
  const idx = modules.findIndex((m) => m.id === currentModuleId);
  return {
    index: idx,
    total: modules.length,
    nextSlug: idx >= 0 && idx < modules.length - 1 ? modules[idx + 1].slug : null,
    prevSlug: idx > 0 ? modules[idx - 1].slug : null,
    isLast: idx === modules.length - 1,
  };
}

export async function trackCompletionStats(userId: string, track: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const modules = await getModulesForUser(user);
  const progress = await getProgressMap(userId);
  const total = modules.length;
  const complete = modules.filter(
    (m) => progress.get(m.id)?.status === "COMPLETE"
  ).length;
  return { total, complete, isComplete: total > 0 && complete === total };
}
