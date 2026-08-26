import Image from "next/image";
import { MSM_LOGO_DATA_URI } from "@/lib/logo";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { BrandGraphic } from "@/components/brand-graphic";
import { RevealBlock } from "@/components/motion";
import { CertificateActions } from "@/components/certificate-actions";

export default async function CertificatePage(
  props: PageProps<"/certificate/[slug]">
) {
  const { slug } = await props.params;
  const cert = await prisma.certificate.findUnique({
    where: { slug },
    include: { user: true },
  });
  if (!cert) notFound();

  const trackLabel = cert.track === "FOUNDATION" ? "Foundation Track" : "Leadership Track";

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-gray-900 p-6">
      <RevealBlock className="w-full max-w-3xl">
        <div
          id="certificate-card"
          className="relative overflow-hidden brand-shape-lg border-4 border-brand-red bg-white p-10 sm:p-14"
        >
          <BrandGraphic tone="red" className="-right-16 -top-16 h-56 w-56" />
          <BrandGraphic tone="blue" className="-left-12 bottom-[-4rem] h-40 w-40" />

          <div className="relative text-center">
            <Image
              src={MSM_LOGO_DATA_URI}
              alt="MSM Unify"
              width={150}
              height={48}
              className="mx-auto h-10 w-auto" unoptimized />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-blue">
              Unify Beginnings
            </p>
            <h1 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl">
              Certificate of Completion
            </h1>
            <p className="mt-6 text-sm text-gray-500">This certifies that</p>
            <p className="quote mt-1 text-3xl font-bold text-gray-900 sm:text-4xl">
              {cert.user.name}
            </p>
            <p className="mt-4 text-gray-600">
              has successfully completed the{" "}
              <span className="font-semibold text-brand-red">{trackLabel}</span> of Unify
              Beginnings, MSM Unify&rsquo;s onboarding experience for new joiners.
            </p>
            <p className="quote mt-6 text-gray-500">
              &ldquo;Building Nations with Education and Workforce Development.&rdquo;
            </p>

            <div className="mt-10 flex items-center justify-center gap-10 text-sm">
              <div>
                <p className="font-semibold tabular-nums text-gray-900">
                  {format(cert.issuedAt, "MMMM d, yyyy")}
                </p>
                <p className="text-gray-500">Date Issued</p>
              </div>
              <div className="h-10 w-px bg-gray-300" />
              <div>
                <p className="font-semibold text-gray-900">{cert.user.title}</p>
                <p className="text-gray-500">{cert.user.vertical}</p>
              </div>
            </div>
          </div>
        </div>

        <CertificateActions
          targetId="certificate-card"
          fileName={`${cert.user.name.replace(/\s+/g, "-").toLowerCase()}-unify-beginnings-certificate.pdf`}
          path={`/certificate/${cert.slug}`}
          shareText={`I just completed Unify Beginnings, MSM Unify's onboarding experience.`}
        />

        <p className="mt-6 text-center text-xs text-gray-500">
          Verify at unifybeginnings/certificate/{cert.slug}, no login required
        </p>
      </RevealBlock>
    </main>
  );
}
