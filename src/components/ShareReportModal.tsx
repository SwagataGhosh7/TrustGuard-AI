import { useState } from "react";
import {
  Check,
  Copy,
  Download,
  FileText,
  Image as ImageIcon,
  Share2,
  ShieldCheck,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { generatePdfReport, generatePngReport } from "@/lib/report-generator";
import type { FullScanResult } from "@/server/scanner";

interface ShareReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scanResult: FullScanResult;
}

export function ShareReportModal({ isOpen, onClose, scanResult }: ShareReportModalProps) {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingPng, setDownloadingPng] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    setDownloadingPdf(true);
    try {
      generatePdfReport(scanResult);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setTimeout(() => setDownloadingPdf(false), 800);
    }
  };

  const handleDownloadPng = async () => {
    setDownloadingPng(true);
    try {
      await generatePngReport(scanResult);
    } catch (err) {
      console.error("PNG generation error:", err);
    } finally {
      setTimeout(() => setDownloadingPng(false), 800);
    }
  };

  const handleCopySummary = async () => {
    const text = `TRUSTGUARD AI — DIGITAL TRUST REPORT
Domain: ${scanResult.domain}
Risk Assessment: ${scanResult.aiAnalysis.riskLevel} (${scanResult.aiAnalysis.threatScore}/100)
Primary Vector: ${scanResult.aiAnalysis.primaryVector}

CRYPTOGRAPHIC & TLS AUDIT:
• Certificate Authority: ${scanResult.certificate.issuer.CN || scanResult.certificate.issuer.O || "Unknown"}
• Algorithm: ${scanResult.certificate.keyAlgorithm} (${scanResult.certificate.bits} bits)
• Protocol: ${scanResult.certificate.protocol} (Cipher: ${scanResult.certificate.cipherSuite})
• eMudhra Vulnerability Check: ${scanResult.certificate.emudhraVulnerabilityCheck.keyGenerationStatus}
• Validity: ${scanResult.certificate.validFrom} to ${scanResult.certificate.validTo} (${scanResult.certificate.daysRemaining} days left)

APPLICATION SECURITY:
• HSTS Enforced: ${scanResult.securityHeaders.hsts.present ? "Yes" : "No (Vulnerable)"}
• Content-Security-Policy: ${scanResult.securityHeaders.csp.present ? "Configured" : "Missing"}
• Score: ${scanResult.securityHeaders.score}/100

SUMMARY:
${scanResult.aiAnalysis.summary}`;

    await navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `TrustGuard AI Security Audit — ${scanResult.domain}`,
          text: `Digital Trust Assessment for ${scanResult.domain}: ${scanResult.aiAnalysis.riskLevel} Risk (${scanResult.aiAnalysis.threatScore}/100).`,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to copy link
      }
    }

    await navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const riskBadgeColor =
    scanResult.aiAnalysis.riskLevel === "CRITICAL"
      ? "text-danger border-danger/40 bg-danger/10"
      : scanResult.aiAnalysis.riskLevel === "HIGH"
        ? "text-warning border-warning/40 bg-warning/10"
        : scanResult.aiAnalysis.riskLevel === "MEDIUM"
          ? "text-amber-400 border-amber-500/40 bg-amber-500/10"
          : "text-success border-success/40 bg-success/10";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl border-2 border-amber-500/60 bg-[#0e0907] p-6 shadow-[0_0_40px_rgba(245,158,11,0.25)] space-y-5 animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-amber-500/20 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center border border-amber-500/40 bg-amber-500/10 text-amber-400">
              <Share2 size={16} />
            </span>
            <div>
              <h3 className="text-base font-pixel text-amber-200">Download & Share Audit Report</h3>
              <p className="text-xs font-display text-zinc-400 mt-0.5">
                Export forensic reports in PDF, PNG infographic format, or share directly.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close modal"
            className="size-8 -mr-2 -mt-2 text-zinc-400 hover:text-white"
          >
            <X size={16} />
          </Button>
        </div>

        {/* Report Preview Mini Card */}
        <div className="border border-amber-500/30 bg-black/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-code text-sm font-semibold text-amber-100">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>{scanResult.domain}</span>
            </div>
            <span
              className={`text-[9px] font-pixel uppercase px-2 py-0.5 border ${riskBadgeColor}`}
            >
              {scanResult.aiAnalysis.riskLevel} RISK ({scanResult.aiAnalysis.threatScore}/100)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-code text-zinc-400 border-y border-amber-500/15 py-2.5">
            <div>
              <span className="text-zinc-500 block text-[9px] uppercase font-pixel">
                Issuer CA:
              </span>
              <span
                className="text-amber-200 truncate block mt-0.5"
                title={scanResult.certificate.issuer.CN}
              >
                {scanResult.certificate.issuer.CN || "Unknown"}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[9px] uppercase font-pixel">
                eMudhra Audit:
              </span>
              <span
                className={`block mt-0.5 ${
                  scanResult.certificate.emudhraVulnerabilityCheck.isVulnerable
                    ? "text-red-400 font-semibold"
                    : "text-emerald-400 font-semibold"
                }`}
              >
                {scanResult.certificate.emudhraVulnerabilityCheck.keyGenerationStatus}
              </span>
            </div>
          </div>

          <p className="text-xs font-display text-zinc-300 leading-relaxed line-clamp-2">
            {scanResult.aiAnalysis.summary}
          </p>
        </div>

        {/* Download Options Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Download PDF Option */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="flex items-start gap-3 p-3.5 border border-amber-500/30 bg-black/60 hover:border-amber-400 hover:bg-amber-500/10 transition-all text-left group"
          >
            <span className="grid size-9 place-items-center border border-amber-500/40 bg-amber-500/10 text-amber-400 shrink-0 group-hover:bg-amber-500 group-hover:text-black transition-colors">
              <FileText size={18} />
            </span>
            <div>
              <div className="text-xs font-pixel text-amber-200 flex items-center gap-1.5">
                <span>Download PDF Report</span>
                <Download size={12} className="text-zinc-400 group-hover:text-amber-400" />
              </div>
              <p className="text-[11px] font-display text-zinc-300 mt-1 leading-snug">
                Official vector audit report with full cryptographic & security header sections.
              </p>
            </div>
          </button>

          {/* Download PNG Infographic Option */}
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={downloadingPng}
            className="flex items-start gap-3 p-3.5 border border-amber-500/30 bg-black/60 hover:border-amber-400 hover:bg-amber-500/10 transition-all text-left group"
          >
            <span className="grid size-9 place-items-center border border-amber-500/40 bg-amber-500/10 text-amber-400 shrink-0 group-hover:bg-amber-500 group-hover:text-black transition-colors">
              <ImageIcon size={18} />
            </span>
            <div>
              <div className="text-xs font-pixel text-amber-200 flex items-center gap-1.5">
                <span>Download PNG Card</span>
                <Download size={12} className="text-zinc-400 group-hover:text-amber-400" />
              </div>
              <p className="text-[11px] font-display text-zinc-300 mt-1 leading-snug">
                1200x760 high-resolution infographic card for Slack, tickets, and incident boards.
              </p>
            </div>
          </button>
        </div>

        {/* Copy / Quick Share Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-amber-500/20">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopySummary}
              className="rounded-none border-amber-500/40 bg-black/60 h-8 text-xs font-code text-amber-300 hover:bg-amber-500 hover:text-black"
            >
              {copiedSummary ? (
                <>
                  <Check size={13} className="mr-1.5 text-emerald-400" />
                  Copied Summary!
                </>
              ) : (
                <>
                  <Copy size={13} className="mr-1.5" />
                  Copy Text Summary
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="rounded-none border-amber-500/40 bg-black/60 h-8 text-xs font-code text-amber-300 hover:bg-amber-500 hover:text-black"
            >
              {copiedLink ? (
                <>
                  <Check size={13} className="mr-1.5 text-emerald-400" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Share2 size={13} className="mr-1.5" />
                  Share Link
                </>
              )}
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs font-code text-zinc-400 hover:text-white"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
