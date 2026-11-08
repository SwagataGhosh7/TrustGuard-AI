import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Globe2,
  KeyRound,
  LockKeyhole,
  LogIn,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
  X,
} from "lucide-react";

import welcomeHeroImage from "@/assets/trustguard-welcome.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TrustGuard AI — Welcome & Access Portal" },
      {
        name: "description",
        content:
          "AI-powered web threat detection and digital trust intelligence. Inspect domains with real-time TLS handshake analysis, eMudhra weak-key auditing, and Gemini AI threat synthesis.",
      },
      { property: "og:title", content: "TrustGuard AI — Welcome & Access Portal" },
      {
        property: "og:description",
        content:
          "AI-powered web threat detection and digital trust intelligence. Inspect domains with real-time TLS handshake analysis, eMudhra weak-key auditing, and Gemini AI threat synthesis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WelcomePage,
});

export default function WelcomePage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-foreground hover:text-primary transition-colors"
          >
            <span className="grid size-8 place-items-center border border-primary/30 bg-primary/10 text-primary">
              <ShieldCheck size={18} strokeWidth={2} />
            </span>
            <span>
              TrustGuard <span className="text-primary font-normal">AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAuthModalOpen(true)}
              className="h-9 px-3.5 rounded-none border-border text-xs font-mono text-muted-foreground hover:text-foreground"
            >
              <LogIn size={13} className="mr-1.5" />
              Sign In
            </Button>
            <Link to="/dashboard">
              <Button
                size="sm"
                className="h-9 px-4 rounded-none bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90"
              >
                Launch Dashboard
                <ArrowRight size={13} className="ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 py-12 md:py-20 space-y-24">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.12em] text-primary">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              Trust Intelligence Platform v2.4 · Threat Sensing Active
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
              AI-Powered Web Threat Detection & Digital Trust Intelligence
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
              Conduct high-fidelity domain security audits. Probe live TLS handshakes, audit eMudhra
              weak-key generation vulnerabilities, inspect HTTP security headers, and synthesize
              forensic threat intelligence with Gemini 3.8 Flash.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link to="/dashboard">
                <Button className="w-full sm:w-auto h-11 px-6 rounded-none bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 shadow-[0_0_24px_rgba(45,212,191,0.25)]">
                  Continue as Guest
                  <ArrowRight size={15} className="ml-2" />
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setAuthModalOpen(true)}
                className="h-11 px-6 rounded-none border-border bg-card text-foreground font-mono text-xs hover:border-primary/50"
              >
                <LogIn size={14} className="mr-2 text-primary" />
                Sign In with Firebase
              </Button>
            </div>

            {/* Key Assurance Badges */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-border text-xs text-muted-foreground font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-primary shrink-0" />
                <span>Zero Installation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-primary shrink-0" />
                <span>Guest-Ready Dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-primary shrink-0" />
                <span>Real-Time TLS Probing</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="lg:col-span-5">
            <div className="relative border border-border bg-card overflow-hidden shadow-2xl group">
              <div className="absolute top-0 inset-x-0 h-8 bg-secondary/80 border-b border-border flex items-center justify-between px-3 z-10">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-danger/80" />
                  <span className="size-2 rounded-full bg-warning/80" />
                  <span className="size-2 rounded-full bg-success/80" />
                  <span className="text-[10px] font-mono text-muted-foreground ml-2">
                    trustguard-sensor.bin
                  </span>
                </div>
                <span className="text-[10px] font-mono text-primary flex items-center gap-1">
                  <span className="size-1 rounded-full bg-primary animate-ping" />
                  ONLINE
                </span>
              </div>

              <div className="pt-8 overflow-hidden aspect-[4/3] relative">
                <img
                  src={welcomeHeroImage}
                  alt="TrustGuard Cyber Intelligence Lab"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />

                <div className="absolute bottom-3 left-3 right-3 p-3 bg-background/90 backdrop-blur-md border border-border text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-primary font-semibold">Active Sensor Suite</span>
                    <span className="text-muted-foreground">TLS 1.3 / Port 443</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Deep socket auditing detects weak keys, expired certificates, and malicious
                    infrastructure in real time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Capabilities Grid */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-[0.12em] text-primary">
              Core Forensic Engines
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Comprehensive Defense Architecture
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Every layer of trust verification runs concurrently to deliver actionable threat
              verdicts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="border border-border bg-card p-6 space-y-3">
              <div className="size-10 grid place-items-center border border-primary/30 bg-primary/10 text-primary">
                <LockKeyhole size={20} />
              </div>
              <h3 className="text-base font-semibold text-foreground">Live TLS & X.509 Probing</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connects directly to remote port 443, extracts public modulus, verifies SAN lists,
                validates cipher suites, and checks expiration telemetry.
              </p>
            </div>

            <div className="border border-border bg-card p-6 space-y-3">
              <div className="size-10 grid place-items-center border border-danger/30 bg-danger/10 text-danger">
                <KeyRound size={20} />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                eMudhra CA Weak Key Auditing
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Scans for known vulnerable prime generation patterns and flawed RNG implementations
                associated with compromised certificate authorities.
              </p>
            </div>

            <div className="border border-border bg-card p-6 space-y-3">
              <div className="size-10 grid place-items-center border border-primary/30 bg-primary/10 text-primary">
                <Sparkles size={20} />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Gemini 3.8 Flash AI Synthesis
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Analyzes multi-dimensional telemetry, outputs a calculated Trust Score (0–100), maps
                primary attack vectors, and drafts analyst notes.
              </p>
            </div>

            <div className="border border-border bg-card p-6 space-y-3">
              <div className="size-10 grid place-items-center border border-warning/30 bg-warning/10 text-warning">
                <ShieldAlert size={20} />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Security Headers Inspection
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Evaluates Strict-Transport-Security (HSTS), Content-Security-Policy (CSP),
                X-Frame-Options, and referrer configurations.
              </p>
            </div>

            <div className="border border-border bg-card p-6 space-y-3">
              <div className="size-10 grid place-items-center border border-primary/30 bg-primary/10 text-primary">
                <Users size={20} />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Community Threat Intelligence
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Crowdsourced registry of active phishing domains, credential-theft kits, and malware
                hosts. Upvote verified indicators of compromise.
              </p>
            </div>

            <div className="border border-border bg-card p-6 space-y-3">
              <div className="size-10 grid place-items-center border border-primary/30 bg-primary/10 text-primary">
                <Terminal size={20} />
              </div>
              <h3 className="text-base font-semibold text-foreground">Browser Extension Suite</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Provides ready-to-load Manifest V3 source snippets for real-time background
                telemetry and automatic badge warnings.
              </p>
            </div>
          </div>
        </section>

        {/* Access Options Callout */}
        <section className="border border-border bg-card p-8 lg:p-12 relative overflow-hidden">
          <div className="max-w-2xl space-y-4">
            <div className="text-[11px] font-mono uppercase tracking-[0.12em] text-primary">
              Immediate Access
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Start Investigating Suspicious Domains Now
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Explore the full diagnostic workspace as a guest with instant access to single-domain
              probing, bulk URL auditing, and trust trend surveillance.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/dashboard">
                <Button className="h-10 px-5 rounded-none bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90">
                  Launch Guest Dashboard
                  <ArrowRight size={13} className="ml-1.5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setAuthModalOpen(true)}
                className="h-10 px-5 rounded-none border-border bg-background text-xs font-mono text-muted-foreground hover:text-foreground"
              >
                Sign In for Full Community Access
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-8 text-xs text-muted-foreground">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">TrustGuard AI</span>
            <span>·</span>
            <span>Digital Trust Intelligence Network</span>
          </div>
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <Link to="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="hover:text-foreground transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </footer>

      {/* Sign-In Placeholder Modal */}
      {authModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setAuthModalOpen(false);
          }}
        >
          <div className="w-full max-w-md border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Sign In to TrustGuard AI
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sign-in is reserved for verified threat analysts.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAuthModalOpen(false)}
                className="size-8 -mr-2 -mt-2 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </Button>
            </div>

            <div className="p-4 border border-warning/30 bg-warning/10 text-xs space-y-2 text-warning">
              <div className="font-semibold flex items-center gap-1.5">
                <ShieldAlert size={15} />
                <span>Identity Verification Notice</span>
              </div>
              <p className="text-[11px] leading-relaxed text-foreground/80">
                To prevent spam and spoofed IOC submissions, community reports and upvoting require
                verified authentication. Firebase Authentication can be connected to enable Google
                Sign-In and analyst roles.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                disabled
                className="w-full rounded-none border border-border bg-secondary/50 text-muted-foreground text-xs font-mono h-10 cursor-not-allowed"
                title="Firebase Authentication setup required"
              >
                Sign In with Google (Awaiting Firebase Setup)
              </Button>

              <Link to="/dashboard" onClick={() => setAuthModalOpen(false)}>
                <Button className="w-full rounded-none bg-primary text-primary-foreground font-semibold text-xs h-10 hover:bg-primary/90">
                  Continue as Guest to Dashboard
                  <ArrowRight size={13} className="ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
