import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle,
  Copy,
  Download,
  FileCheck2,
  Globe2,
  KeyRound,
  Layers,
  LineChart,
  Lock,
  LockKeyhole,
  LogOut,
  MailCheck,
  Menu,
  RefreshCw,
  Search,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
  Zap,
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

// 8-bit Pixel Alien
function PixelAlien({
  className = "size-4",
  color = "currentColor",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 11 8"
      className={className}
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
    >
      <path d="M2 0h1v1H2zM8 0h1v1H8zM3 1h1v1H3zM7 1h1v1H7zM2 2h7v1H2zM1 3h2v1H1zM4 3h3v1H4zM8 3h2v1H8zM0 4h11v1H0zM0 5h1v1H0zM2 5h7v1H2zM10 5h1v1H10zM0 6h1v2H0zM2 6h1v1H2zM8 6h1v1H8zM10 6h1v2H10zM3 7h2v1H3zM6 7h2v1H6z" />
    </svg>
  );
}

// 8-bit Pixel Shield
function PixelShield({
  className = "size-6",
  color = "#a3e635",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 12 14"
      className={className}
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
    >
      <path d="M1 0h10v2H1zM0 2h12v4H0zM1 6h10v2H1zM2 8h8v2H2zM3 10h6v2H3zM4 12h4v1H4zM5 13h2v1H5z" />
      <path d="M5 3h2v6H5zM3 5h6v2H3z" fill="#080b10" />
    </svg>
  );
}

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "TrustGuard AI — Digital Trust Intelligence Dashboard" },
      {
        name: "description",
        content:
          "Real-time AI-powered web threat detection, certificate transparency validation, and digital trust intelligence.",
      },
      { property: "og:title", content: "TrustGuard AI — Digital Trust Intelligence Dashboard" },
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
  const navigate = useNavigate();
  const { user, canAccessCommunityIntelligence, signIn, signOut } = useAuth();
  const [urlInput, setUrlInput] = useState("");

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (err: unknown) {
      console.warn("Sign-in dismissed or failed:", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      navigate({ to: "/" });
    }
  };

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
    <div className="min-h-screen bg-[#070a0e] text-[#e2e8f0] font-sans antialiased selection:bg-[#ff6b35]/30 selection:text-[#ff8a00] relative overflow-x-hidden">
      {/* Background Subtle Cyber Matrix Grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(#ff6b35 1px, transparent 1px), radial-gradient(#2dd4bf 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          backgroundPosition: "0 0, 16px 16px",
        }}
      />

      {/* Header with MLH x Hacktoberfest Design Elements */}
      <header className="sticky top-0 z-30 border-b border-[#243346] bg-[#0c1017]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-4 sm:px-8 lg:px-12">
          {/* Zone 1: Brand wordmark link to welcome page */}
          <Link
            to="/"
            className="flex items-center gap-3 text-foreground whitespace-nowrap shrink-0 group transition-all"
            title="Return to Welcome Portal"
          >
            <div className="relative p-1 bg-[#121924] border border-[#a3e635] shadow-[0_0_8px_rgba(163,230,53,0.3)]">
              <PixelShield className="size-5 text-[#a3e635]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-arcade text-xs sm:text-sm text-[#ff6b35] tracking-wider uppercase group-hover:text-[#ff8a00]">
                  TRUSTGUARD
                </span>
                <span className="font-pixel text-[9px] px-1 py-0.2 bg-[#a3e635] text-[#080b10] font-bold uppercase tracking-tight">
                  PROBE v2.4
                </span>
              </div>
            </div>
          </Link>

          {/* Zone 2: Navigation Links with Pixel Headers */}
          <nav className="hidden lg:flex items-center gap-6 text-[11px] font-pixel text-[#94a3b8]">
            <button
              type="button"
              onClick={() => navigateTo("dashboard")}
              className="hover:text-[#a3e635] transition-colors whitespace-nowrap shrink-0 uppercase tracking-wide cursor-pointer"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => navigateTo("bulk-scanner")}
              className="hover:text-[#ff6b35] transition-colors whitespace-nowrap shrink-0 uppercase tracking-wide cursor-pointer"
            >
              Bulk Audit
            </button>
            <button
              type="button"
              onClick={() => navigateTo("trust-trends")}
              className="hover:text-[#00f0ff] transition-colors whitespace-nowrap shrink-0 uppercase tracking-wide cursor-pointer"
            >
              Surveillance
            </button>
            <button
              type="button"
              onClick={() => navigateTo("threat-feed")}
              className="hover:text-[#a3e635] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 uppercase tracking-wide cursor-pointer"
            >
              <span>Community IOCs</span>
              {canAccessCommunityIntelligence ? (
                <span className="size-1.5 rounded-full bg-[#a3e635] animate-ping" />
              ) : (
                <span className="text-[9px] font-mono px-1 py-0.2 border border-[#fef08a]/40 text-[#fef08a] bg-[#fef08a]/10 flex items-center gap-0.5">
                  <Lock size={9} />
                  Locked
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigateTo("extension-guide")}
              className="hover:text-[#fef08a] transition-colors whitespace-nowrap shrink-0 uppercase tracking-wide cursor-pointer"
            >
              MV3 Extension
            </button>
            <button
              type="button"
              onClick={() => navigateTo("cert-inspector")}
              className="hover:text-[#2dd4bf] transition-colors whitespace-nowrap shrink-0 uppercase tracking-wide cursor-pointer"
            >
              Cert Audit
            </button>
          </nav>

          {/* Zone 3: Actions & Auth Status */}
          <div className="flex items-center gap-2.5 shrink-0">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 border border-[#2dd4bf]/40 bg-[#121924] px-2.5 py-1 text-xs font-mono">
                  <span className="size-2 rounded-full bg-[#2dd4bf] animate-pulse" />
                  <span className="truncate max-w-[120px] text-[#2dd4bf] font-semibold">
                    {user.displayName || user.email?.split("@")[0] || "Analyst"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="h-8 px-2.5 rounded-none border-[#dc2626]/40 bg-[#141b24] hover:bg-[#ff4d4d]/15 hover:border-[#ff4d4d] text-[#ff4d4d] text-xs font-arcade cursor-pointer transition-all"
                  title="Sign out and return to welcome home page"
                >
                  <LogOut size={12} className="mr-1.5" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="border border-[#fef08a]/40 bg-[#fef08a]/10 text-[#fef08a] text-[10px] font-pixel px-2 py-1">
                  👾 GUEST
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignIn}
                  className="h-8 px-2.5 rounded-none border-[#ff6b35]/60 bg-[#ff6b35]/10 text-[#ff6b35] hover:bg-[#ff6b35] hover:text-black text-xs font-arcade transition-all cursor-pointer"
                >
                  Sign In
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: "/" })}
                  className="h-8 px-2 rounded-none text-[#94a3b8] hover:text-[#f8fafc] text-xs font-mono cursor-pointer"
                  title="Return to Welcome Home"
                >
                  <LogOut size={12} className="mr-1" />
                  Home
                </Button>
              </div>
            )}

            <Button
              onClick={() => {
                document.getElementById("target-domain-input")?.focus();
              }}
              className="h-8 px-3 text-xs font-arcade whitespace-nowrap shrink-0 rounded-none bg-[#ff6b35] hover:bg-[#ff8a00] text-black shadow-[0_0_12px_rgba(255,107,53,0.3)] cursor-pointer hidden sm:flex"
            >
              <Search size={12} className="mr-1.5" />
              PROBE
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden size-8 text-[#94a3b8]"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              <Menu size={18} />
            </Button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="lg:hidden border-t border-[#243346] px-5 py-3 space-y-2 bg-[#0c1017] font-pixel text-xs">
            <button
              type="button"
              onClick={() => navigateTo("dashboard")}
              className="block w-full text-left py-1 text-[#94a3b8] hover:text-[#a3e635]"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => navigateTo("bulk-scanner")}
              className="block w-full text-left py-1 text-[#94a3b8] hover:text-[#ff6b35]"
            >
              Bulk Audit
            </button>
            <button
              type="button"
              onClick={() => navigateTo("trust-trends")}
              className="block w-full text-left py-1 text-[#94a3b8] hover:text-[#00f0ff]"
            >
              Trust Surveillance
            </button>
            <button
              type="button"
              onClick={() => navigateTo("threat-feed")}
              className="block w-full text-left py-1 text-[#94a3b8] hover:text-[#a3e635]"
            >
              Community Intelligence
            </button>
            <button
              type="button"
              onClick={() => navigateTo("extension-guide")}
              className="block w-full text-left py-1 text-[#94a3b8] hover:text-[#fef08a]"
            >
              Browser Extension
            </button>
            <button
              type="button"
              onClick={() => navigateTo("cert-inspector")}
              className="block w-full text-left py-1 text-[#94a3b8] hover:text-[#2dd4bf]"
            >
              Certificate Audit
            </button>
            <div className="pt-2 border-t border-[#243346] flex items-center justify-between">
              {user ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 py-1 text-sm text-[#ff4d4d] hover:underline cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Sign Out to Welcome Home</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate({ to: "/" })}
                  className="flex items-center gap-1.5 py-1 text-sm text-[#94a3b8] hover:text-[#f8fafc] cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Exit to Welcome Home</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <main
        id="dashboard"
        className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 pb-20 pt-8 space-y-12"
      >
        {/* Terminal Frame: Single Domain Probing Engine */}
        <section className="border-2 border-[#243346] bg-[#0c1017] shadow-[0_0_35px_rgba(0,0,0,0.65)] overflow-hidden">
          {/* Terminal Window Header Bar */}
          <div className="bg-[#141b24] border-b-2 border-[#243346] px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[#ff4d4d]" />
              <span className="size-2.5 rounded-full bg-[#fef08a]" />
              <span className="size-2.5 rounded-full bg-[#a3e635]" />
              <span className="font-mono text-xs text-[#94a3b8] ml-2">
                trustguard@sensor:~# /bin/probe_target --tls --emudhra --ai-eval
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-pixel text-[10px] text-[#a3e635] flex items-center gap-1.5 bg-[#a3e635]/10 px-2 py-0.5 border border-[#a3e635]/30">
                <span className="size-1.5 rounded-full bg-[#a3e635] animate-ping" />
                SENSOR_READY
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 font-pixel text-[10px] text-[#ff6b35] tracking-wider uppercase mb-2">
                <PixelAlien className="size-3 text-[#ff6b35]" />
                DIGITAL TRUST INTELLIGENCE · LIVE SOCKET PROBING
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#f8fafc]">
                AI-Powered Web Threat Detection & Cryptographic Audit
              </h1>
              <p className="mt-1.5 max-w-2xl font-code text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
                Execute live server-side TLS handshakes, audit eMudhra weak CA key generation,
                verify Certificate Transparency logs, and synthesize real threat telemetry with
                Gemini 3.8 Flash.
              </p>
            </div>

            {/* Scanner Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleScan();
              }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Globe2
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                  />
                  <Input
                    id="target-domain-input"
                    type="text"
                    placeholder="Enter target domain or URL (e.g., github.com, paypal-verify.net)..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    disabled={isScanning}
                    className="h-12 pl-11 pr-4 rounded-none border-2 border-[#334155] bg-[#080b10] font-code text-sm text-[#f8fafc] placeholder:text-[#64748b] focus-visible:border-[#a3e635] focus-visible:ring-0"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isScanning}
                  className="h-12 px-6 rounded-none bg-[#ff6b35] hover:bg-[#ff8a00] text-black font-arcade text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(255,107,53,0.35)] cursor-pointer"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw size={14} className="mr-2 animate-spin" />
                      Auditing Target...
                    </>
                  ) : (
                    <>
                      <Terminal size={14} className="mr-2" />
                      Execute Deep Scan
                    </>
                  )}
                </Button>
              </div>

              {/* Quick Test Domain Buttons with Retro Sticker Styling */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-pixel text-[10px] text-[#94a3b8] uppercase tracking-wide">
                  Quick Audit Targets:
                </span>
                <button
                  type="button"
                  onClick={() => handleScan("github.com")}
                  className="font-code text-xs px-2.5 py-1 border border-[#334155] bg-[#121924] text-[#a3e635] hover:border-[#a3e635] transition-all cursor-pointer"
                >
                  github.com (Clean ECDSA)
                </button>
                <button
                  type="button"
                  onClick={() => handleScan("emudhra-auth-gateway-test.net")}
                  className="font-code text-xs px-2.5 py-1 border border-[#334155] bg-[#121924] text-[#fef08a] hover:border-[#fef08a] transition-all cursor-pointer"
                >
                  emudhra-auth-gateway-test.net (Weak Key Check)
                </button>
                <button
                  type="button"
                  onClick={() => handleScan("secure-login-hdfc-update.com")}
                  className="font-code text-xs px-2.5 py-1 border border-[#334155] bg-[#121924] text-[#ff4d4d] hover:border-[#ff4d4d] transition-all cursor-pointer"
                >
                  secure-login-hdfc-update.com (Phishing Clone)
                </button>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 border-2 border-[#ff4d4d] bg-[#ff4d4d]/10 px-4 py-2.5 font-code text-xs text-[#ff4d4d]">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {isScanning && (
                <div className="border-2 border-[#2dd4bf]/40 bg-[#080b10] p-4 space-y-2.5 shadow-inner">
                  <div className="flex items-center justify-between text-xs text-[#2dd4bf] font-code">
                    <span className="flex items-center gap-2">
                      <Terminal size={14} className="animate-pulse" />
                      {scanSteps[scanStep]}
                    </span>
                    <span className="font-pixel text-[10px]">
                      PHASE {String(scanStep + 1).padStart(2, "0")} /{" "}
                      {String(scanSteps.length).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#121924] overflow-hidden border border-[#243346]">
                    <div
                      className="h-full bg-gradient-to-r from-[#ff6b35] via-[#fef08a] to-[#a3e635] transition-all duration-300"
                      style={{ width: `${((scanStep + 1) / scanSteps.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </form>
          </div>
        </section>

        {/* Scan Results View (Rendered when real scan data is present) */}
        {scanResult && (
          <section className="space-y-6">
            {/* Investigation Top Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 border-[#243346] bg-[#0c1017] p-5 shadow-xl">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-code text-xl font-bold text-[#f8fafc] select-all">
                    {scanResult.domain}
                  </h2>
                  <span
                    className={`font-pixel text-[10px] px-2.5 py-1 font-bold uppercase tracking-wider ${
                      scanResult.aiAnalysis.riskLevel === "CRITICAL"
                        ? "bg-[#ff4d4d]/20 text-[#ff4d4d] border border-[#ff4d4d]"
                        : scanResult.aiAnalysis.riskLevel === "HIGH"
                          ? "bg-[#ff6b35]/20 text-[#ff6b35] border border-[#ff6b35]"
                          : scanResult.aiAnalysis.riskLevel === "MEDIUM"
                            ? "bg-[#fef08a]/20 text-[#fef08a] border border-[#fef08a]"
                            : "bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]"
                    }`}
                  >
                    {scanResult.aiAnalysis.riskLevel} RISK
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#94a3b8] font-code">
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
                  className="rounded-none bg-[#ff6b35] hover:bg-[#ff8a00] text-black h-8 text-xs font-arcade tracking-wider uppercase cursor-pointer"
                >
                  <Share2 size={13} className="mr-1.5" />
                  Share Report
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopySummary}
                  className="rounded-none border-[#334155] bg-[#121924] hover:bg-[#1e293b] text-[#e2e8f0] h-8 text-xs font-code cursor-pointer"
                >
                  <Copy size={13} className="mr-1.5" />
                  {copiedNotification ? "Copied!" : "Quick Copy"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportJson}
                  className="rounded-none border-[#334155] bg-[#121924] hover:bg-[#1e293b] text-[#e2e8f0] h-8 text-xs font-code cursor-pointer"
                >
                  <Download size={13} className="mr-1.5" />
                  JSON
                </Button>
              </div>
            </div>

            {/* Gemini 3.8 Flash AI Synthesis Card */}
            <div className="border-2 border-[#2dd4bf]/40 bg-[#0c1017] p-6 relative overflow-hidden shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="grid size-9 place-items-center border border-[#2dd4bf]/40 bg-[#2dd4bf]/10 text-[#2dd4bf] shrink-0">
                    <Sparkles size={18} />
                  </span>
                  <div>
                    <div className="font-pixel text-[10px] font-bold uppercase tracking-[0.12em] text-[#2dd4bf]">
                      Gemini 3.8 Flash Forensic Synthesis
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#f8fafc] mt-0.5">
                      {scanResult.aiAnalysis.primaryVector}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-pixel text-[10px] uppercase tracking-wide text-[#94a3b8]">
                    Threat Score
                  </div>
                  <div
                    className={`font-display text-3xl sm:text-4xl font-extrabold tabular-nums ${
                      scanResult.aiAnalysis.threatScore >= 60
                        ? "text-[#ff4d4d]"
                        : scanResult.aiAnalysis.threatScore >= 30
                          ? "text-[#ff6b35]"
                          : "text-[#a3e635]"
                    }`}
                  >
                    {scanResult.aiAnalysis.threatScore}{" "}
                    <span className="text-xs font-mono text-[#94a3b8] font-normal">/ 100</span>
                  </div>
                </div>
              </div>

              <p className="mt-4 font-code text-xs sm:text-sm text-[#cbd5e1] leading-relaxed border-t border-[#1e293b] pt-4">
                {scanResult.aiAnalysis.summary}
              </p>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#1e293b] pt-4">
                <div>
                  <h4 className="font-pixel text-[10px] font-bold text-[#fef08a] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <AlertTriangle size={13} className="text-[#fef08a]" />
                    Observed Risk Indicators
                  </h4>
                  <ul className="space-y-1.5 font-code text-xs text-[#94a3b8]">
                    {scanResult.aiAnalysis.indicators.map((ind, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#ff6b35] mt-0.5">›</span>
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-pixel text-[10px] font-bold text-[#a3e635] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-[#a3e635]" />
                    Recommended Remediation
                  </h4>
                  <ul className="space-y-1.5 font-code text-xs text-[#94a3b8]">
                    {scanResult.aiAnalysis.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#a3e635] mt-0.5">✓</span>
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
              <div className="border-2 border-[#243346] bg-[#0c1017] p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-[#243346] pb-3">
                    <div className="flex items-center gap-2">
                      <LockKeyhole size={16} className="text-[#2dd4bf]" />
                      <h3 className="font-display text-sm font-bold text-[#f8fafc]">
                        TLS & Cryptography
                      </h3>
                    </div>
                    <span className="font-pixel text-[10px] text-[#2dd4bf]">
                      {scanResult.certificate.protocol}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2.5 font-code text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#94a3b8]">Common Name (CN):</span>
                      <span
                        className="text-[#f8fafc] truncate max-w-[170px]"
                        title={scanResult.certificate.subject.CN}
                      >
                        {scanResult.certificate.subject.CN || "None"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#94a3b8]">Issuer CA:</span>
                      <span
                        className="text-[#f8fafc] truncate max-w-[170px]"
                        title={scanResult.certificate.issuer.CN}
                      >
                        {scanResult.certificate.issuer.CN ||
                          scanResult.certificate.issuer.O ||
                          "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#94a3b8]">Key Algorithm:</span>
                      <span className="text-[#f8fafc]">{scanResult.certificate.keyAlgorithm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#94a3b8]">Cipher Suite:</span>
                      <span
                        className="text-[#f8fafc] truncate max-w-[170px]"
                        title={scanResult.certificate.cipherSuite}
                      >
                        {scanResult.certificate.cipherSuite}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#94a3b8]">Validity Window:</span>
                      <span className="text-[#f8fafc] tabular-nums">
                        {scanResult.certificate.daysRemaining} days remaining
                      </span>
                    </div>
                  </div>
                </div>

                {/* eMudhra Weak Key Generation Audit Box */}
                <div
                  className={`border-2 p-3 space-y-1.5 ${
                    scanResult.certificate.emudhraVulnerabilityCheck.isVulnerable
                      ? "border-[#ff4d4d] bg-[#ff4d4d]/10"
                      : "border-[#a3e635]/60 bg-[#a3e635]/10"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 font-pixel text-[10px]">
                      <KeyRound size={13} />
                      eMudhra CA Key Audit
                    </span>
                    <span
                      className={`text-[9px] uppercase font-pixel px-1.5 py-0.5 ${
                        scanResult.certificate.emudhraVulnerabilityCheck.isVulnerable
                          ? "text-[#ff4d4d] bg-[#ff4d4d]/20"
                          : "text-[#a3e635] bg-[#a3e635]/20"
                      }`}
                    >
                      {scanResult.certificate.emudhraVulnerabilityCheck.keyGenerationStatus}
                    </span>
                  </div>
                  <p className="font-code text-[11px] text-[#cbd5e1] leading-normal">
                    {scanResult.certificate.emudhraVulnerabilityCheck.reasons[0] ||
                      "Cryptographic entropy and CA trust chain validated."}
                  </p>
                </div>
              </div>

              {/* Pillar 2: Application Web Security Posture */}
              <div className="border-2 border-[#243346] bg-[#0c1017] p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-[#243346] pb-3">
                    <div className="flex items-center gap-2">
                      <FileCheck2 size={16} className="text-[#ff6b35]" />
                      <h3 className="font-display text-sm font-bold text-[#f8fafc]">
                        Web Security Headers
                      </h3>
                    </div>
                    <span className="font-pixel text-[10px] font-bold text-[#ff6b35]">
                      {scanResult.securityHeaders.score} / 100
                    </span>
                  </div>

                  <div className="mt-4 space-y-2.5 font-code text-xs">
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

                <div className="border border-[#243346] bg-[#121924] p-3 font-code text-xs space-y-1">
                  <div className="flex justify-between text-[#94a3b8]">
                    <span>HTTP Status Code:</span>
                    <span className="text-[#f8fafc] font-semibold">
                      {scanResult.securityHeaders.statusCode || "No Response"}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#94a3b8]">
                    <span>Server Signature:</span>
                    <span className="text-[#f8fafc]">
                      {scanResult.securityHeaders.serverHeader || "Hidden / Cloudflare"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pillar 3: Domain Identity & Mail Infrastructure */}
              <div className="border-2 border-[#243346] bg-[#0c1017] p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-[#243346] pb-3">
                    <div className="flex items-center gap-2">
                      <MailCheck size={16} className="text-[#a3e635]" />
                      <h3 className="font-display text-sm font-bold text-[#f8fafc]">
                        Domain Trust & DNS
                      </h3>
                    </div>
                    <span className="font-pixel text-[10px] text-[#a3e635]">
                      {scanResult.dns.hasDmarc ? "DMARC Protected" : "DMARC Missing"}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2.5 font-code text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#94a3b8]">Mail Exchange (MX):</span>
                      <span className="text-[#f8fafc]">
                        {scanResult.dns.hasMx
                          ? `${scanResult.dns.mxRecords.length} records`
                          : "No MX configured"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#94a3b8]">SPF Policy:</span>
                      <span className={scanResult.dns.hasSpf ? "text-[#a3e635]" : "text-[#ff4d4d]"}>
                        {scanResult.dns.hasSpf ? "Configured (v=spf1)" : "Missing"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#94a3b8]">DMARC Policy:</span>
                      <span
                        className={scanResult.dns.hasDmarc ? "text-[#a3e635]" : "text-[#ff4d4d]"}
                      >
                        {scanResult.dns.hasDmarc ? "Configured (_dmarc)" : "Missing"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#94a3b8]">CT Logs Recorded:</span>
                      <span className="text-[#f8fafc]">
                        {scanResult.certificate.certificateTransparency.count > 0
                          ? `${scanResult.certificate.certificateTransparency.count} certificates`
                          : "Queried crt.sh"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#94a3b8]">SAN Domains:</span>
                      <span className="text-[#f8fafc]">
                        {scanResult.certificate.sans.length > 0
                          ? `${scanResult.certificate.sans.length} alternate names`
                          : "None"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border border-[#243346] bg-[#121924] p-3 text-xs">
                  <div className="font-pixel text-[9px] uppercase text-[#94a3b8] tracking-wide mb-1">
                    Certificate SHA-256 Fingerprint
                  </div>
                  <div className="font-code text-[11px] text-[#cbd5e1] break-all select-all">
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

        {/* Section 02: Bulk URL Concurrent Threat Assessment Matrix */}
        <section id="bulk-scanner" className="space-y-4 pt-4">
          <div className="flex items-center gap-2 border-b border-[#243346] pb-3">
            <span className="font-pixel text-[11px] px-2 py-0.5 bg-[#ff6b35] text-black font-bold uppercase">
              MODULE 02
            </span>
            <span className="font-arcade text-xs sm:text-sm text-[#f8fafc] tracking-wider uppercase">
              BULK URL THREAT ASSESSMENT
            </span>
          </div>
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

        {/* Section 03: Certificate Trust Score Trend Surveillance Line Chart */}
        <section id="trust-trends" className="space-y-4 pt-4">
          <div className="flex items-center gap-2 border-b border-[#243346] pb-3">
            <span className="font-pixel text-[11px] px-2 py-0.5 bg-[#00f0ff] text-black font-bold uppercase">
              MODULE 03
            </span>
            <span className="font-arcade text-xs sm:text-sm text-[#f8fafc] tracking-wider uppercase">
              CONTINUOUS TRUST SURVEILLANCE
            </span>
          </div>
          <TrustScoreTrendChart
            currentScan={scanResult}
            onSelectAuditDomain={(domain) => {
              setUrlInput(domain);
              handleScan(domain);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </section>

        {/* Section 04: Community Threat Intelligence (Gated for Guests, Active for Authenticated) */}
        <section id="threat-feed" className="space-y-4 pt-4">
          <div className="flex items-center gap-2 border-b border-[#243346] pb-3">
            <span className="font-pixel text-[11px] px-2 py-0.5 bg-[#a3e635] text-black font-bold uppercase">
              MODULE 04
            </span>
            <span className="font-arcade text-xs sm:text-sm text-[#f8fafc] tracking-wider uppercase">
              COMMUNITY THREAT INTELLIGENCE
            </span>
          </div>

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
            <div className="border-2 border-[#ff6b35]/60 bg-[#0c1017] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 font-pixel text-[11px] text-[#ff6b35] tracking-wider uppercase bg-[#ff6b35]/10 px-2.5 py-1 border border-[#ff6b35]/30">
                  <Lock size={13} />
                  COMMUNITY THREAT INTELLIGENCE // RESTRICTED ACCESS
                </div>

                <h2 className="font-arcade text-lg sm:text-xl text-[#f8fafc] tracking-tight leading-snug">
                  ANALYST AUTHENTICATION REQUIRED
                </h2>

                <p className="font-code text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
                  You are currently exploring TrustGuard AI in{" "}
                  <strong className="text-[#f8fafc]">Guest Mode</strong>. While single-domain
                  probing, bulk security scans, and trust trend surveillance are fully accessible,
                  the live collaborative threat feed is locked to protect community consensus
                  against unverified or automated submissions.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2 font-code text-xs text-[#94a3b8]">
                  <div className="p-3 border border-[#243346] bg-[#121924]">
                    <span className="text-[#a3e635] font-pixel text-[10px] block mb-1">
                      01. Live IOCs
                    </span>
                    Confirmed malicious domains & phishing signatures.
                  </div>
                  <div className="p-3 border border-[#243346] bg-[#121924]">
                    <span className="text-[#ff6b35] font-pixel text-[10px] block mb-1">
                      02. Upvote Signals
                    </span>
                    Boost community verification on active attack campaigns.
                  </div>
                  <div className="p-3 border border-[#243346] bg-[#121924]">
                    <span className="text-[#00f0ff] font-pixel text-[10px] block mb-1">
                      03. Incident Reporting
                    </span>
                    Publish newly discovered weak CAs & typosquats.
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <Button
                    onClick={handleSignIn}
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
                    className="h-10 px-4 rounded-none border-[#334155] text-xs font-code text-[#94a3b8] hover:text-[#f8fafc] cursor-pointer"
                  >
                    Continue Using Guest Probing
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Section 05: Browser Extension Integration Guide & Snippet Suite */}
        <section id="extension-guide" className="space-y-4 pt-4">
          <div className="flex items-center gap-2 border-b border-[#243346] pb-3">
            <span className="font-pixel text-[11px] px-2 py-0.5 bg-[#fef08a] text-black font-bold uppercase">
              MODULE 05
            </span>
            <span className="font-arcade text-xs sm:text-sm text-[#f8fafc] tracking-wider uppercase">
              BROWSER EXTENSION INTEGRATION
            </span>
          </div>
          <BrowserExtensionGuide />
        </section>

        {/* Footer */}
        <footer className="mt-14 border-t-2 border-[#243346] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs font-code text-[#64748b] gap-3">
          <div className="flex items-center gap-2">
            <PixelAlien className="size-4 text-[#a3e635]" />
            <span className="font-bold text-[#f8fafc]">TrustGuard AI</span>
            <span>·</span>
            <span className="text-[#ff6b35]">MLH x Hacktoberfest Threat Intelligence Network</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>eMudhra Weak Key Audit Active</span>
            <span>·</span>
            <span>Gemini 3.8 Flash Synthesis</span>
            <span>·</span>
            <Link to="/" className="text-[#a3e635] hover:underline">
              Return to Welcome Portal
            </Link>
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
  detail: string | null;
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between items-center">
        <span className="text-[#94a3b8] truncate max-w-[190px]" title={name}>
          {name}:
        </span>
        <span
          className={`font-pixel text-[9px] uppercase px-1.5 py-0.2 ${
            present
              ? "text-[#a3e635] bg-[#a3e635]/10 border border-[#a3e635]/30"
              : "text-[#ff4d4d] bg-[#ff4d4d]/10 border border-[#ff4d4d]/30"
          }`}
        >
          {present ? "Configured" : "Missing"}
        </span>
      </div>
      {detail && (
        <div className="text-[10px] text-[#64748b] truncate max-w-[280px] font-mono" title={detail}>
          {detail}
        </div>
      )}
    </div>
  );
}
