"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { setSession } from "@/lib/auth";

export async function loginAs(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Unknown user");
  await setSession(user.id);
  redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
}
