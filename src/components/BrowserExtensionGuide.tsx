import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Chrome,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileCode2,
  Lock,
  Puzzle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Terminal,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type CodeTab = "background" | "manifest" | "content";

export function BrowserExtensionGuide() {
  const [activeTab, setActiveTab] = useState<CodeTab>("background");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedApiUrl, setCopiedApiUrl] = useState(false);
  const [customApiHost, setCustomApiHost] = useState(
    typeof window !== "undefined"
      ? window.location.origin
      : "https://ais-dev-7ljxwweajfgljewmozdzm3-95653422727.asia-southeast1.run.app",
  );

  const manifestSnippet = `{
  "manifest_version": 3,
  "name": "TrustGuard AI — Passive Guardian",
  "version": "1.0.0",
  "description": "Passive real-time cryptographic audit and web threat detection powered by TrustGuard AI.",
  "permissions": [
    "activeTab",
    "webNavigation",
    "storage",
    "notifications"
  ],
  "host_permissions": [
    "${customApiHost}/*",
    "<all_urls>"
  ],
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "action": {
    "default_title": "TrustGuard Security Status",
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  }
}`;

  const backgroundSnippet = `/**
 * TrustGuard AI — Passive Browser Guardian Service Worker
 * Intercepts top-level navigations, audits TLS certificates & threat scores,
 * and alerts users before submitting credentials to high-risk portals.
 */

const TRUSTGUARD_API = "${customApiHost}/api/scan";
const SCAN_CACHE = new Map(); // Domain => { timestamp, result }
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes

// Listen to top-level tab commit navigations
chrome.webNavigation.onCommitted.addListener(async (details) => {
  // Only monitor the top-level frame (frameId: 0)
  if (details.frameId !== 0) return;

  try {
    const url = new URL(details.url);
    if (!["http:", "https:"].includes(url.protocol)) return;

    const hostname = url.hostname;
    // Skip loopback or internal addresses
    if (hostname === "localhost" || hostname.endsWith(".local")) return;

    // Check memory cache
    const cached = SCAN_CACHE.get(hostname);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      updateBadge(details.tabId, cached.result);
      return;
    }

    // Set badge to scanning state
    chrome.action.setBadgeText({ tabId: details.tabId, text: "..." });
    chrome.action.setBadgeBackgroundColor({ tabId: details.tabId, color: "#64748b" });

    // Query TrustGuard AI live socket engine
    const response = await fetch(TRUSTGUARD_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUrl: hostname }),
    });

    if (!response.ok) throw new Error("Threat query failed");
    const scan = await response.json();

    SCAN_CACHE.set(hostname, { timestamp: Date.now(), result: scan });
    updateBadge(details.tabId, scan);

    // Passive intercept: trigger high-priority warning if site is Critical or High Risk
    if (scan.aiAnalysis.threatScore >= 60 || scan.certificate?.emudhraVulnerabilityCheck?.isVulnerable) {
      triggerThreatWarning(details.tabId, hostname, scan);
    }
  } catch (err) {
    console.warn("[TrustGuard Extension] Scan error:", err);
    chrome.action.setBadgeText({ tabId: details.tabId, text: "?" });
    chrome.action.setBadgeBackgroundColor({ tabId: details.tabId, color: "#94a3b8" });
  }
});

// Update extension icon badge with threat score & risk color
function updateBadge(tabId, scan) {
  const score = scan.aiAnalysis.threatScore;
  const isWeakCa = scan.certificate?.emudhraVulnerabilityCheck?.isVulnerable;

  let color = "#10b981"; // Safe (Green)
  if (score >= 60 || isWeakCa) color = "#ef4444"; // Critical (Red)
  else if (score >= 35) color = "#f59e0b"; // Medium (Amber)

  chrome.action.setBadgeText({ tabId, text: String(score) });
  chrome.action.setBadgeBackgroundColor({ tabId, color });
}

// Display alert notification for critical phishing or weak CA key issues
function triggerThreatWarning(tabId, domain, scan) {
  const isWeakCa = scan.certificate?.emudhraVulnerabilityCheck?.isVulnerable;
  const reason = isWeakCa
    ? "eMudhra predictable CA key generation vulnerability detected."
    : scan.aiAnalysis.primaryVector;

  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon-128.png",
    title: \`⚠️ TrustGuard Alert: \${domain}\`,
    message: \`Threat Score: \${scan.aiAnalysis.threatScore}/100. \${reason}\`,
    priority: 2,
  });
}`;

  const contentSnippet = `/**
 * TrustGuard AI — Content Script (Optional: Form Input Sentinel)
 * Flags credential input fields if the parent domain has an active security lapse.
 */

window.addEventListener("focusin", (e) => {
  if (e.target.matches('input[type="password"], input[name*="card"], input[name*="cvv"]')) {
    chrome.runtime.sendMessage({ type: "CHECK_CURRENT_TRUST" }, (response) => {
      if (response?.isHighRisk) {
        e.target.style.outline = "2px solid #ef4444";
        e.target.setAttribute(
          "title",
          "⚠️ TrustGuard Warning: This site was flagged with high phishing or weak CA certificate risks."
        );
      }
    });
  }
});`;

  const getCodeContent = () => {
    switch (activeTab) {
      case "manifest":
        return manifestSnippet;
      case "content":
        return contentSnippet;
      case "background":
      default:
        return backgroundSnippet;
    }
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(getCodeContent());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyApiUrl = async () => {
    await navigator.clipboard.writeText(`${customApiHost}/api/scan`);
    setCopiedApiUrl(true);
    setTimeout(() => setCopiedApiUrl(false), 2000);
  };

  const handleDownloadExtensionPack = () => {
    // Generate a downloadable text bundle
    const pack = `// ============================================
// File: manifest.json
// ============================================
${manifestSnippet}

// ============================================
// File: background.js
// ============================================
${backgroundSnippet}

// ============================================
// File: content.js
// ============================================
${contentSnippet}
`;

    const blob = new Blob([pack], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trustguard-extension-pack.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="extension-integration" className="border border-border bg-card p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center border border-primary/30 bg-primary/10 text-primary">
              <Puzzle size={16} />
            </span>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                Client-Side Deployment · Passive Telemetry
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Browser Extension Integration Guide
              </h2>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 max-w-2xl leading-relaxed">
            Integrate the TrustGuard AI scanning engine into your custom Chromium (Chrome, Brave,
            Edge) or Firefox extension. Passively inspect top-level website navigations in the
            background, render live threat badges in the browser toolbar, and alert employees before
            credential entry.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadExtensionPack}
            className="rounded-none border-border h-8 text-xs font-mono"
          >
            <Download size={13} className="mr-1.5" />
            Download Source Bundle
          </Button>
        </div>
      </div>

      {/* 3 Architecture Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="border border-border bg-secondary/30 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-primary">STEP 01</span>
            <Chrome size={15} className="text-muted-foreground" />
          </div>
          <h4 className="text-xs font-semibold text-foreground">Manifest V3 Configuration</h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Declare <code className="font-mono text-foreground/90">webNavigation</code> and{" "}
            <code className="font-mono text-foreground/90">storage</code> permissions with host
            allowlists targeting this instance's{" "}
            <code className="font-mono text-foreground/90">/api/scan</code> endpoint.
          </p>
        </div>

        <div className="border border-border bg-secondary/30 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-primary">STEP 02</span>
            <Lock size={15} className="text-muted-foreground" />
          </div>
          <h4 className="text-xs font-semibold text-foreground">Passive Socket Interception</h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            The background service worker intercepts navigations, retrieves cryptographic scores
            from the server, caches results for 15 minutes, and updates the icon badge.
          </p>
        </div>

        <div className="border border-border bg-secondary/30 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-primary">STEP 03</span>
            <ShieldAlert size={15} className="text-muted-foreground" />
          </div>
          <h4 className="text-xs font-semibold text-foreground">Credential Sentinel Alerts</h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Dispatches native desktop notifications and flags HTML password inputs when visiting
            domains with eMudhra weak CA keys or threat scores &gt; 60.
          </p>
        </div>
      </div>

      {/* API Endpoint Configuration Banner */}
      <div className="border border-border bg-secondary/20 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase text-muted-foreground">
            Active Endpoint:
          </span>
          <code className="font-mono text-xs text-primary font-semibold select-all break-all">
            {customApiHost}/api/scan
          </code>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyApiUrl}
            className="rounded-none border-border h-7 text-[11px] font-mono"
          >
            {copiedApiUrl ? (
              <>
                <Check size={12} className="mr-1 text-success" />
                Copied Endpoint!
              </>
            ) : (
              <>
                <Copy size={12} className="mr-1" />
                Copy API URL
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Code Snippet Viewer */}
      <div className="border border-border bg-card space-y-0 overflow-hidden">
        {/* Tabs Bar */}
        <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("background")}
              className={`px-3 py-2 text-xs font-mono transition-colors border-b-2 -mb-[1px] ${
                activeTab === "background"
                  ? "border-primary text-foreground font-semibold bg-card"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              background.js (Service Worker)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("manifest")}
              className={`px-3 py-2 text-xs font-mono transition-colors border-b-2 -mb-[1px] ${
                activeTab === "manifest"
                  ? "border-primary text-foreground font-semibold bg-card"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              manifest.json (MV3)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("content")}
              className={`px-3 py-2 text-xs font-mono transition-colors border-b-2 -mb-[1px] ${
                activeTab === "content"
                  ? "border-primary text-foreground font-semibold bg-card"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              content.js (Form Guard)
            </button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopyCode}
            className="h-7 text-xs font-mono text-muted-foreground hover:text-foreground"
          >
            {copiedCode ? (
              <>
                <Check size={12} className="mr-1 text-success" />
                Copied Snippet!
              </>
            ) : (
              <>
                <Copy size={12} className="mr-1" />
                Copy Code
              </>
            )}
          </Button>
        </div>

        {/* Code Block Container */}
        <div className="p-4 bg-black/60 overflow-x-auto max-h-[380px]">
          <pre className="font-mono text-xs text-foreground/90 leading-relaxed select-all">
            <code>{getCodeContent()}</code>
          </pre>
        </div>
      </div>

      {/* Installation Walkthrough Guide */}
      <div className="border border-border bg-secondary/20 p-5 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
          <Terminal size={14} className="text-primary" />
          How to Test in Chrome / Chromium (Under 2 Minutes)
        </h4>
        <ol className="list-decimal list-inside space-y-1.5 text-xs text-muted-foreground leading-relaxed pl-1 font-mono">
          <li>
            Create a local directory named{" "}
            <code className="text-foreground">trustguard-extension/</code>.
          </li>
          <li>
            Save the three files above (<code className="text-foreground">manifest.json</code>,{" "}
            <code className="text-foreground">background.js</code>,{" "}
            <code className="text-foreground">content.js</code>) into that directory.
          </li>
          <li>
            Open Chrome or Edge and navigate to{" "}
            <code className="text-primary">chrome://extensions/</code>.
          </li>
          <li>
            Enable the <strong className="text-foreground">"Developer mode"</strong> toggle in the
            upper right corner.
          </li>
          <li>
            Click <strong className="text-foreground">"Load unpacked"</strong> and select your{" "}
            <code className="text-foreground">trustguard-extension/</code> folder.
          </li>
          <li>
            Browse to any site (e.g. <code className="text-foreground">github.com</code> or test
            domains). The extension icon in your toolbar will automatically display the live Trust
            Score badge.
          </li>
        </ol>
      </div>
    </section>
  );
}
