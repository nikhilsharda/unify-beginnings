"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { markProgress } from "@/lib/track";

export async function markVideoWatched(moduleId: string) {
  const user = await requireUser();
  await markProgress(user.id, moduleId, "COMPLETE");
  revalidatePath("/dashboard");
}

export async function submitQuiz(moduleId: string, formData: FormData) {
  const user = await requireUser();
  const module = await prisma.module.findUniqueOrThrow({
    where: { id: moduleId },
    include: { quizQuestions: { orderBy: { order: "asc" } } },
  });

  let correct = 0;
  for (const q of module.quizQuestions) {
    const answer = formData.get(`q_${q.id}`);
    if (answer !== null && Number(answer) === q.correctIndex) correct++;
  }
  const total = module.quizQuestions.length;
  const scorePct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = scorePct >= module.passThreshold;

  await prisma.quizAttempt.create({
    data: { userId: user.id, moduleId, scorePct, passed },
  });

  if (passed) {
    await markProgress(user.id, moduleId, "COMPLETE");
  } else {
    await markProgress(user.id, moduleId, "IN_PROGRESS");
  }

  revalidatePath(`/dashboard/module/${module.slug}`);
  redirect(`/dashboard/module/${module.slug}?result=1`);
}

export async function toggleChecklistItem(
  moduleId: string,
  itemId: string,
  formData: FormData
) {
  const user = await requireUser();
  const completedWith = String(formData.get("completedWith") ?? "");
  const existing = await prisma.checklistCompletion.findUnique({
    where: { userId_itemId: { userId: user.id, itemId } },
  });

  if (existing) {
    await prisma.checklistCompletion.delete({ where: { id: existing.id } });
  } else {
    await prisma.checklistCompletion.create({
      data: { userId: user.id, itemId, completedWith: completedWith || null },
    });
  }

  const module = await prisma.module.findUniqueOrThrow({
    where: { id: moduleId },
    include: { checklistItems: true },
  });
  const doneCount = await prisma.checklistCompletion.count({
    where: { userId: user.id, itemId: { in: module.checklistItems.map((i) => i.id) } },
  });
  if (doneCount === module.checklistItems.length && module.checklistItems.length > 0) {
    await markProgress(user.id, moduleId, "COMPLETE");
  } else {
    await markProgress(user.id, moduleId, "IN_PROGRESS");
  }

  revalidatePath(`/dashboard/module/${module.slug}`);
}

export async function submitReflection(moduleId: string, formData: FormData) {
  const user = await requireUser();
  const module = await prisma.module.findUniqueOrThrow({
    where: { id: moduleId },
    include: { reflectionQs: { orderBy: { order: "asc" } } },
  });

  const answers = module.reflectionQs.map((q) => ({
    question: q.prompt,
    answer: String(formData.get(`rq_${q.id}`) ?? ""),
  }));
  const npsScore = Number(formData.get("nps") ?? 0);

  await prisma.reflection.create({
    data: { userId: user.id, moduleId, answers: JSON.stringify(answers), npsScore },
  });
  await markProgress(user.id, moduleId, "COMPLETE");

  revalidatePath("/dashboard");
  redirect(`/dashboard/module/${module.slug}?result=1`);
}

export async function markMapExplored(moduleId: string) {
  const user = await requireUser();
  await markProgress(user.id, moduleId, "COMPLETE");
  revalidatePath("/dashboard");
}
