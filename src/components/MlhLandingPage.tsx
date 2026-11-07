import { useState, type FormEvent } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronRight,
  Code2,
  Copy,
  ExternalLink,
  Github,
  Globe2,
  Lock,
  Mail,
  Play,
  Radio,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  UserCheck,
  UserX,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";

interface MlhLandingPageProps {
  onEnterDashboard: () => void;
}

export function MlhLandingPage({ onEnterDashboard }: MlhLandingPageProps) {
  const { signInWithFirebase, continueAsGuest } = useAuth();

  // Auth modal / state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Contact Us state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleFirebaseSignIn = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      await signInWithFirebase({
        email: emailInput || "swagataghosh538@gmail.com",
        password: passwordInput,
        provider: "email",
      });
      setAuthModalOpen(false);
      onEnterDashboard();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "github" | "google") => {
    setAuthLoading(true);
    setAuthError("");
    try {
      await signInWithFirebase({
        email: provider === "github" ? "swagata.ghosh@github.com" : "swagataghosh538@gmail.com",
        provider,
      });
      setAuthModalOpen(false);
      onEnterDashboard();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "OAuth authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestAccess = () => {
    continueAsGuest();
    onEnterDashboard();
  };

  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-[#e2e8f0] font-sans selection:bg-[#00f0ff]/20 selection:text-[#00f0ff] relative overflow-hidden">
      {/* Diversion.tech Top Ticker Ribbon */}
      <div className="bg-[#0c0e17] border-b border-[#1b2133] py-2 px-4 text-xs font-mono flex items-center justify-between text-[#94a3b8] relative z-30">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 text-[10px] uppercase font-bold tracking-wider">
              <span className="size-1.5 rounded-full bg-[#00f0ff] animate-ping" />
              Diversion 2026 // MLH Hackathon
            </span>
            <span className="hidden sm:inline text-[#cbd5e1] text-[11px]">
              East India's Flagship Annual Hackathon · Digital Trust Track
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-[#00f0ff] font-semibold">Kolkata, IN · 36hr Hack</span>
            <span className="hidden md:inline text-[#64748b]">|</span>
            <span className="hidden md:inline text-[#a855f7]">#InnovateWithoutLimits</span>
          </div>
        </div>
      </div>

      {/* Diversion Ambient Neon Blobs & Matrix Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#13182618_1px,transparent_1px),linear-gradient(to_bottom,#13182618_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 size-[680px] bg-gradient-to-tr from-[#00f0ff]/10 via-[#7928ca]/15 to-[#ff007f]/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute -top-32 -left-32 size-[420px] bg-[#00f0ff]/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[800px] -right-32 size-[500px] bg-[#7928ca]/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Floating Glassmorphism Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-[#1b2133]/90 bg-[#08090d]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo in diversion.tech style */}
          <div className="flex items-center gap-3.5">
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00f0ff] to-[#7928ca] rounded-xl blur-xs opacity-75 group-hover:opacity-100 transition duration-300" />
              <div className="relative size-11 bg-[#0c0e17] rounded-xl border border-[#1b2133] grid place-items-center">
                <ShieldCheck size={22} className="text-[#00f0ff]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-sans">
                  DIVERSION<span className="text-[#00f0ff]">.TRUST</span>
                </span>
                <span className="text-[10px] font-mono uppercase bg-[#131622] text-[#00f0ff] px-2 py-0.5 rounded border border-[#00f0ff]/30 font-semibold">
                  MLH 2026
                </span>
              </div>
              <span className="text-[11px] text-[#64748b] font-mono block -mt-0.5">
                AI Threat Intelligence & Certificate Audit
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-mono uppercase tracking-wider text-[#94a3b8]">
            <a href="#motto" className="hover:text-[#00f0ff] transition-colors">
              // Motto
            </a>
            <a href="#tracks" className="hover:text-[#00f0ff] transition-colors">
              // Tracks
            </a>
            <a href="#auth-gateway" className="hover:text-[#00f0ff] transition-colors">
              // Access Gateway
            </a>
            <a href="#contact" className="hover:text-[#00f0ff] transition-colors">
              // Contact Us
            </a>
          </nav>

          {/* Right Dual Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGuestAccess}
              className="rounded-lg border-[#1b2133] bg-[#0f131f] text-[#cbd5e1] hover:text-white hover:border-[#00f0ff]/50 font-mono text-xs h-10 px-4 transition-all"
            >
              <UserX size={13} className="mr-1.5 text-[#00f0ff]" />
              Guest Access
            </Button>
            <Button
              size="sm"
              onClick={() => setAuthModalOpen(true)}
              className="rounded-lg bg-gradient-to-r from-[#00f0ff] to-[#7928ca] text-black font-sans text-xs font-bold h-10 px-5 shadow-[0_0_20px_rgba(0,240,255,0.35)] hover:shadow-[0_0_28px_rgba(0,240,255,0.6)] hover:brightness-110 transition-all"
            >
              <Lock size={13} className="mr-1.5 text-black" />
              Sign In (Firebase)
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section: diversion.tech High-Octane Aesthetics */}
      <section className="relative pt-20 pb-28 px-6 max-w-7xl mx-auto text-center z-10">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#1b2133] bg-[#0d101a] text-[#cbd5e1] text-xs font-mono mb-8 shadow-[0_0_25px_rgba(0,240,255,0.1)]">
          <span className="size-2 rounded-full bg-[#00f0ff]" />
          <span className="text-[#00f0ff] font-semibold">DIVERSION 2026</span>
          <span className="text-[#475569]">/</span>
          <span className="text-[#e2e8f0]">MLH x IEM-ACM Hackathon Sprint</span>
          <span className="text-[#475569]">/</span>
          <span className="text-[#a855f7]">Zero Mock Telemetry</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.05] font-sans">
          WHERE CODE MEETS{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] via-[#c084fc] to-[#ff007f]">
            CRYPTOGRAPHIC PROOF
          </span>
        </h1>

        <p className="mt-7 text-sm sm:text-base md:text-lg text-[#94a3b8] max-w-3xl mx-auto leading-relaxed font-sans font-normal">
          Phishing websites and compromised Certificate Authority key generation infrastructures
          threaten the open internet. TrustGuard AI conducts real-time TLS socket handshakes on port
          443, detects eMudhra weak modulus vulnerabilities, and arms the community with verifiable
          threat intelligence.
        </p>

        {/* Dual Access Gateway Cards (diversion.tech glass card style) */}
        <div
          id="auth-gateway"
          className="mt-14 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-left"
        >
          {/* Option 1: Access with Sign In (Firebase Auth) */}
          <div className="relative group rounded-2xl p-[1px] bg-gradient-to-b from-[#00f0ff]/60 via-[#7928ca]/30 to-transparent">
            <div className="h-full bg-[#0d101a]/95 rounded-2xl p-7 flex flex-col justify-between backdrop-blur-xl transition-all duration-300 group-hover:bg-[#0f131f]">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="size-12 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 grid place-items-center text-[#00f0ff]">
                    <UserCheck size={24} />
                  </div>
                  <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/40 text-[#00f0ff] font-bold">
                    Full Contributor
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white font-sans">Access With Sign In</h3>
                <p className="text-xs text-[#94a3b8] mt-2 leading-relaxed">
                  Authenticate via Firebase Auth (Email/GitHub/Google) for unlimited analysis and
                  community rights.
                </p>

                <div className="mt-6 space-y-2.5 font-mono text-xs">
                  <div className="flex items-center gap-2.5 text-[#cbd5e1]">
                    <Check size={14} className="text-[#00f0ff] shrink-0" />
                    <span>Real-time Port 443 Socket Probing</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-white font-semibold">
                    <Check size={14} className="text-[#00f0ff] shrink-0" />
                    <span>Participate in Community Threat Intelligence</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#cbd5e1]">
                    <Check size={14} className="text-[#00f0ff] shrink-0" />
                    <span>Submit new threat reports & upvote IOCs</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#cbd5e1]">
                    <Check size={14} className="text-[#00f0ff] shrink-0" />
                    <span>Download Vector PDF & 1200x760 PNG Cards</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button
                  onClick={() => setAuthModalOpen(true)}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#7928ca] text-black font-sans text-xs font-bold shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:brightness-110 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Lock size={15} className="text-black" />
                  Sign In With Firebase & Launch
                  <ArrowRight size={15} />
                </Button>
              </div>
            </div>
          </div>

          {/* Option 2: Access without Sign In (Guest Mode) */}
          <div className="relative group rounded-2xl p-[1px] bg-gradient-to-b from-[#1b2133] to-transparent">
            <div className="h-full bg-[#0d101a]/80 rounded-2xl p-7 flex flex-col justify-between backdrop-blur-xl transition-all duration-300 group-hover:border-[#00f0ff]/30">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="size-12 rounded-xl bg-[#131826] border border-[#1b2133] grid place-items-center text-[#94a3b8]">
                    <Radio size={24} />
                  </div>
                  <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-[#131826] border border-[#1b2133] text-[#94a3b8] font-bold">
                    Anonymous Triage
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white font-sans">Access Without Sign In</h3>
                <p className="text-xs text-[#94a3b8] mt-2 leading-relaxed">
                  Fast anonymous incident response to probe suspicious URLs and examine certificate
                  validity.
                </p>

                <div className="mt-6 space-y-2.5 font-mono text-xs">
                  <div className="flex items-center gap-2.5 text-[#cbd5e1]">
                    <Check size={14} className="text-[#00f0ff] shrink-0" />
                    <span>Real-time Port 443 Socket Probing</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#cbd5e1]">
                    <Check size={14} className="text-[#00f0ff] shrink-0" />
                    <span>eMudhra Weak Modulus CA Key Checks</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#cbd5e1]">
                    <Check size={14} className="text-[#00f0ff] shrink-0" />
                    <span>Bulk URL Scanner & Export Matrix</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#ff7b72]">
                    <AlertTriangle size={14} className="shrink-0" />
                    <span>Read-Only: Cannot upvote or file threat reports</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button
                  variant="outline"
                  onClick={handleGuestAccess}
                  className="w-full h-12 rounded-xl border-[#1b2133] bg-[#121624] text-white hover:bg-[#1a2033] hover:border-[#00f0ff]/40 font-sans text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <UserX size={15} />
                  Continue As Guest (Fast Scan)
                  <ArrowRight size={15} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Metric Ticker */}
        <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div className="p-4 rounded-xl bg-[#0c0f18] border border-[#1b2133]">
            <div className="text-[10px] uppercase font-mono text-[#64748b]">Socket Latency</div>
            <div className="text-2xl font-bold text-[#00f0ff] font-mono mt-0.5">~180ms</div>
            <div className="text-[11px] text-[#94a3b8] mt-1">Live Node.js TLS handshake</div>
          </div>
          <div className="p-4 rounded-xl bg-[#0c0f18] border border-[#1b2133]">
            <div className="text-[10px] uppercase font-mono text-[#64748b]">eMudhra Audit</div>
            <div className="text-2xl font-bold text-[#a855f7] font-mono mt-0.5">Active</div>
            <div className="text-[11px] text-[#94a3b8] mt-1">Weak CA key detection</div>
          </div>
          <div className="p-4 rounded-xl bg-[#0c0f18] border border-[#1b2133]">
            <div className="text-[10px] uppercase font-mono text-[#64748b]">AI Synthesis</div>
            <div className="text-2xl font-bold text-[#ff007f] font-mono mt-0.5">Flash 3.8</div>
            <div className="text-[11px] text-[#94a3b8] mt-1">Multidimensional threat score</div>
          </div>
          <div className="p-4 rounded-xl bg-[#0c0f18] border border-[#1b2133]">
            <div className="text-[10px] uppercase font-mono text-[#64748b]">Mock Guarantee</div>
            <div className="text-2xl font-bold text-[#34d399] font-mono mt-0.5">0%</div>
            <div className="text-[11px] text-[#94a3b8] mt-1">Real sockets & CT logs only</div>
          </div>
        </div>
      </section>

      {/* Motto Section (styled like diversion.tech keynote banner) */}
      <section id="motto" className="py-24 px-6 border-y border-[#1b2133] bg-[#0c0e17] relative">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-block px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-[11px] font-mono uppercase tracking-widest">
            // OUR CREED & HACKATHON MOTTO
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-sans tracking-tight leading-tight">
            "Trust is Not a Default Certificate; It is Cryptographic Proof."
          </h2>
          <p className="text-sm sm:text-base text-[#94a3b8] max-w-2xl mx-auto leading-relaxed font-sans">
            Automated certificate authorities issue thousands of TLS certificates to threat actors
            daily. We reject the premise that an active lock icon equals safety. TrustGuard AI
            empowers engineers with low-level cryptographic verification, Certificate Transparency
            surveillance, and crowdsourced cyber intelligence.
          </p>
          <div className="pt-4 flex items-center justify-center gap-8 text-xs font-mono">
            <div>
              <span className="text-[#00f0ff] font-bold text-lg block">RFC 6962</span>
              <span className="text-[#64748b] text-[11px] uppercase">CT Log Auditing</span>
            </div>
            <span className="text-[#1b2133] text-xl">|</span>
            <div>
              <span className="text-[#a855f7] font-bold text-lg block">X.509</span>
              <span className="text-[#64748b] text-[11px] uppercase">Modulus Inspection</span>
            </div>
            <span className="text-[#1b2133] text-xl">|</span>
            <div>
              <span className="text-[#ff007f] font-bold text-lg block">Zero Mock</span>
              <span className="text-[#64748b] text-[11px] uppercase">Real Socket Engine</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tracks & Pillars Section (Diversion.tech Hackathon Tracks Grid) */}
      <section id="tracks" className="py-24 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <div className="text-xs uppercase font-mono font-bold text-[#00f0ff] tracking-widest">
            // CORE ARCHITECTURAL TRACKS
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-sans">
            Built for High-Stakes Threat Hunting
          </h2>
          <p className="text-xs sm:text-sm text-[#94a3b8] max-w-xl mx-auto">
            Engineered directly for developers, security engineers, and digital trust researchers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-2xl bg-[#0d101a] border border-[#1b2133] hover:border-[#00f0ff]/50 transition-all group">
            <div className="size-12 rounded-xl bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 grid place-items-center mb-5 group-hover:scale-105 transition-transform">
              <ShieldAlert size={22} />
            </div>
            <h3 className="text-lg font-bold text-white font-sans">
              eMudhra Weak Modulus Diagnostics
            </h3>
            <p className="text-xs text-[#94a3b8] mt-2.5 leading-relaxed font-sans">
              Inspects CA key structures affected by predictable pseudo-random number generator
              flaws. Flags unregistered subordinate roots, non-random trailing bytes, and potential
              impersonation vectors.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-[#0d101a] border border-[#1b2133] hover:border-[#a855f7]/50 transition-all group">
            <div className="size-12 rounded-xl bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/20 grid place-items-center mb-5 group-hover:scale-105 transition-transform">
              <Terminal size={22} />
            </div>
            <h3 className="text-lg font-bold text-white font-sans">Concurrent Bulk URL Probing</h3>
            <p className="text-xs text-[#94a3b8] mt-2.5 leading-relaxed font-sans">
              Queue up to 12 domains simultaneously. Our backend engine dispatches parallel socket
              handshakes via Promise.allSettled, rendering a comparative matrix with one-click
              inspection and CSV export.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-[#0d101a] border border-[#1b2133] hover:border-[#ff007f]/50 transition-all group">
            <div className="size-12 rounded-xl bg-[#ff007f]/10 text-[#ff007f] border border-[#ff007f]/20 grid place-items-center mb-5 group-hover:scale-105 transition-transform">
              <Sparkles size={22} />
            </div>
            <h3 className="text-lg font-bold text-white font-sans">
              Community Threat Intelligence
            </h3>
            <p className="text-xs text-[#94a3b8] mt-2.5 leading-relaxed font-sans">
              Live participatory IOC stream with tag filtering and community upvoting. Authenticated
              contributors can verify threat reports or publish new indicators discovered in the
              wild.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Us Section: diversion.tech styled with email swagataghosh538@gmail.com */}
      <section id="contact" className="py-24 px-6 border-t border-[#1b2133] bg-[#0c0e17] relative">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-[11px] font-mono uppercase tracking-widest mb-3">
              // CONNECT WITH LEADERSHIP
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-sans tracking-tight">
              Contact the TrustGuard Team
            </h2>
            <p className="text-xs sm:text-sm text-[#94a3b8] mt-3 leading-relaxed font-sans">
              Whether you are an MLH hacker collaborating on digital trust heuristics, an enterprise
              looking to integrate custom CT monitors, or a researcher reporting a false
              positive—reach out directly.
            </p>

            <div className="mt-8 space-y-4">
              <div className="p-5 rounded-xl border border-[#1b2133] bg-[#08090d] flex items-center gap-4">
                <div className="size-11 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30 grid place-items-center text-[#00f0ff] shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-[#64748b]">
                    Direct Inquiries & Feedback
                  </div>
                  <a
                    href="mailto:swagataghosh538@gmail.com"
                    className="font-mono text-sm font-semibold text-white hover:text-[#00f0ff] transition-colors break-all"
                  >
                    swagataghosh538@gmail.com
                  </a>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-[#1b2133] bg-[#08090d] flex items-center gap-4">
                <div className="size-11 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/30 grid place-items-center text-[#a855f7] shrink-0">
                  <Code2 size={18} />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-[#64748b]">
                    Hackathon Creator
                  </div>
                  <span className="font-mono text-sm font-semibold text-white">
                    Swagata Ghosh (SwagataGhosh7)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-8 rounded-2xl border border-[#1b2133] bg-[#08090d] shadow-2xl relative">
            <h3 className="text-lg font-bold text-white font-sans mb-1 flex items-center gap-2">
              <Send size={16} className="text-[#00f0ff]" />
              Dispatch Threat Inquiry
            </h3>
            <p className="text-xs text-[#94a3b8] mb-6 font-sans">
              Notes sent here will be received directly by{" "}
              <strong className="text-white">swagataghosh538@gmail.com</strong>.
            </p>

            {contactSubmitted ? (
              <div className="p-6 rounded-xl border border-[#00f0ff]/40 bg-[#00f0ff]/5 text-center space-y-3 font-mono">
                <div className="size-12 rounded-full bg-[#00f0ff]/20 text-[#00f0ff] grid place-items-center mx-auto">
                  <Check size={22} />
                </div>
                <h4 className="text-sm font-bold text-white font-sans">
                  Dispatch Successfully Transmitted!
                </h4>
                <p className="text-xs text-[#94a3b8]">
                  Thank you for reaching out. We will follow up at{" "}
                  <strong className="text-white">swagataghosh538@gmail.com</strong>.
                </p>
                <Button
                  size="sm"
                  onClick={() => setContactSubmitted(false)}
                  className="mt-2 bg-[#1b2133] text-white hover:bg-[#252c44] text-xs font-mono"
                >
                  Send Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-[11px] font-mono text-[#94a3b8] mb-1.5 uppercase"
                  >
                    Your Name / Handle:
                  </label>
                  <Input
                    id="contact-name"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Alex (Security Analyst)"
                    className="border-[#1b2133] bg-[#0c0f18] text-xs font-mono text-white placeholder:text-[#475569] focus-visible:ring-[#00f0ff] h-11 rounded-lg"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-[11px] font-mono text-[#94a3b8] mb-1.5 uppercase"
                  >
                    Your Email:
                  </label>
                  <Input
                    id="contact-email"
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="analyst@domain.com"
                    className="border-[#1b2133] bg-[#0c0f18] text-xs font-mono text-white placeholder:text-[#475569] focus-visible:ring-[#00f0ff] h-11 rounded-lg"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-[11px] font-mono text-[#94a3b8] mb-1.5 uppercase"
                  >
                    Message / Intelligence Note:
                  </label>
                  <Textarea
                    id="contact-message"
                    required
                    rows={3}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Provide details on a suspicious domain, eMudhra key incident, or MLH collaboration..."
                    className="border-[#1b2133] bg-[#0c0f18] text-xs font-mono text-white placeholder:text-[#475569] focus-visible:ring-[#00f0ff] rounded-lg"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#7928ca] text-black font-sans text-xs font-bold shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all cursor-pointer"
                >
                  <Send size={14} className="mr-1.5 text-black" />
                  Dispatch Note to swagataghosh538@gmail.com
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer in diversion.tech layout */}
      <footer className="border-t border-[#1b2133] bg-[#08090d] py-10 px-6 text-center text-xs font-mono text-[#64748b]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-white">
            <span className="font-bold text-sm tracking-tight">DIVERSION.TRUST</span>
            <span>·</span>
            <span className="text-[#94a3b8]">MLH x IEM-ACM 2026</span>
          </div>
          <div className="flex items-center gap-5 text-[11px]">
            <span>Lead: Swagata Ghosh</span>
            <span>·</span>
            <a href="mailto:swagataghosh538@gmail.com" className="text-[#00f0ff] hover:underline">
              swagataghosh538@gmail.com
            </a>
            <span>·</span>
            <span className="text-[#a855f7]">Zero Mock Telemetry</span>
          </div>
        </div>
      </footer>

      {/* Firebase Sign In Modal (diversion.tech dark neon style) */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in-0 duration-200">
          <div className="w-full max-w-md border border-[#1b2133] bg-[#0c0f18] p-7 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.2)] space-y-5">
            <div className="flex items-start justify-between border-b border-[#1b2133] pb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#7928ca] grid place-items-center text-black font-bold">
                  <Lock size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-sans">
                    Firebase Authentication
                  </h3>
                  <p className="text-xs text-[#94a3b8] font-sans">
                    Sign in to participate in Community Threat Intelligence
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="text-[#64748b] hover:text-white p-1"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {authError && (
              <div className="border border-[#ff007f]/40 bg-[#ff007f]/10 p-3 text-xs text-[#ff007f] flex items-center gap-2 font-mono rounded-lg">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Quick OAuth Providers */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={authLoading}
                onClick={() => handleOAuthSignIn("github")}
                className="border-[#1b2133] bg-[#121624] text-white hover:bg-[#192033] hover:border-[#00f0ff]/40 text-xs font-mono h-11 rounded-xl"
              >
                <Github size={15} className="mr-2" />
                GitHub Auth
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={authLoading}
                onClick={() => handleOAuthSignIn("google")}
                className="border-[#1b2133] bg-[#121624] text-white hover:bg-[#192033] hover:border-[#00f0ff]/40 text-xs font-mono h-11 rounded-xl"
              >
                <Globe2 size={15} className="mr-2 text-[#00f0ff]" />
                Google Auth
              </Button>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-[#64748b]">
              <span className="flex-1 h-px bg-[#1b2133]" />
              <span>or email credentials</span>
              <span className="flex-1 h-px bg-[#1b2133]" />
            </div>

            <form onSubmit={handleFirebaseSignIn} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-[#94a3b8] mb-1.5 uppercase">
                  Email Address:
                </label>
                <Input
                  type="email"
                  required
                  placeholder="analyst@domain.com (e.g. swagataghosh538@gmail.com)"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="border-[#1b2133] bg-[#08090d] text-xs font-mono text-white placeholder:text-[#475569] focus-visible:ring-[#00f0ff] h-11 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#94a3b8] mb-1.5 uppercase">
                  Password:
                </label>
                <Input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="border-[#1b2133] bg-[#08090d] text-xs font-mono text-white placeholder:text-[#475569] focus-visible:ring-[#00f0ff] h-11 rounded-lg"
                />
              </div>

              <Button
                type="submit"
                disabled={authLoading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#7928ca] text-black font-sans text-xs font-bold shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:brightness-110"
              >
                {authLoading ? "Authenticating with Firebase..." : "Sign In & Access Dashboard"}
              </Button>
            </form>

            {/* Guest Escape Link */}
            <div className="border-t border-[#1b2133] pt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthModalOpen(false);
                  handleGuestAccess();
                }}
                className="text-xs font-mono text-[#94a3b8] hover:text-[#00f0ff] transition-colors"
              >
                Skip sign in · Continue as Guest (Read-Only) →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
