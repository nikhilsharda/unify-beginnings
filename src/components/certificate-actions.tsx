"use client";

import { useEffect, useState } from "react";

export function CertificateActions({
  targetId,
  fileName,
  path,
  shareText,
}: {
  targetId: string;
  fileName: string;
  path: string;
  shareText: string;
}) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState(path);

  useEffect(() => {
    setShareUrl(`${window.location.origin}${path}`);
  }, [path]);

  async function downloadPdf() {
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);
      const node = document.getElementById(targetId);
      if (!node) return;
      const canvas = await html2canvas(node, { scale: 2, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(fileName);
    } finally {
      setDownloading(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const linkedinHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const xHref = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      <button
        onClick={downloadPdf}
        disabled={downloading}
        className="press brand-shape bg-brand-red px-5 py-2.5 text-sm font-bold text-white hover:brightness-90 disabled:opacity-60"
      >
        {downloading ? "Preparing PDF..." : "Download as PDF"}
      </button>
      <a
        href={linkedinHref}
        target="_blank"
        rel="noopener noreferrer"
        className="press brand-shape-sm border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-brand-blue hover:text-brand-blue"
      >
        Share on LinkedIn
      </a>
      <a
        href={xHref}
        target="_blank"
        rel="noopener noreferrer"
        className="press brand-shape-sm border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-gray-900 hover:text-gray-900"
      >
        Share on X
      </a>
      <button
        onClick={copyLink}
        className="press brand-shape-sm border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-brand-red hover:text-brand-red"
      >
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}
