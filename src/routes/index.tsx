import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  Check,
  Clock3,
  Crosshair,
  ExternalLink,
  Eye,
  FileCheck2,
  Globe2,
  LockKeyhole,
  Menu,
  Radar,
  RefreshCw,
  ScanLine,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Signal,
  Sparkles,
  Terminal,
  TriangleAlert,
  X,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SCAN_DURATION_MS, SCAN_STEPS } from "@/lib/scan";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TrustGuard AI — Digital Trust Intelligence" },
      {
        name: "description",
        content: "AI-powered web threat detection and digital trust intelligence.",
      },
      { property: "og:title", content: "TrustGuard AI — Digital Trust Intelligence" },
      {
        property: "og:description",
        content: "AI-powered web threat detection and digital trust intelligence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const threats = [
  {
    time: "09:42:18",
    url: "secure-login-hdfc-update.com",
    vector: "Impersonation",
    severity: "Critical",
  },
  {
    time: "09:39:51",
    url: "paypaI-verify-account.net",
    vector: "Credential theft",
    severity: "Critical",
  },
  {
    time: "09:36:07",
    url: "accounts-google-auth.co",
    vector: "Fraudulent TLS",
    severity: "High",
  },
  {
    time: "09:31:44",
    url: "microsoft-security-check.io",
    vector: "Brand spoofing",
    severity: "High",
  },
];

function Dashboard() {
  const [url, setUrl] = useState("https://secure-banking-portal.com");
  const [scanning, setScanning] = useState(false);
  const [step, setStep] = useState(0);
  const [scannedUrl, setScannedUrl] = useState("secure-banking-portal.com");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [deepAnalysisOn, setDeepAnalysisOn] = useState(true);

  const domain = useMemo(() => {
    const trimmed = scannedUrl.trim();
    try {
      return new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`).hostname;
    } catch {
      return trimmed || "unknown-domain";
    }
  }, [scannedUrl]);

  useEffect(() => {
    if (!scanning) return;
    const startedAt = Date.now();
    const updateStep = () => {
      const elapsed = Date.now() - startedAt;
      setStep(Math.min(Math.floor((elapsed / SCAN_DURATION_MS) * SCAN_STEPS.length), SCAN_STEPS.length - 1));
      if (elapsed >= SCAN_DURATION_MS) {
        setScanning(false);
        setStep(SCAN_STEPS.length);
      }
    };
    const interval = window.setInterval(updateStep, 180);
    const timeout = window.setTimeout(() => {
      setScanning(false);
      setStep(SCAN_STEPS.length);
    }, SCAN_DURATION_MS);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [scanning]);

  function startScan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (scanning || !url.trim()) return;
    setScannedUrl(url.trim());
    setStep(0);
    setScanning(true);
  }

  function navigateTo(section: "dashboard" | "threat-feed") {
    setMobileNavOpen(false);
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <a
            aria-label="TrustGuard AI home"
            className="flex items-center gap-3"
            href="#dashboard"
            onClick={(event) => {
              event.preventDefault();
              navigateTo("dashboard");
            }}
          >
            <span className="grid size-9 place-items-center border border-primary/30 bg-primary/10 text-primary">
              <ShieldCheck size={19} strokeWidth={1.8} />
            </span>
            <span className="text-[15px] font-semibold tracking-[0.01em]">
              TrustGuard <span className="text-primary">AI</span>
            </span>
          </a>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            <button onClick={() => navigateTo("dashboard")} className="nav-link nav-link-active" type="button">
              Dashboard
            </button>
            <button onClick={() => navigateTo("threat-feed")} className="nav-link" type="button">
              Global Threat Feed
              <span className="ml-2 size-1.5 rounded-full bg-success" />
            </button>
            <button onClick={() => setSettingsOpen(true)} className="nav-link" type="button">
              Settings
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 border-r border-border pr-4 text-[11px] text-muted-foreground sm:flex">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-35" />
                <span className="relative inline-flex size-2 rounded-full bg-success" />
              </span>
              SYSTEM OPERATIONAL
            </div>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative size-9 text-muted-foreground">
              <Bell size={17} />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-danger" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open navigation"
              className="size-9 md:hidden"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              <Menu size={19} />
            </Button>
            <div className="hidden size-8 items-center justify-center rounded-full border border-border bg-secondary text-xs font-semibold sm:flex">
              SG
            </div>
          </div>
        </div>
        {mobileNavOpen && (
          <nav className="flex flex-col border-t border-border px-5 py-2 md:hidden" aria-label="Mobile navigation">
            <button onClick={() => navigateTo("dashboard")} className="mobile-nav-link" type="button">Dashboard</button>
            <button onClick={() => navigateTo("threat-feed")} className="mobile-nav-link" type="button">Global Threat Feed</button>
            <button onClick={() => { setMobileNavOpen(false); setSettingsOpen(true); }} className="mobile-nav-link" type="button">Settings</button>
          </nav>
        )}
      </header>

      <main id="dashboard" className="mx-auto max-w-[1440px] px-5 pb-14 pt-8 sm:px-8 lg:px-12 lg:pt-10">
        <section className="relative isolate overflow-hidden border-b border-border pb-8 pt-2 sm:pb-10">
          <div className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-3/5 scan-grid opacity-25 [mask-image:linear-gradient(to_left,black,transparent)]" />
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.13em] text-primary">
                <span className="size-1.5 rounded-full bg-primary" />
                Digital trust intelligence
              </div>
              <h1 className="text-3xl font-semibold leading-tight sm:text-[38px]">Web threat scanner</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Investigate a domain. Surface hidden risk before it reaches your users.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock3 size={14} />
              Last scan <span className="font-mono text-foreground">2 min ago</span>
              <button onClick={() => { setUrl(`https://${domain}`); navigateTo("dashboard"); }} aria-label="Refresh latest scan" className="ml-1 inline-grid size-8 place-items-center border border-border text-muted-foreground transition-colors hover:text-primary">
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          <form onSubmit={startScan} className="max-w-[940px]">
            <label htmlFor="scan-url" className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Target URL
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex min-w-0 flex-1 items-center">
                <Globe2 size={17} className="pointer-events-none absolute left-4 text-muted-foreground" />
                <Input
                  id="scan-url"
                  type="text"
                  inputMode="url"
                  autoComplete="url"
                  aria-label="URL to scan"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="Enter a URL or domain to analyze"
                  className="h-12 rounded-none border-border bg-card pl-11 pr-4 font-mono text-sm placeholder:font-sans placeholder:text-muted-foreground/65 focus-visible:ring-primary"
                />
              </div>
              <Button type="submit" disabled={scanning || !url.trim()} className="h-12 min-w-[158px] rounded-none bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_24%,transparent)] transition-all hover:bg-primary/90 hover:shadow-[0_0_32px_color-mix(in_oklab,var(--primary)_38%,transparent)]">
                {scanning ? <RefreshCw size={16} className="animate-spin" /> : <ScanLine size={17} />}
                {scanning ? "Scanning" : "Deep scan"}
                {!scanning && <ArrowUpRight size={15} className="ml-1" />}
              </Button>
            </div>
            {scanning && (
              <div role="status" aria-live="polite" className="mt-4 flex min-h-12 items-center gap-3 border border-primary/25 bg-primary/5 px-4 py-3 font-mono text-xs text-primary">
                <Terminal size={15} className="shrink-0" />
                <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-primary" />
                <span className="min-w-0 flex-1">{SCAN_STEPS[step] ?? SCAN_STEPS[SCAN_STEPS.length - 1]}</span>
                <span className="hidden text-muted-foreground sm:inline">PHASE {Math.min(step + 1, 4).toString().padStart(2, "0")} / 04</span>
              </div>
            )}
          </form>
        </section>

        <section aria-label="Scan overview" className="grid grid-cols-2 border-b border-border py-5 sm:grid-cols-4">
          <Metric label="Domains monitored" value="24,891" delta="+8.2%" trend="up" icon={<Globe2 size={16} />} />
          <Metric label="Threats blocked" value="1,284" delta="+12.4%" trend="up" icon={<ShieldAlert size={16} />} />
          <Metric label="Trust index" value="94.6%" delta="+2.1%" trend="up" icon={<Activity size={16} />} />
          <Metric label="Avg. response" value="142ms" delta="−18ms" trend="down" icon={<Radar size={16} />} />
        </section>

        <section className="pt-7" aria-label="Trust analysis results">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-lg font-semibold">Trust analysis</h2>
                <Badge variant="outline" className="rounded-none border-danger/40 bg-danger/10 px-2 py-1 text-[10px] uppercase tracking-wide text-danger">Critical risk</Badge>
              </div>
              <p className="mt-1.5 break-all font-mono text-xs text-muted-foreground">{domain}</p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="text-[11px] text-muted-foreground">SCAN ID <span className="ml-1 font-mono text-foreground/80">TG-28491</span></span>
              <Button variant="outline" size="sm" className="h-8 rounded-none border-border px-2.5 text-xs" onClick={() => navigator.clipboard?.writeText(domain)}>
                <ExternalLink size={13} /> Export report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_1.65fr]">
            <TrustScore />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <CertificateCard />
              <AiAnalysisCard />
              <SecurityCard />
            </div>
          </div>
        </section>

        <section id="threat-feed" className="scroll-mt-24 pt-9" aria-label="Live global threat feed">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <div className="mb-1 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.12em] text-primary">
                <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-35" /><span className="relative inline-flex size-2 rounded-full bg-success" /></span>
                Global network · live
              </div>
              <h2 className="text-lg font-semibold">Threat intelligence feed</h2>
            </div>
            <button onClick={() => navigateTo("threat-feed")} className="flex items-center gap-1.5 self-start text-xs font-medium text-muted-foreground transition-colors hover:text-primary sm:self-auto" type="button">
              View all activity <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="overflow-hidden border border-border bg-card">
            <div className="hidden grid-cols-[116px_minmax(0,1fr)_190px_104px] gap-3 border-b border-border bg-secondary/45 px-4 py-3 text-[10px] font-medium uppercase tracking-[0.09em] text-muted-foreground sm:grid sm:px-5">
              <span>Timestamp</span><span>Malicious URL</span><span>Threat vector</span><span>Status</span>
            </div>
            <div className="divide-y divide-border">
              {threats.map((threat) => (
                <ThreatRow key={threat.url} threat={threat} />
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-border bg-secondary/20 px-4 py-3.5 sm:px-5">
              <span className="text-[11px] text-muted-foreground">Showing <span className="text-foreground">4</span> of <span className="text-foreground">1,284</span> detected threats</span>
              <button type="button" onClick={() => navigateTo("threat-feed")} className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80">Open feed <ArrowUpRight size={13} /></button>
            </div>
          </div>
        </section>

        <footer className="mt-10 flex flex-col gap-2 border-t border-border pt-4 text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>TRUSTGUARD AI <span className="mx-1.5">·</span> THREAT INTELLIGENCE NETWORK</span>
          <span className="flex items-center gap-1.5"><Signal size={12} className="text-success" /> All systems operational <span className="mx-1">·</span> Data refreshes continuously</span>
        </footer>
      </main>

      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/75 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setSettingsOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="settings-title" className="w-full max-w-md border border-border bg-card p-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3"><span className="grid size-9 place-items-center border border-primary/25 bg-primary/10 text-primary"><Settings2 size={18} /></span><div><h2 id="settings-title" className="font-semibold">Scan settings</h2><p className="mt-0.5 text-xs text-muted-foreground">Configure your intelligence workspace</p></div></div>
              <Button variant="ghost" size="icon" aria-label="Close settings" className="-mr-2 -mt-2" onClick={() => setSettingsOpen(false)}><X size={17} /></Button>
            </div>
            <div className="mt-5 divide-y divide-border border-y border-border">
              <SettingRow icon={<Bell size={16} />} title="Threat notifications" detail="Alert when critical activity is detected" checked={notificationsOn} onCheckedChange={setNotificationsOn} />
              <SettingRow icon={<Crosshair size={16} />} title="Deep analysis" detail="Include visual and certificate checks" checked={deepAnalysisOn} onCheckedChange={setDeepAnalysisOn} />
            </div>
            <div className="mt-4 flex justify-end"><Button onClick={() => setSettingsOpen(false)} className="rounded-none">Done</Button></div>
          </section>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, delta, trend, icon }: { label: string; value: string; delta: string; trend: "up" | "down"; icon: ReactNode }) {
  return (
    <div className="flex min-w-0 items-center gap-3 border-r border-border px-3 py-1 first:pl-0 last:border-r-0 sm:gap-3.5 sm:px-5">
      <span className="hidden size-9 shrink-0 items-center justify-center border border-border bg-card text-primary sm:flex">{icon}</span>
      <div className="min-w-0"><p className="truncate text-[10px] text-muted-foreground sm:text-[11px]">{label}</p><div className="mt-1 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5"><span className="text-lg font-semibold tabular-nums sm:text-xl">{value}</span><span className="inline-flex items-center text-[9px] text-success sm:text-[10px]">{trend === "up" ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}{delta}</span></div></div>
    </div>
  );
}

function TrustScore() {
  return (
    <article className="relative flex min-h-[254px] flex-col justify-between overflow-hidden border border-danger/25 bg-card p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full border border-danger/10" />
      <div className="pointer-events-none absolute -right-12 -top-16 size-48 rounded-full border border-danger/10" />
      <div className="relative flex items-start justify-between gap-2">
        <div><p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Digital trust score</p><p className="mt-1 text-xs text-muted-foreground">Composite domain risk assessment</p></div>
        <Badge variant="outline" className="rounded-none border-danger/40 bg-danger/10 text-[9px] uppercase tracking-wide text-danger"><TriangleAlert size={11} className="mr-1" /> Critical</Badge>
      </div>
      <div className="relative flex flex-1 items-center gap-5 py-5 sm:gap-7">
        <div className="score-ring relative grid size-[124px] shrink-0 place-items-center sm:size-[138px]">
          <div className="text-center"><div className="font-mono text-[40px] font-semibold leading-none text-danger">34</div><div className="mt-1 font-mono text-[10px] text-muted-foreground">/ 100</div></div>
        </div>
        <div className="min-w-0"><div className="flex items-center gap-1.5 text-xs font-semibold text-danger"><ArrowDownRight size={15} /> High exposure</div><p className="mt-2 text-xs leading-5 text-muted-foreground">This domain exhibits multiple indicators associated with active phishing campaigns.</p><p className="mt-3 font-mono text-[10px] text-muted-foreground">RISK LEVEL: <span className="text-danger">SEVERE</span></p></div>
      </div>
      <div className="relative flex items-center justify-between border-t border-border pt-3 text-[10px] text-muted-foreground"><span>Confidence score</span><span className="font-mono text-foreground">98.2%</span></div>
    </article>
  );
}

function CardHeading({ icon, eyebrow, title }: { icon: ReactNode; eyebrow: string; title: string }) {
  return <div className="mb-4 flex items-start gap-2.5"><span className="mt-0.5 grid size-7 shrink-0 place-items-center border border-border bg-secondary text-primary">{icon}</span><div><p className="text-[9px] font-medium uppercase tracking-[0.09em] text-muted-foreground">{eyebrow}</p><h3 className="mt-0.5 text-[13px] font-semibold leading-5">{title}</h3></div></div>;
}

function CertificateCard() {
  return (
    <article className="flex min-h-[254px] flex-col border border-border bg-card p-4 transition-colors hover:border-danger/35 sm:p-4">
      <CardHeading icon={<LockKeyhole size={14} />} eyebrow="Pillar 01" title="Certificate & trust" />
      <div className="space-y-2.5 border-t border-border pt-3 text-[10px]">
        <DataRow label="Issuer" value="Untrusted CA" bad />
        <DataRow label="Algorithm" value="RSA-1024 · Weak" bad />
      </div>
      <div className="mt-auto space-y-2 pt-3">
        <div className="flex items-center gap-2 border border-danger/25 bg-danger/5 px-2.5 py-2 text-[9px] leading-4 text-danger"><XCircle size={13} className="shrink-0" /><span className="min-w-0"><span className="font-semibold">CT log:</span> Unlogged</span></div>
        <div className="flex items-start gap-2 border border-danger/25 bg-danger/5 px-2.5 py-2 text-[9px] leading-4 text-danger"><XCircle size={13} className="mt-0.5 shrink-0" /><span><span className="font-semibold">eMudhra key generation:</span> FAILED</span></div>
      </div>
    </article>
  );
}

function AiAnalysisCard() {
  return (
    <article className="flex min-h-[254px] flex-col border border-border bg-card p-4 transition-colors hover:border-warning/40 sm:p-4">
      <CardHeading icon={<Sparkles size={14} />} eyebrow="Pillar 02" title="Visual & AI analysis" />
      <div className="mb-3 flex items-center gap-2 border border-warning/25 bg-warning/5 px-2.5 py-2"><Eye size={14} className="shrink-0 text-warning" /><span className="text-[10px] font-semibold text-warning">98% credential harvesting probability</span></div>
      <p className="text-[10px] leading-[1.7] text-muted-foreground">Visual similarity to legitimate banking portal identified. Deceptive urgency keywords found in page content.</p>
      <div className="mt-auto pt-3"><div className="mb-1.5 flex justify-between text-[9px]"><span className="text-muted-foreground">Threat confidence</span><span className="font-mono text-warning">98%</span></div><div className="h-1 overflow-hidden bg-secondary"><div className="h-full w-[98%] bg-warning" /></div><p className="mt-2.5 text-[9px] text-muted-foreground">Matched patterns <span className="ml-1 font-mono text-foreground">12 of 14</span></p></div>
    </article>
  );
}

function SecurityCard() {
  return (
    <article className="flex min-h-[254px] flex-col border border-border bg-card p-4 transition-colors hover:border-warning/40 sm:p-4">
      <CardHeading icon={<FileCheck2 size={14} />} eyebrow="Pillar 03" title="Web security" />
      <div className="mb-2 grid grid-cols-[minmax(0,1fr)_auto] gap-2 border-b border-border pb-2 text-[9px] uppercase tracking-wide text-muted-foreground"><span>HTTP header</span><span>Result</span></div>
      <div className="space-y-2.5"><HeaderResult name="Strict-Transport-Security" status="Missing" bad /><HeaderResult name="X-Frame-Options" status="Missing" bad /><HeaderResult name="Content-Security-Policy" status="Vulnerable" bad /></div>
      <div className="mt-auto flex items-center gap-1.5 border-t border-border pt-3 text-[9px] text-muted-foreground"><AlertTriangle size={12} className="text-warning" /> 3 issues detected</div>
    </article>
  );
}

function DataRow({ label, value, bad = false }: { label: string; value: string; bad?: boolean }) {
  return <div className="flex items-baseline justify-between gap-1.5"><span className="text-muted-foreground">{label}</span><span className={`text-right font-medium ${bad ? "text-danger" : "text-foreground"}`}>{value}</span></div>;
}

function HeaderResult({ name, status, bad }: { name: string; status: string; bad: boolean }) {
  return <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-[9px]"><span className="truncate font-mono text-muted-foreground" title={name}>{name}</span><span className={`flex items-center gap-1 text-[9px] font-medium ${bad ? "text-danger" : "text-success"}`}>{bad ? <XCircle size={11} /> : <Check size={11} />}{status}</span></div>;
}

function ThreatRow({ threat }: { threat: (typeof threats)[number] }) {
  return (
    <div className="grid grid-cols-1 gap-1.5 px-4 py-3.5 transition-colors hover:bg-secondary/35 sm:grid-cols-[116px_minmax(0,1fr)_190px_104px] sm:items-center sm:gap-3 sm:px-5 sm:py-3">
      <span className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground"><Clock3 size={11} className="sm:hidden" />{threat.time} <span className="sm:hidden">UTC</span></span>
      <span className="flex min-w-0 items-center gap-2"><XCircle size={13} className="shrink-0 text-danger" /><span className="truncate font-mono text-[11px] text-foreground/90">{threat.url}</span></span>
      <span className="pl-5 sm:pl-0"><ThreatBadge vector={threat.vector} /></span>
      <span className="pl-5 text-[9px] font-semibold uppercase tracking-wide text-danger sm:pl-0">{threat.severity}</span>
    </div>
  );
}

function ThreatBadge({ vector }: { vector: string }) {
  const isCritical = vector === "Impersonation" || vector === "Credential theft";
  return <Badge variant="outline" className={`rounded-none px-2 py-0.5 text-[9px] font-medium ${isCritical ? "border-danger/30 bg-danger/5 text-danger" : "border-warning/30 bg-warning/5 text-warning"}`}>{vector}</Badge>;
}

function SettingRow({ icon, title, detail, checked, onCheckedChange }: { icon: ReactNode; title: string; detail: string; checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  return <label className="flex cursor-pointer items-center justify-between gap-4 py-3.5"><span className="flex items-start gap-3"><span className="mt-0.5 text-muted-foreground">{icon}</span><span><span className="block text-sm font-medium">{title}</span><span className="mt-1 block text-xs text-muted-foreground">{detail}</span></span></span><input type="checkbox" checked={checked} onChange={(event) => onCheckedChange(event.target.checked)} className="size-4 accent-primary" /></label>;
}