import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { trackCompletionStats } from "@/lib/track";

export default async function IssueCertificatePage() {
  const user = await requireUser();

  let cert = await prisma.certificate.findFirst({ where: { userId: user.id } });
  if (!cert) {
    const stats = await trackCompletionStats(user.id, user.track);
    if (!stats.isComplete) redirect("/dashboard");
    const slug = `${user.id.slice(0, 8)}-${Date.now().toString(36)}`;
    cert = await prisma.certificate.create({
      data: { userId: user.id, track: user.track, slug },
    });
  }

  redirect(`/certificate/${cert.slug}`);
}
