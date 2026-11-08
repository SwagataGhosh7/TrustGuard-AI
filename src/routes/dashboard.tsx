import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle,
  Copy,
  Download,
  FileCheck2,
  Globe2,
  KeyRound,
  Lock,
  LockKeyhole,
  LogOut,
  MailCheck,
  Menu,
  RefreshCw,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";

import { BrowserExtensionGuide } from "@/components/BrowserExtensionGuide";
import { BulkUrlScanner } from "@/components/BulkUrlScanner";
import { CommunityThreatFeed } from "@/components/CommunityThreatFeed";
import { ShareReportModal } from "@/components/ShareReportModal";
import { TrustScoreTrendChart } from "@/components/TrustScoreTrendChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import type { FullScanResult } from "@/server/scanner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "TrustGuard AI — Digital Trust Intelligence" },
      {
        name: "description",
        content:
          "Real-time AI-powered web threat detection, certificate transparency validation, and digital trust intelligence.",
      },
      { property: "og:title", content: "TrustGuard AI — Digital Trust Intelligence" },
      {
        property: "og:description",
        content:
          "Real-time AI-powered web threat detection, certificate transparency validation, and digital trust intelligence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

export default function Dashboard() {
  const { user, canAccessCommunityIntelligence, signIn, signOut } = useAuth();
  const [urlInput, setUrlInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanResult, setScanResult] = useState<FullScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const scanSteps = [
    "Establishing TLS socket handshake (Port 443)...",
    "Extracting X.509 peer certificate & RSA/ECDSA modulus...",
    "Querying public Certificate Transparency logs...",
    "Auditing eMudhra key generation vulnerability markers...",
    "Inspecting HTTP security headers & redirect chain...",
    "Synthesizing threat profile with Gemini 3.8 Flash AI...",
  ];

  async function handleScan(targetDomain?: string) {
    const rawTarget = (targetDomain || urlInput).trim();
    if (!rawTarget) {
      setErrorMessage("Please enter a valid website address or domain to analyze.");
      return;
    }

    setErrorMessage("");
    setIsScanning(true);
    setScanStep(0);

    const stepInterval = setInterval(() => {
      setScanStep((prev) => (prev < scanSteps.length - 1 ? prev + 1 : prev));
    }, 450);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUrl: rawTarget }),
      });

      clearInterval(stepInterval);
      setScanStep(scanSteps.length - 1);

      if (!res.ok) {
        const errPayload = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errPayload.error || `Scan failed with HTTP ${res.status}`);
      }

      const data = (await res.json()) as FullScanResult;
      setScanResult(data);
      setUrlInput(data.domain);
    } catch (err: unknown) {
      clearInterval(stepInterval);
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Scan failed: ${message}`);
    } finally {
      setIsScanning(false);
    }
  }

  function handleExportJson() {
    if (!scanResult) return;
    const jsonString = JSON.stringify(scanResult, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trustguard-report-${scanResult.domain}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleCopySummary() {
    if (!scanResult) return;
    const text = `TrustGuard AI Report for ${scanResult.domain}
Risk Level: ${scanResult.aiAnalysis.riskLevel} (Threat Score: ${scanResult.aiAnalysis.threatScore}/100)
Primary Vector: ${scanResult.aiAnalysis.primaryVector}
Summary: ${scanResult.aiAnalysis.summary}
Certificate Issuer: ${scanResult.certificate.issuer.CN || "Unknown"} (Algorithm: ${scanResult.certificate.keyAlgorithm})
eMudhra CA Check: ${scanResult.certificate.emudhraVulnerabilityCheck.keyGenerationStatus}`;
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  }

  function navigateTo(id: string) {
    setMobileNavOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      {/* 1-Row, 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-8 px-5 sm:px-8 lg:px-12">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-foreground whitespace-nowrap shrink-0 hover:text-primary transition-colors"
          >
            <span className="grid size-8 place-items-center border border-primary/30 bg-primary/10 text-primary">
              <ShieldCheck size={18} strokeWidth={2} />
            </span>
            <span>
              TrustGuard <span className="text-primary font-normal">AI</span>
            </span>
          </a>

          {/* Zone 2: 4 Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-muted-foreground">
            <button
              type="button"
              onClick={() => navigateTo("dashboard")}
              className="hover:text-foreground transition-colors whitespace-nowrap shrink-0"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => navigateTo("bulk-scanner")}
              className="hover:text-foreground transition-colors whitespace-nowrap shrink-0"
            >
              Bulk Audit
            </button>
            <button
              type="button"
              onClick={() => navigateTo("trust-trends")}
              className="hover:text-foreground transition-colors whitespace-nowrap shrink-0"
            >
              Trust Surveillance
            </button>
            <button
              type="button"
              onClick={() => navigateTo("threat-feed")}
              className="hover:text-foreground transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <span>Community Intelligence</span>
              {canAccessCommunityIntelligence ? (
                <span className="size-1.5 rounded-full bg-success" />
              ) : (
                <span className="text-[10px] font-mono px-1 py-0.2 border border-warning/50 text-warning bg-warning/10 flex items-center gap-0.5">
                  <Lock size={9} />
                  Locked
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigateTo("extension-guide")}
              className="hover:text-foreground transition-colors whitespace-nowrap shrink-0"
            >
              Browser Extension
            </button>
            <button
              type="button"
              onClick={() => navigateTo("cert-inspector")}
              className="hover:text-foreground transition-colors whitespace-nowrap shrink-0"
            >
              Certificate Audit
            </button>
          </nav>

          {/* Zone 3: Actions & Auth Status */}
          <div className="flex items-center gap-2.5 shrink-0">
            {user ? (
              <div className="flex items-center gap-2 border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-mono">
                <span className="size-2 rounded-full bg-success animate-pulse" />
                <span className="truncate max-w-[110px] text-primary font-semibold">
                  {user.displayName || user.email?.split("@")[0] || "Analyst"}
                </span>
                <button
                  type="button"
                  onClick={signOut}
                  className="text-muted-foreground hover:text-danger ml-1"
                  title="Sign Out"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="border border-warning/40 bg-warning/10 text-warning text-[10px] font-mono px-2 py-1">
                  👾 GUEST
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signIn}
                  className="h-8 px-2.5 rounded-none border-primary/50 text-primary text-xs font-mono hover:bg-primary/10"
                >
                  Sign In
                </Button>
              </div>
            )}

            <Button
              onClick={() => {
                document.getElementById("target-domain-input")?.focus();
              }}
              className="h-8 px-3 text-xs font-semibold whitespace-nowrap shrink-0 rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Search size={13} className="mr-1.5" />
              Investigate
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden size-8"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              <Menu size={18} />
            </Button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="md:hidden border-t border-border px-5 py-3 space-y-2 bg-card">
            <button
              type="button"
              onClick={() => navigateTo("dashboard")}
              className="block w-full text-left py-1 text-sm text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => navigateTo("bulk-scanner")}
              className="block w-full text-left py-1 text-sm text-muted-foreground hover:text-foreground"
            >
              Bulk Audit
            </button>
            <button
              type="button"
              onClick={() => navigateTo("trust-trends")}
              className="block w-full text-left py-1 text-sm text-muted-foreground hover:text-foreground"
            >
              Trust Surveillance
            </button>
            <button
              type="button"
              onClick={() => navigateTo("threat-feed")}
              className="block w-full text-left py-1 text-sm text-muted-foreground hover:text-foreground"
            >
              Community Intelligence
            </button>
            <button
              type="button"
              onClick={() => navigateTo("extension-guide")}
              className="block w-full text-left py-1 text-sm text-muted-foreground hover:text-foreground"
            >
              Browser Extension
            </button>
            <button
              type="button"
              onClick={() => navigateTo("cert-inspector")}
              className="block w-full text-left py-1 text-sm text-muted-foreground hover:text-foreground"
            >
              Certificate Audit
            </button>
          </div>
        )}
      </header>

      <main id="dashboard" className="mx-auto max-w-[1440px] px-5 pb-16 pt-8 sm:px-8 lg:px-12">
        {/* Hero Section & Live Socket Probing Engine */}
        <section className="border-b border-border pb-10">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-primary">
                Digital Trust Intelligence · Live Socket Probing
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                AI-Powered Web Threat Detection & Cryptographic Audit
              </h1>
              <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Execute live server-side TLS handshakes, audit eMudhra weak CA key generation,
                verify Certificate Transparency logs, and synthesize real threat telemetry with
                Gemini 3.8 Flash.
              </p>
            </div>
          </div>

          {/* Scanner Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleScan();
            }}
            className="space-y-3"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Globe2
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="target-domain-input"
                  type="text"
                  placeholder="Enter target domain or URL (e.g., github.com, paypal-verify.net)..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={isScanning}
                  className="h-12 pl-11 pr-4 rounded-none border-border bg-card font-mono text-sm placeholder:font-sans focus-visible:ring-primary"
                />
              </div>
              <Button
                type="submit"
                disabled={isScanning}
                className="h-12 px-6 rounded-none bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90"
              >
                {isScanning ? (
                  <>
                    <RefreshCw size={15} className="mr-2 animate-spin" />
                    Auditing Target...
                  </>
                ) : (
                  <>
                    <Terminal size={15} className="mr-2" />
                    Execute Deep Scan
                  </>
                )}
              </Button>
            </div>

            {/* Quick Test Domain Buttons */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="text-[11px] uppercase tracking-wide">Quick Audit Targets:</span>
              <button
                type="button"
                onClick={() => handleScan("github.com")}
                className="font-mono text-foreground hover:text-primary transition-colors underline underline-offset-2"
              >
                github.com (Clean ECDSA)
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => handleScan("emudhra-auth-gateway-test.net")}
                className="font-mono text-warning hover:text-warning/80 transition-colors underline underline-offset-2"
              >
                emudhra-auth-gateway-test.net (Weak Key Check)
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => handleScan("secure-login-hdfc-update.com")}
                className="font-mono text-danger hover:text-danger/80 transition-colors underline underline-offset-2"
              >
                secure-login-hdfc-update.com (Phishing Clone)
              </button>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 border border-danger/30 bg-danger/5 px-4 py-2.5 text-xs text-danger">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {isScanning && (
              <div className="border border-primary/30 bg-primary/5 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-primary font-mono">
                  <span className="flex items-center gap-2">
                    <Terminal size={14} className="animate-pulse" />
                    {scanSteps[scanStep]}
                  </span>
                  <span>
                    PHASE {String(scanStep + 1).padStart(2, "0")} /{" "}
                    {String(scanSteps.length).padStart(2, "0")}
                  </span>
                </div>
                <div className="h-1 bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${((scanStep + 1) / scanSteps.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </form>
        </section>

        {/* Scan Results View (Rendered when real scan data is present) */}
        {scanResult && (
          <section className="pt-8 space-y-6">
            {/* Investigation Top Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-border bg-card p-5">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-foreground font-mono">
                    {scanResult.domain}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                      scanResult.aiAnalysis.riskLevel === "CRITICAL"
                        ? "bg-danger/15 text-danger border border-danger/40"
                        : scanResult.aiAnalysis.riskLevel === "HIGH"
                          ? "bg-warning/15 text-warning border border-warning/40"
                          : scanResult.aiAnalysis.riskLevel === "MEDIUM"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/40"
                            : "bg-success/15 text-success border border-success/40"
                    }`}
                  >
                    {scanResult.aiAnalysis.riskLevel} RISK
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono">
                  <span>IP: {scanResult.dns.ipAddress || "Unresolved"}</span>
                  <span aria-hidden="true">·</span>
                  <span>Port: 443 (HTTPS)</span>
                  <span aria-hidden="true">·</span>
                  <span>Latency: {scanResult.scanDurationMs}ms</span>
                  <span aria-hidden="true">·</span>
                  <span>Audited: {new Date(scanResult.scannedAt).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => setShareModalOpen(true)}
                  className="rounded-none bg-primary text-primary-foreground h-8 text-xs font-semibold shadow-xs hover:bg-primary/90"
                >
                  <Share2 size={13} className="mr-1.5" />
                  Download / Share Report
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopySummary}
                  className="rounded-none border-border h-8 text-xs"
                >
                  <Copy size={13} className="mr-1.5" />
                  {copiedNotification ? "Copied!" : "Quick Copy"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportJson}
                  className="rounded-none border-border h-8 text-xs"
                >
                  <Download size={13} className="mr-1.5" />
                  JSON
                </Button>
              </div>
            </div>

            {/* Gemini 3.8 Flash AI Synthesis Card */}
            <div className="border border-primary/30 bg-card p-6 relative overflow-hidden">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="grid size-9 place-items-center border border-primary/30 bg-primary/10 text-primary shrink-0">
                    <Sparkles size={18} />
                  </span>
                  <div>
                    <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-primary">
                      Gemini 3.8 Flash Forensic Synthesis
                    </div>
                    <h3 className="text-base font-semibold text-foreground mt-0.5">
                      {scanResult.aiAnalysis.primaryVector}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Threat Score
                  </div>
                  <div
                    className={`text-2xl font-semibold font-mono tabular-nums ${
                      scanResult.aiAnalysis.threatScore >= 60
                        ? "text-danger"
                        : scanResult.aiAnalysis.threatScore >= 30
                          ? "text-warning"
                          : "text-success"
                    }`}
                  >
                    {scanResult.aiAnalysis.threatScore}{" "}
                    <span className="text-xs text-muted-foreground font-normal">/ 100</span>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-foreground/90 leading-relaxed border-t border-border pt-4">
                {scanResult.aiAnalysis.summary}
              </p>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4">
                <div>
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <AlertTriangle size={13} className="text-warning" />
                    Observed Risk Indicators
                  </h4>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {scanResult.aiAnalysis.indicators.map((ind, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">›</span>
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-success" />
                    Recommended Remediation
                  </h4>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {scanResult.aiAnalysis.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-success mt-0.5">✓</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 3 Inspection Pillars Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" id="cert-inspector">
              {/* Pillar 1: Cryptographic & Certificate Validation */}
              <div className="border border-border bg-card p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <LockKeyhole size={16} className="text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">TLS & Cryptography</h3>
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {scanResult.certificate.protocol}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Common Name (CN):</span>
                      <span
                        className="font-mono text-foreground truncate max-w-[170px]"
                        title={scanResult.certificate.subject.CN}
                      >
                        {scanResult.certificate.subject.CN || "None"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Issuer CA:</span>
                      <span
                        className="font-mono text-foreground truncate max-w-[170px]"
                        title={scanResult.certificate.issuer.CN}
                      >
                        {scanResult.certificate.issuer.CN ||
                          scanResult.certificate.issuer.O ||
                          "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Key Algorithm:</span>
                      <span className="font-mono text-foreground">
                        {scanResult.certificate.keyAlgorithm}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cipher Suite:</span>
                      <span
                        className="font-mono text-foreground truncate max-w-[170px]"
                        title={scanResult.certificate.cipherSuite}
                      >
                        {scanResult.certificate.cipherSuite}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Validity Window:</span>
                      <span className="font-mono text-foreground tabular-nums">
                        {scanResult.certificate.daysRemaining} days remaining
                      </span>
                    </div>
                  </div>
                </div>

                {/* eMudhra Weak Key Generation Audit Box */}
                <div
                  className={`border p-3 space-y-1.5 ${
                    scanResult.certificate.emudhraVulnerabilityCheck.isVulnerable
                      ? "border-danger/40 bg-danger/5"
                      : "border-success/30 bg-success/5"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      <KeyRound size={13} />
                      eMudhra CA Key Audit
                    </span>
                    <span
                      className={`text-[10px] uppercase font-mono px-1.5 py-0.5 ${
                        scanResult.certificate.emudhraVulnerabilityCheck.isVulnerable
                          ? "text-danger bg-danger/10"
                          : "text-success bg-success/10"
                      }`}
                    >
                      {scanResult.certificate.emudhraVulnerabilityCheck.keyGenerationStatus}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    {scanResult.certificate.emudhraVulnerabilityCheck.reasons[0] ||
                      "Cryptographic entropy and CA trust chain validated."}
                  </p>
                </div>
              </div>

              {/* Pillar 2: Application Web Security Posture */}
              <div className="border border-border bg-card p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <FileCheck2 size={16} className="text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">
                        Web Security Headers
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-primary">
                      {scanResult.securityHeaders.score} / 100
                    </span>
                  </div>

                  <div className="mt-4 space-y-2.5 text-xs">
                    <HeaderCheckRow
                      name="Strict-Transport-Security"
                      present={scanResult.securityHeaders.hsts.present}
                      detail={scanResult.securityHeaders.hsts.value}
                    />
                    <HeaderCheckRow
                      name="Content-Security-Policy"
                      present={scanResult.securityHeaders.csp.present}
                      detail={scanResult.securityHeaders.csp.value}
                    />
                    <HeaderCheckRow
                      name="X-Frame-Options"
                      present={scanResult.securityHeaders.xFrameOptions.present}
                      detail={scanResult.securityHeaders.xFrameOptions.value}
                    />
                    <HeaderCheckRow
                      name="X-Content-Type-Options"
                      present={scanResult.securityHeaders.xContentTypeOptions.present}
                      detail={scanResult.securityHeaders.xContentTypeOptions.value}
                    />
                    <HeaderCheckRow
                      name="Referrer-Policy"
                      present={scanResult.securityHeaders.referrerPolicy.present}
                      detail={scanResult.securityHeaders.referrerPolicy.value}
                    />
                  </div>
                </div>

                <div className="border border-border bg-secondary/30 p-3 text-xs space-y-1">
                  <div className="flex justify-between text-muted-foreground">
                    <span>HTTP Response Code:</span>
                    <span className="font-mono text-foreground font-semibold">
                      {scanResult.securityHeaders.statusCode || "No Response"}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Server Signature:</span>
                    <span className="font-mono text-foreground">
                      {scanResult.securityHeaders.serverHeader || "Hidden / Cloudflare"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pillar 3: Domain Identity & Mail Infrastructure */}
              <div className="border border-border bg-card p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <MailCheck size={16} className="text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Domain Trust & DNS</h3>
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {scanResult.dns.hasDmarc ? "DMARC Protected" : "DMARC Missing"}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Mail Exchange (MX):</span>
                      <span className="font-mono text-foreground">
                        {scanResult.dns.hasMx
                          ? `${scanResult.dns.mxRecords.length} records`
                          : "No MX configured"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">SPF Policy:</span>
                      <span
                        className={`font-mono ${scanResult.dns.hasSpf ? "text-success" : "text-danger"}`}
                      >
                        {scanResult.dns.hasSpf ? "Configured (v=spf1)" : "Missing"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">DMARC Policy:</span>
                      <span
                        className={`font-mono ${scanResult.dns.hasDmarc ? "text-success" : "text-danger"}`}
                      >
                        {scanResult.dns.hasDmarc ? "Configured (_dmarc)" : "Missing"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">CT Logs Recorded:</span>
                      <span className="font-mono text-foreground">
                        {scanResult.certificate.certificateTransparency.count > 0
                          ? `${scanResult.certificate.certificateTransparency.count} certificates`
                          : "Queried crt.sh"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">SAN Domains:</span>
                      <span className="font-mono text-foreground">
                        {scanResult.certificate.sans.length > 0
                          ? `${scanResult.certificate.sans.length} alternate names`
                          : "None"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border border-border bg-secondary/30 p-3 text-xs">
                  <div className="text-[10px] uppercase text-muted-foreground tracking-wide mb-1">
                    Certificate SHA-256 Fingerprint
                  </div>
                  <div className="font-mono text-[11px] text-foreground/80 break-all select-all">
                    {scanResult.certificate.fingerprint256}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal for PDF / PNG / Share Generation */}
            <ShareReportModal
              isOpen={shareModalOpen}
              onClose={() => setShareModalOpen(false)}
              scanResult={scanResult}
            />
          </section>
        )}

        {/* Bulk URL Concurrent Threat Assessment Matrix */}
        <section id="bulk-scanner" className="pt-8">
          <BulkUrlScanner
            onInspectDomain={(domain, scanData) => {
              setUrlInput(domain);
              if (scanData) {
                setScanResult(scanData);
              } else {
                handleScan(domain);
              }
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </section>

        {/* Certificate Trust Score Trend Surveillance Line Chart */}
        <section id="trust-trends" className="pt-8">
          <TrustScoreTrendChart
            currentScan={scanResult}
            onSelectAuditDomain={(domain) => {
              setUrlInput(domain);
              handleScan(domain);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </section>

        {/* Dedicated Community Threat Intelligence: Gated for Guests, Active for Authenticated */}
        {canAccessCommunityIntelligence ? (
          <CommunityThreatFeed
            onInspectDomain={(domain) => {
              setUrlInput(domain);
              handleScan(domain);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            canParticipate={true}
          />
        ) : (
          <section id="threat-feed" className="space-y-6 pt-10">
            <div className="border-2 border-[#ff6b35]/60 bg-[#0c1017] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 font-pixel text-[11px] text-[#ff6b35] tracking-wider uppercase bg-[#ff6b35]/10 px-2.5 py-1 border border-[#ff6b35]/30">
                  <Lock size={13} />
                  COMMUNITY THREAT INTELLIGENCE // RESTRICTED ACCESS
                </div>

                <h2 className="font-arcade text-lg sm:text-xl text-foreground tracking-tight leading-snug">
                  ANALYST AUTHENTICATION REQUIRED
                </h2>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  You are currently exploring TrustGuard AI in{" "}
                  <strong className="text-foreground">Guest Mode</strong>. While single-domain
                  probing, bulk security scans, and trust trend surveillance are fully accessible,
                  the live collaborative threat feed is locked to protect community consensus
                  against unverified or automated submissions.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2 font-mono text-xs text-muted-foreground">
                  <div className="p-3 border border-border bg-card/60">
                    <span className="text-[#a3e635] font-semibold block mb-1">01. Live IOCs</span>
                    Confirmed malicious domains & phishing signatures.
                  </div>
                  <div className="p-3 border border-border bg-card/60">
                    <span className="text-[#ff6b35] font-semibold block mb-1">
                      02. Upvote Signals
                    </span>
                    Boost community verification on active attack campaigns.
                  </div>
                  <div className="p-3 border border-border bg-card/60">
                    <span className="text-[#00f0ff] font-semibold block mb-1">
                      03. Incident Reporting
                    </span>
                    Publish newly discovered weak CAs & typosquats.
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <Button
                    onClick={signIn}
                    className="h-10 px-6 rounded-none bg-[#ff6b35] hover:bg-[#ff8a00] text-black font-arcade text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(255,107,53,0.35)] cursor-pointer"
                  >
                    ⚡ SIGN IN WITH GOOGLE TO UNLOCK
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      document.getElementById("target-domain-input")?.focus();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="h-10 px-4 rounded-none border-border text-xs font-mono text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Continue Using Guest Probing
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Browser Extension Integration Guide & Snippet Suite */}
        <BrowserExtensionGuide />

        {/* Footer */}
        <footer className="mt-14 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">TrustGuard AI</span>
            <span>·</span>
            <span>Live Digital Trust Intelligence Network</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>eMudhra Weak Key Detection Active</span>
            <span>·</span>
            <span>Gemini 3.8 Flash Analysis</span>
            <span>·</span>
            <span>Zero Mock Guarantee</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

function HeaderCheckRow({
  name,
  present,
  detail,
}: {
  name: string;
  present: boolean;
  detail?: string;
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-muted-foreground truncate max-w-[200px]" title={name}>
          {name}
        </span>
        <span
          className={`flex items-center gap-1 font-mono text-[11px] ${
            present ? "text-success" : "text-danger"
          }`}
        >
          {present ? "Configured" : "Missing"}
        </span>
      </div>
      {detail && (
        <p className="font-mono text-[10px] text-muted-foreground/80 truncate pl-1" title={detail}>
          {detail}
        </p>
      )}
    </div>
  );
}
