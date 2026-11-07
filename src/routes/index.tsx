import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  FileCheck2,
  Globe2,
  KeyRound,
  LockKeyhole,
  MailCheck,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  ThumbsUp,
  X,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FullScanResult } from "@/server/scanner";
import type { CommunityThreatReport } from "@/server/threat-store";

export const Route = createFileRoute("/")({
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
  const [urlInput, setUrlInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanResult, setScanResult] = useState<FullScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [threats, setThreats] = useState<CommunityThreatReport[]>([]);
  const [threatFilter, setThreatFilter] = useState("all");
  const [threatSearch, setThreatSearch] = useState("");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Form states for new threat report
  const [newDomain, setNewDomain] = useState("");
  const [newVector, setNewVector] = useState("Credential Theft & Phishing");
  const [newSeverity, setNewSeverity] = useState<"Critical" | "High" | "Medium" | "Low">(
    "Critical",
  );
  const [newReporter, setNewReporter] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  const scanSteps = [
    "Establishing TLS socket handshake (Port 443)...",
    "Extracting X.509 peer certificate & RSA/ECDSA modulus...",
    "Querying public Certificate Transparency logs...",
    "Auditing eMudhra key generation vulnerability markers...",
    "Inspecting HTTP security headers & redirect chain...",
    "Synthesizing threat profile with Gemini 3.8 Flash AI...",
  ];

  // Fetch initial community threats from real server endpoint
  useEffect(() => {
    fetchThreats();
  }, []);

  async function fetchThreats() {
    try {
      const res = await fetch("/api/threats");
      if (res.ok) {
        const data = (await res.json()) as CommunityThreatReport[];
        setThreats(data);
      }
    } catch (err) {
      console.error("Failed to load threats feed:", err);
    }
  }

  async function handleScan(targetDomain?: string) {
    const rawTarget = (targetDomain || urlInput).trim();
    if (!rawTarget) {
      setErrorMessage("Please enter a valid website address or domain to analyze.");
      return;
    }

    setErrorMessage("");
    setIsScanning(true);
    setScanStep(0);

    // Progressive step indicator
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

  async function handleVote(id: string) {
    try {
      const res = await fetch("/api/threats/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, delta: 1 }),
      });
      if (res.ok) {
        const updated = (await res.json()) as CommunityThreatReport;
        setThreats((prev) => prev.map((t) => (t.id === id ? updated : t)));
      }
    } catch (err) {
      console.error("Vote failed:", err);
    }
  }

  async function handleSubmitReport(e: FormEvent) {
    e.preventDefault();
    if (!newDomain.trim()) return;

    setSubmittingReport(true);
    try {
      const res = await fetch("/api/threats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: newDomain.trim(),
          vector: newVector,
          severity: newSeverity,
          reporter: newReporter || "Security Analyst",
          notes: newNotes || "User-submitted suspect domain.",
          tags: [newVector.split(" ")[0] || "Phishing", "Community Report"],
        }),
      });

      if (res.ok) {
        await fetchThreats();
        setReportModalOpen(false);
        setNewDomain("");
        setNewNotes("");
      }
    } catch (err) {
      console.error("Failed to submit threat report:", err);
    } finally {
      setSubmittingReport(false);
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

  const filteredThreats = useMemo(() => {
    return threats.filter((t) => {
      const matchesFilter =
        threatFilter === "all" ||
        (threatFilter === "critical" && t.severity === "Critical") ||
        (threatFilter === "emudhra" && t.vector.toLowerCase().includes("emudhra")) ||
        (threatFilter === "phishing" && t.vector.toLowerCase().includes("phishing"));
      const matchesSearch =
        !threatSearch ||
        t.domain.toLowerCase().includes(threatSearch.toLowerCase()) ||
        t.vector.toLowerCase().includes(threatSearch.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(threatSearch.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [threats, threatFilter, threatSearch]);

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
              onClick={() => navigateTo("threat-feed")}
              className="hover:text-foreground transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
            >
              Threat Intelligence
              <span className="size-1.5 rounded-full bg-success" />
            </button>
            <button
              type="button"
              onClick={() => navigateTo("cert-inspector")}
              className="hover:text-foreground transition-colors whitespace-nowrap shrink-0"
            >
              Certificate Audit
            </button>
            <button
              type="button"
              onClick={() => setReportModalOpen(true)}
              className="hover:text-foreground transition-colors whitespace-nowrap shrink-0"
            >
              Submit Threat
            </button>
          </nav>

          {/* Zone 3: 1 Primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => {
                document.getElementById("target-domain-input")?.focus();
              }}
              className="h-9 px-4 text-xs font-semibold whitespace-nowrap shrink-0 rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Search size={14} className="mr-1.5" />
              New Investigation
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden size-9"
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
              onClick={() => navigateTo("threat-feed")}
              className="block w-full text-left py-1 text-sm text-muted-foreground hover:text-foreground"
            >
              Threat Intelligence
            </button>
            <button
              type="button"
              onClick={() => navigateTo("cert-inspector")}
              className="block w-full text-left py-1 text-sm text-muted-foreground hover:text-foreground"
            >
              Certificate Audit
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileNavOpen(false);
                setReportModalOpen(true);
              }}
              className="block w-full text-left py-1 text-sm text-muted-foreground hover:text-foreground"
            >
              Submit Threat
            </button>
          </div>
        )}
      </header>

      <main id="dashboard" className="mx-auto max-w-[1440px] px-5 pb-16 pt-8 sm:px-8 lg:px-12">
        {/* Hero Section & Real-Time Probing Engine */}
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReportModalOpen(true)}
                className="rounded-none border-border h-8 text-xs font-medium"
              >
                <Plus size={13} className="mr-1.5" />
                Report Suspicious Domain
              </Button>
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

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopySummary}
                  className="rounded-none border-border h-8 text-xs"
                >
                  <Copy size={13} className="mr-1.5" />
                  {copiedNotification ? "Copied!" : "Copy Summary"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportJson}
                  className="rounded-none border-border h-8 text-xs"
                >
                  <Download size={13} className="mr-1.5" />
                  Export JSON
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
          </section>
        )}

        {/* Collaborative Threat Intelligence Feed Section */}
        <section id="threat-feed" className="pt-12 space-y-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-primary mb-1">
                Collaborative Intelligence · Real Incident Database
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Global Threat & Phishing Feed
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Community-verified malicious domains, weak CA occurrences, and phishing attacks with
                live upvoting.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                onClick={() => setReportModalOpen(true)}
                className="h-8 rounded-none bg-primary text-primary-foreground text-xs font-semibold"
              >
                <Plus size={13} className="mr-1.5" />
                Submit New Incident
              </Button>
            </div>
          </div>

          {/* Feed Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-1.5 p-1 bg-card border border-border text-xs w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setThreatFilter("all")}
                className={`px-3 py-1 font-medium transition-colors ${
                  threatFilter === "all"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Reports ({threats.length})
              </button>
              <button
                type="button"
                onClick={() => setThreatFilter("critical")}
                className={`px-3 py-1 font-medium transition-colors ${
                  threatFilter === "critical"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Critical Risk
              </button>
              <button
                type="button"
                onClick={() => setThreatFilter("emudhra")}
                className={`px-3 py-1 font-medium transition-colors ${
                  threatFilter === "emudhra"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                eMudhra CA Flaws
              </button>
              <button
                type="button"
                onClick={() => setThreatFilter("phishing")}
                className={`px-3 py-1 font-medium transition-colors ${
                  threatFilter === "phishing"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Phishing
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="text"
                placeholder="Search domain or tag..."
                value={threatSearch}
                onChange={(e) => setThreatSearch(e.target.value)}
                className="h-8 pl-9 pr-3 rounded-none border-border bg-card text-xs font-mono"
              />
            </div>
          </div>

          {/* Threats Data Grid */}
          <div className="border border-border bg-card divide-y divide-border overflow-hidden">
            <div className="hidden md:grid grid-cols-[140px_1fr_180px_100px_90px] gap-4 px-5 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-secondary/30">
              <span>Timestamp</span>
              <span>Reported Domain & Forensics</span>
              <span>Threat Vector</span>
              <span>Severity</span>
              <span className="text-right">Upvotes</span>
            </div>

            {filteredThreats.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No threat reports matched your search criteria.
              </div>
            ) : (
              filteredThreats.map((threat) => (
                <div
                  key={threat.id}
                  className="grid grid-cols-1 md:grid-cols-[140px_1fr_180px_100px_90px] gap-2 md:gap-4 p-4 md:px-5 md:py-3.5 hover:bg-secondary/20 transition-colors items-center"
                >
                  <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
                    <span>{new Date(threat.reportedAt).toLocaleDateString()}</span>
                    <span className="hidden md:inline">·</span>
                    <span className="hidden md:inline">
                      {new Date(threat.reportedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-mono text-xs font-semibold text-foreground truncate"
                        title={threat.domain}
                      >
                        {threat.domain}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setUrlInput(threat.domain);
                          handleScan(threat.domain);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-[10px] text-primary hover:underline flex items-center gap-0.5 shrink-0"
                      >
                        Inspect <ChevronRight size={12} />
                      </button>
                    </div>
                    <p
                      className="text-[11px] text-muted-foreground truncate mt-0.5"
                      title={threat.notes}
                    >
                      {threat.notes}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5 text-[10px] text-muted-foreground">
                      {threat.tags.map((tag) => (
                        <span
                          key={tag}
                          className="border border-border/80 px-1.5 py-0.2 bg-secondary/50 font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-foreground/90 font-medium">{threat.vector}</div>

                  <div>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 border ${
                        threat.severity === "Critical"
                          ? "border-danger/40 bg-danger/10 text-danger"
                          : threat.severity === "High"
                            ? "border-warning/40 bg-warning/10 text-warning"
                            : "border-border bg-secondary text-foreground"
                      }`}
                    >
                      {threat.severity}
                    </span>
                  </div>

                  <div className="flex md:justify-end items-center">
                    <button
                      type="button"
                      onClick={() => handleVote(threat.id)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-semibold border border-border bg-card hover:bg-secondary/60 text-foreground transition-colors"
                      title="Confirm / Upvote this threat"
                    >
                      <ThumbsUp size={12} className="text-primary" />
                      <span className="tabular-nums">{threat.votes}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

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

      {/* Submit Threat Modal */}
      {reportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setReportModalOpen(false);
          }}
        >
          <div className="w-full max-w-lg border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Submit Threat Intelligence
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Report a suspicious domain or compromised CA certificate to the community feed.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setReportModalOpen(false)}
                className="size-8 -mr-2 -mt-2 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </Button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
                  Suspicious Domain or URL *
                </label>
                <Input
                  required
                  placeholder="e.g. fake-banking-login.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="rounded-none border-border bg-background font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
                    Threat Vector
                  </label>
                  <select
                    value={newVector}
                    onChange={(e) => setNewVector(e.target.value)}
                    className="w-full h-9 rounded-none border border-border bg-background px-3 text-xs text-foreground focus:outline-none"
                  >
                    <option value="Credential Theft & Phishing">Credential Theft & Phishing</option>
                    <option value="eMudhra CA Weak Key Generation">
                      eMudhra CA Weak Key Generation
                    </option>
                    <option value="Brand Impersonation & Typosquatting">
                      Brand Impersonation & Typosquatting
                    </option>
                    <option value="Malicious Redirect / Exploit">
                      Malicious Redirect / Exploit
                    </option>
                    <option value="Fake KYC & SMS Phishing">Fake KYC & SMS Phishing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
                    Severity
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) =>
                      setNewSeverity(e.target.value as "Critical" | "High" | "Medium" | "Low")
                    }
                    className="w-full h-9 rounded-none border border-border bg-background px-3 text-xs text-foreground focus:outline-none"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
                  Reporter Handle (Optional)
                </label>
                <Input
                  placeholder="e.g. SecOps_Analyst"
                  value={newReporter}
                  onChange={(e) => setNewReporter(e.target.value)}
                  className="rounded-none border-border bg-background"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
                  Forensic Evidence & Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe suspicious behavior, fake login fields, weak certificate details, or victim reports..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full rounded-none border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReportModalOpen(false)}
                  className="rounded-none border-border h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingReport || !newDomain.trim()}
                  className="rounded-none bg-primary text-primary-foreground h-9 text-xs font-semibold hover:bg-primary/90"
                >
                  {submittingReport ? "Publishing Report..." : "Submit Incident"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
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
          {present ? <Check size={12} /> : <XCircle size={12} />}
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
