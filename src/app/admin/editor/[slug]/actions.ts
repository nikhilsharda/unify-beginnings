"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

async function moduleSlug(moduleId: string) {
  const m = await prisma.module.findUniqueOrThrow({ where: { id: moduleId } });
  return m.slug;
}

function revalidate(slug: string) {
  revalidatePath(`/admin/editor/${slug}`);
  revalidatePath(`/dashboard/module/${slug}`);
}

export async function updateModuleBasics(moduleId: string, formData: FormData) {
  await requireAdmin();
  const data = {
    title: String(formData.get("title") ?? ""),
    subtitle: String(formData.get("subtitle") ?? "") || null,
    body: String(formData.get("body") ?? ""),
    quoteText: String(formData.get("quoteText") ?? "") || null,
    quoteAuthor: String(formData.get("quoteAuthor") ?? "") || null,
    videoUrl: String(formData.get("videoUrl") ?? "") || null,
    videoIsPlaceholder: formData.get("videoIsPlaceholder") === "on",
    passThreshold: Number(formData.get("passThreshold") ?? 80),
  };
  await prisma.module.update({ where: { id: moduleId }, data });
  revalidate(await moduleSlug(moduleId));
}

// Quiz questions
export async function addQuizQuestion(moduleId: string, formData: FormData) {
  await requireAdmin();
  const options = [
    String(formData.get("opt0") ?? ""),
    String(formData.get("opt1") ?? ""),
    String(formData.get("opt2") ?? ""),
    String(formData.get("opt3") ?? ""),
  ].filter(Boolean);
  await prisma.quizQuestion.create({
    data: {
      moduleId,
      question: String(formData.get("question") ?? ""),
      options: JSON.stringify(options),
      correctIndex: Number(formData.get("correctIndex") ?? 0),
      explanation: String(formData.get("explanation") ?? "") || null,
      order: await prisma.quizQuestion.count({ where: { moduleId } }),
    },
  });
  revalidate(await moduleSlug(moduleId));
}

export async function deleteQuizQuestion(moduleId: string, questionId: string) {
  await requireAdmin();
  await prisma.quizQuestion.delete({ where: { id: questionId } });
  revalidate(await moduleSlug(moduleId));
}

// Checklist items
export async function addChecklistItem(moduleId: string, formData: FormData) {
  await requireAdmin();
  await prisma.checklistItem.create({
    data: {
      moduleId,
      label: String(formData.get("label") ?? ""),
      helper: String(formData.get("helper") ?? "") || null,
      order: await prisma.checklistItem.count({ where: { moduleId } }),
    },
  });
  revalidate(await moduleSlug(moduleId));
}

export async function deleteChecklistItem(moduleId: string, itemId: string) {
  await requireAdmin();
  await prisma.checklistItem.delete({ where: { id: itemId } });
  revalidate(await moduleSlug(moduleId));
}

// Map points
export async function addMapPoint(moduleId: string, formData: FormData) {
  await requireAdmin();
  await prisma.mapPoint.create({
    data: {
      moduleId,
      country: String(formData.get("country") ?? ""),
      x: Number(formData.get("x") ?? 50),
      y: Number(formData.get("y") ?? 50),
      partners: Number(formData.get("partners") ?? 0),
      channelPartners: Number(formData.get("channelPartners") ?? 0),
      livesImpacted: Number(formData.get("livesImpacted") ?? 0),
      blurb: String(formData.get("blurb") ?? ""),
      order: await prisma.mapPoint.count({ where: { moduleId } }),
    },
  });
  revalidate(await moduleSlug(moduleId));
}

export async function deleteMapPoint(moduleId: string, pointId: string) {
  await requireAdmin();
  await prisma.mapPoint.delete({ where: { id: pointId } });
  revalidate(await moduleSlug(moduleId));
}

// Reflection questions
export async function addReflectionQuestion(moduleId: string, formData: FormData) {
  await requireAdmin();
  await prisma.reflectionQuestion.create({
    data: {
      moduleId,
      prompt: String(formData.get("prompt") ?? ""),
      order: await prisma.reflectionQuestion.count({ where: { moduleId } }),
    },
  });
  revalidate(await moduleSlug(moduleId));
}

export async function deleteReflectionQuestion(moduleId: string, qId: string) {
  await requireAdmin();
  await prisma.reflectionQuestion.delete({ where: { id: qId } });
  revalidate(await moduleSlug(moduleId));
}
