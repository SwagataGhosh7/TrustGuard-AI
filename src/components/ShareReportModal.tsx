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
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center border border-primary/30 bg-primary/10 text-primary">
              <Share2 size={16} />
            </span>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Download & Share Audit Report
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Export forensic reports in PDF, PNG infographic format, or share directly.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close modal"
            className="size-8 -mr-2 -mt-2 text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </Button>
        </div>

        {/* Report Preview Mini Card */}
        <div className="border border-border bg-secondary/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-sm font-semibold text-foreground">
              <ShieldCheck size={16} className="text-primary" />
              <span>{scanResult.domain}</span>
            </div>
            <span
              className={`text-[10px] font-semibold uppercase px-2 py-0.5 border ${riskBadgeColor}`}
            >
              {scanResult.aiAnalysis.riskLevel} RISK ({scanResult.aiAnalysis.threatScore}/100)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono text-muted-foreground border-y border-border py-2.5">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Issuer CA:</span>
              <span
                className="text-foreground truncate block"
                title={scanResult.certificate.issuer.CN}
              >
                {scanResult.certificate.issuer.CN || "Unknown"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">
                eMudhra Audit:
              </span>
              <span
                className={
                  scanResult.certificate.emudhraVulnerabilityCheck.isVulnerable
                    ? "text-danger"
                    : "text-success"
                }
              >
                {scanResult.certificate.emudhraVulnerabilityCheck.keyGenerationStatus}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
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
            className="flex items-start gap-3 p-3.5 border border-border bg-card hover:border-primary/60 hover:bg-secondary/40 transition-all text-left group"
          >
            <span className="grid size-9 place-items-center border border-primary/30 bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <FileText size={18} />
            </span>
            <div>
              <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span>Download PDF Report</span>
                <Download size={12} className="text-muted-foreground group-hover:text-primary" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                Official vector audit report with full cryptographic & security header sections.
              </p>
            </div>
          </button>

          {/* Download PNG Infographic Option */}
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={downloadingPng}
            className="flex items-start gap-3 p-3.5 border border-border bg-card hover:border-primary/60 hover:bg-secondary/40 transition-all text-left group"
          >
            <span className="grid size-9 place-items-center border border-primary/30 bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <ImageIcon size={18} />
            </span>
            <div>
              <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span>Download PNG Card</span>
                <Download size={12} className="text-muted-foreground group-hover:text-primary" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                1200x760 high-resolution infographic card for Slack, tickets, and incident boards.
              </p>
            </div>
          </button>
        </div>

        {/* Copy / Quick Share Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopySummary}
              className="rounded-none border-border h-8 text-xs font-mono"
            >
              {copiedSummary ? (
                <>
                  <Check size={13} className="mr-1.5 text-success" />
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
              className="rounded-none border-border h-8 text-xs font-mono"
            >
              {copiedLink ? (
                <>
                  <Check size={13} className="mr-1.5 text-success" />
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
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
