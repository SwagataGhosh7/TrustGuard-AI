import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Globe2,
  Instagram,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Radio,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Zap,
} from "lucide-react";

import welcomeBgImage from "@/assets/trustguard-welcome.jpg";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TrustGuard AI // Collaborative Threat Intelligence" },
      {
        name: "description",
        content:
          "AI-powered web threat detection and digital trust intelligence. Authenticate with Firebase for full Community Threat Intelligence or explore as a guest.",
      },
      {
        property: "og:title",
        content: "TrustGuard AI // Collaborative Threat Intelligence",
      },
      {
        property: "og:description",
        content:
          "AI-powered web threat detection and digital trust intelligence. Authenticate with Firebase for full Community Threat Intelligence or explore as a guest.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WelcomePage,
});

// Crisp pixel art Space Invader alien (8-bit)
function PixelAlien({
  className = "size-5",
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

function CyberEye({
  className = "size-8",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="32" cy="32" r="24" fill="none" stroke="#2dd4bf" strokeWidth="3" />
      <path
        d="M13 32c7-13 31-13 38 0-7 13-31 13-38 0Z"
        fill="none"
        stroke="#a3e635"
        strokeWidth="4"
      />
      <circle cx="32" cy="32" r="8" fill="#ff6b35" />
      <circle cx="32" cy="32" r="3" fill="#080b10" />
      <path d="M32 8v7M32 49v7M8 32h7M49 32h7" stroke="#2dd4bf" strokeWidth="2" />
    </svg>
  );
}

export default function WelcomePage() {
  const navigate = useNavigate();
  const { user, loading, signIn, signOut, continueAsGuest } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsSigningIn(true);
    try {
      const loggedUser = await signIn();
      if (loggedUser) {
        navigate({ to: "/dashboard" });
      }
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? String(err.code) : "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        return;
      }
      if (code === "auth/popup-blocked") {
        setAuthError(
          "The Google sign-in popup was blocked by your browser. Please allow popups or continue as Guest.",
        );
      } else {
        const msg = err instanceof Error ? err.message : "Authentication cancelled or failed";
        setAuthError(msg);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGuestAccess = () => {
    continueAsGuest();
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-[#070a0e] text-[#e2e8f0] font-sans antialiased relative overflow-x-hidden selection:bg-[#ff6b35]/30 selection:text-[#ff8a00]">
      {/* Background visual texture with high-contrast vignette */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 bg-cover bg-center mix-blend-luminosity scale-105 filter blur-[1px]"
        style={{ backgroundImage: `url(${welcomeBgImage})` }}
      />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-[#070a0e]/80 via-[#070a0e]/95 to-[#070a0e]" />
      <div
        className="fixed inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage:
            "radial-gradient(#ff6b35 1px, transparent 1px), radial-gradient(#2dd4bf 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          backgroundPosition: "0 0, 16px 16px",
        }}
      />

      {/* Retro MLH / Hacktoberfest Top Bar */}
      <header className="relative z-30 border-b border-[#222f3e] bg-[#0c1017]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-8">
          {/* Brand Logo & Pixel Shield */}
          <div className="flex items-center gap-3">
            <div className="relative p-1.5 bg-[#121924] border-2 border-[#a3e635] shadow-[0_0_12px_rgba(163,230,53,0.35)]">
              <CyberEye className="size-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-arcade text-xs sm:text-sm text-[#ff6b35] tracking-wider uppercase">
                  TRUSTGUARD
                </span>
                <span className="font-pixel text-[10px] px-1.5 py-0.5 bg-[#a3e635] text-[#080b10] font-bold uppercase tracking-tight">
                  GEMINI 3.8 FLASH POWERED
                </span>
              </div>
              <p className="text-[10px] font-mono text-[#64748b] tracking-wider uppercase hidden sm:block">
                Digital Trust Intelligence & Web Threat Defense
              </p>
            </div>
          </div>

          {/* User Auth Status Bar */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2.5 bg-[#121924] border border-[#2dd4bf]/40 px-3 py-1.5 font-mono text-xs">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={`${user.displayName || "Analyst"} profile`}
                    className="size-7 rounded-full border border-[#2dd4bf]/60 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    aria-label={`${user.displayName || "Analyst"} profile`}
                    className="flex size-7 items-center justify-center rounded-full border border-[#2dd4bf]/60 bg-[#2dd4bf]/15 text-xs font-bold text-[#2dd4bf]"
                  >
                    {(user.displayName || user.email || "A").charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="size-2 rounded-full bg-[#2dd4bf] animate-ping" />
                <span className="text-[#2dd4bf] font-semibold truncate max-w-[140px]">
                  {user.displayName || user.email}
                </span>
                <button
                  type="button"
                  onClick={signOut}
                  className="text-[#94a3b8] hover:text-[#ff6b35] transition-colors ml-1"
                  title="Sign Out"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#94a3b8]">
                <span className="size-2 rounded-full bg-[#ff6b35]" />
                <span className="hidden sm:inline">AUTHENTICATION PENDING</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Hacktoberfest / Hacker Desk Command Viewport */}
      <main className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-8 py-8 lg:py-14 space-y-12">
        {/* Floating Physical Sticky Notes Inspired by Image */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
          {/* Yellow Padlock Post-It */}
          <div className="bg-[#fef08a] text-[#0a0e14] p-3 shadow-lg border border-[#eab308] rotate-[-2deg] transition-transform hover:rotate-0 hover:scale-105">
            <div className="flex items-center justify-between pb-1 border-b border-[#0a0e14]/20">
              <span className="font-pixel text-[10px] font-bold uppercase tracking-wider">
                TLS 1.3
              </span>
              <Lock size={13} strokeWidth={2.5} />
            </div>
            <p className="font-mono text-[10px] font-medium leading-tight mt-1.5">
              Port 443 socket & X.509 raw modulus audit
            </p>
          </div>

          {/* Orange/Red Space Invader Sticker */}
          <div className="bg-[#ff4d4d] text-[#ffffff] p-3 shadow-lg border border-[#dc2626] rotate-[2deg] transition-transform hover:rotate-0 hover:scale-105">
            <div className="flex items-center justify-between pb-1 border-b border-[#ffffff]/20">
              <span className="font-pixel text-[10px] font-bold uppercase tracking-wider">
                WEAK CA
              </span>
              <PixelAlien className="size-4 text-white" />
            </div>
            <p className="font-mono text-[10px] font-medium leading-tight mt-1.5 text-white/95">
              eMudhra flaw & common prime sensor
            </p>
          </div>

          {/* Cyan Wireframe Globe Sticker */}
          <div className="bg-[#00f0ff] text-[#070b12] p-3 shadow-lg border border-[#00c4d4] rotate-[-1deg] transition-transform hover:rotate-0 hover:scale-105">
            <div className="flex items-center justify-between pb-1 border-b border-[#070b12]/20">
              <span className="font-pixel text-[10px] font-bold uppercase tracking-wider">
                CT LOGS
              </span>
              <Globe2 size={13} strokeWidth={2.5} />
            </div>
            <p className="font-mono text-[10px] font-medium leading-tight mt-1.5">
              Transparency cert surveillance
            </p>
          </div>

          {/* Electric Lime MLH Badge */}
          <div className="bg-[#a3e635] text-[#070b12] p-3 shadow-lg border border-[#84cc16] rotate-[3deg] transition-transform hover:rotate-0 hover:scale-105">
            <div className="flex items-center justify-between pb-1 border-b border-[#070b12]/20">
              <span className="font-pixel text-[10px] font-bold uppercase tracking-wider">
                GEMINI AI
              </span>
              <Zap size={13} strokeWidth={2.5} />
            </div>
            <p className="font-mono text-[10px] font-medium leading-tight mt-1.5">
              Flash threat scoring & IOC vectors
            </p>
          </div>
        </div>

        {/* Central Hacker Terminal Station (Modeled after the laptop in trustguard-welcome.jpg) */}
        <div className="max-w-5xl mx-auto border-2 border-[#243346] bg-[#0c1017] shadow-[0_0_50px_rgba(0,0,0,0.85)] relative overflow-hidden">
          {/* Terminal Title Bar */}
          <div className="bg-[#141b24] border-b-2 border-[#243346] px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-[#ff4d4d] inline-block" />
              <span className="size-3 rounded-full bg-[#fef08a] inline-block" />
              <span className="size-3 rounded-full bg-[#a3e635] inline-block" />
              <span className="font-mono text-xs text-[#94a3b8] ml-2">
                TrustguardAI/bin/auth_gate.sh
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-pixel text-[10px] text-[#a3e635] flex items-center gap-1.5 bg-[#a3e635]/10 px-2 py-0.5 border border-[#a3e635]/30">
                <span className="size-1.5 rounded-full bg-[#a3e635] animate-ping" />
                SYS_ONLINE
              </span>
            </div>
          </div>

          {/* Terminal Screen Body */}
          <div className="p-6 sm:p-10 space-y-8 bg-[#090d14]/95">
            {/* Header / Banner */}
            <div className="space-y-3 text-center sm:text-left border-b border-[#1e293b] pb-6">
              <div className="inline-flex items-center gap-2 bg-[#ff6b35]/15 border border-[#ff6b35]/40 px-3 py-1 font-pixel text-[11px] text-[#ff6b35] tracking-wider uppercase">
                <PixelAlien className="size-3.5 text-[#ff6b35]" />
                BROWSER EXTENSION AVAILABLE
              </div>

              <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#f8fafc] tracking-tight leading-tight">
                TrustGuard <span className="text-[#a3e635]">AI</span>
              </h1>

              <p className="font-code text-xs sm:text-sm text-[#94a3b8] max-w-2xl leading-relaxed">
                Autonomous real-time digital trust intelligence workstation. Real socket TLS
                probing, cryptographic weakness hunting, and collaborative community threat
                detection.
              </p>
            </div>

            {/* Error Notification Banner if sign-in fails */}
            {authError && (
              <div className="p-3 bg-[#ff4d4d]/15 border-2 border-[#ff4d4d] font-mono text-xs text-[#ff4d4d] flex items-center gap-2">
                <ShieldAlert size={16} className="shrink-0" />
                <span>Authentication Error: {authError}</span>
              </div>
            )}

            {/* TWO ACCESS OPTIONS CONTRACT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Card 1: ACCESS WITH SIGN IN (Full Platform & Community Intelligence) */}
              <div className="border-2 border-[#ff6b35] bg-[#121924] p-6 space-y-5 relative group hover:shadow-[0_0_25px_rgba(255,107,53,0.25)] transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-pixel text-[11px] font-bold px-2 py-0.5 bg-[#ff6b35] text-[#070b12] uppercase tracking-wider">
                      RECOMMENDED
                    </span>
                  </div>

                  <h3 className="font-arcade text-sm sm:text-base text-[#f8fafc] pt-1">
                    ACCESS WITH SIGN-IN
                  </h3>

                  <p className="font-code text-xs text-[#cbd5e1] leading-relaxed">
                    Authenticate via Google for verified analyst credentials. Unlocks unrestricted
                    access to the live collaborative intelligence network.
                  </p>

                  {/* Included capabilities */}
                  <ul className="space-y-2 pt-2 font-mono text-xs text-[#94a3b8]">
                    <li className="flex items-center gap-2 text-[#a3e635]">
                      <Check size={14} className="shrink-0" />
                      <span>Full Community Threat Feed Access</span>
                    </li>
                    <li className="flex items-center gap-2 text-[#a3e635]">
                      <Check size={14} className="shrink-0" />
                      <span>Upvote & Verify Threat IOCs</span>
                    </li>
                    <li className="flex items-center gap-2 text-[#a3e635]">
                      <Check size={14} className="shrink-0" />
                      <span>Submit Malicious Domains & Forensic Notes</span>
                    </li>
                    <li className="flex items-center gap-2 text-[#a3e635]">
                      <Check size={14} className="shrink-0" />
                      <span>Live TLS Handshake & eMudhra Auditing</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleGoogleSignIn}
                    disabled={isSigningIn || loading}
                    className="w-full h-12 rounded-none bg-[#ff6b35] hover:bg-[#ff8a00] text-[#080b10] font-arcade text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(255,107,53,0.4)] cursor-pointer"
                  >
                    {isSigningIn ? (
                      <span className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-black animate-ping" />
                        AUTHENTICATING...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Zap size={14} />
                        SIGN IN WITH GOOGLE
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Card 2: ACCESS WITHOUT SIGN IN (Guest Mode - Community Feed Locked) */}
              <div className="border-2 border-[#334155] bg-[#0f141d] p-6 space-y-5 relative group hover:border-[#64748b] transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-pixel text-[11px] font-bold px-2 py-0.5 bg-[#334155] text-[#94a3b8] uppercase tracking-wider">
                      GUEST ACCESS
                    </span>
                    <span className="font-code text-[11px] text-[#ff4d4d] font-semibold flex items-center gap-1">
                      <Lock size={12} /> FEED RESTRICTED
                    </span>
                  </div>

                  <h3 className="font-arcade text-sm sm:text-base text-[#e2e8f0] pt-1">
                    ACCESS WITHOUT SIGN-IN
                  </h3>

                  <p className="font-code text-xs text-[#94a3b8] leading-relaxed">
                    Explore diagnostic tools as a guest. Deep TLS socket probing and bulk scans are
                    enabled, but Community Threat Intelligence is strictly locked.
                  </p>

                  {/* Included capabilities vs locked */}
                  <ul className="space-y-2 pt-2 font-mono text-xs">
                    <li className="flex items-center gap-2 text-[#a3e635]">
                      <Check size={14} className="shrink-0" />
                      <span>Single Domain TLS & X.509 Probing</span>
                    </li>
                    <li className="flex items-center gap-2 text-[#a3e635]">
                      <Check size={14} className="shrink-0" />
                      <span>Bulk URL Security Auditing</span>
                    </li>
                    <li className="flex items-center gap-2 text-[#a3e635]">
                      <Check size={14} className="shrink-0" />
                      <span>Gemini 3.8 Flash Threat Analysis</span>
                    </li>
                    <li className="flex items-center gap-2 text-[#ff4d4d] opacity-90">
                      <Lock size={14} className="shrink-0" />
                      <span>Community Intelligence Feed (Locked)</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleGuestAccess}
                    variant="outline"
                    className="w-full h-12 rounded-none border-2 border-[#475569] bg-[#141b24] hover:bg-[#1e293b] hover:border-[#a3e635] text-[#e2e8f0] font-arcade text-xs tracking-wider uppercase transition-all cursor-pointer"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <PixelAlien className="size-4 text-[#a3e635]" />
                      CONTINUE AS GUEST
                      <ArrowRight size={13} />
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Live Terminal Telemetry Output Inspired by visual laptop screen */}
            <div className="border border-[#1e293b] bg-[#070a0e] p-4 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#64748b] border-b border-[#1e293b] pb-2">
                <span className="text-[#a3e635] font-semibold flex items-center gap-1.5">
                  <Terminal size={12} />
                  LIVE_PROBE_TELEMETRY.log
                </span>
              </div>
              <div className="space-y-1 text-[#94a3b8] text-[11px]">
                <p>
                  <span className="text-[#ff6b35]">[AUTH]</span> Firebase Authentication ready
                  (Google Provider initialized)
                </p>
                <p>
                  <span className="text-[#a3e635]">[TLS]</span> Native socket probe Port 443 (X.509
                  Modulus & SAN validation)
                </p>
                <p>
                  <span className="text-[#fef08a]">[CRYPTO]</span> eMudhra flawed prime generator
                  audit heuristic loaded
                </p>
                <p>
                  <span className="text-[#00f0ff]">[AI]</span> Gemini 3.8 Flash server-side threat
                  synthesis online
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#141b24] border-t-2 border-[#243346] px-4 py-3 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#64748b] gap-3">
            <span className="text-[#f8fafc] uppercase tracking-wider">Contact us:</span>
            <div className="flex items-center gap-2">
              <a
                href="mailto:swagataghosh538@gmail.com"
                className="inline-flex items-center gap-1.5 border border-[#2dd4bf]/60 px-3 py-1.5 text-[#2dd4bf] transition-colors hover:bg-[#2dd4bf]/10"
              >
                <Mail size={14} />
                Email
              </a>
              <a
                href="https://www.instagram.com/trustguard.ai?utm_source=qr&exln=MTMyZWtrdjd2YXh6cA=="
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 border border-[#ff6b35]/60 px-3 py-1.5 text-[#ff6b35] transition-colors hover:bg-[#ff6b35]/10"
              >
                <Instagram size={14} />
                Instagram
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Desk Decor Details (Matching visual) */}
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#64748b] border-t border-[#1e293b] pt-6 gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm">👾</span>
            <span>TrustGuard AI · Collaborative Threat Intelligence</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleGuestAccess}
              className="text-[#94a3b8] hover:text-[#a3e635] transition-colors"
            >
              Guest Workspace
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="text-[#ff6b35] hover:underline transition-colors"
            >
              Sign In (Analyst)
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
