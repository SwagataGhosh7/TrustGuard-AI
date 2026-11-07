import { useState } from "react";
import {
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Layers,
  Play,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { FullScanResult } from "@/server/scanner";

export interface BulkScanItem {
  target: string;
  success: boolean;
  result: FullScanResult | null;
  error: string | null;
}

interface BulkUrlScannerProps {
  onInspectDomain?: (domain: string, scanData?: FullScanResult) => void;
}

const PRESET_BATCHES = {
  banking: ["paypal.com", "chase.com", "secure-login-hdfc-update.com", "wellsfargo.com"],
  infrastructure: ["github.com", "cloudflare.com", "emudhra-auth-gateway-test.net", "google.com"],
  mixedRisk: [
    "github.com",
    "secure-login-hdfc-update.com",
    "emudhra-auth-gateway-test.net",
    "cloudflare.com",
    "expired-rsa-demo.net",
  ],
};

export function BulkUrlScanner({ onInspectDomain }: BulkUrlScannerProps) {
  const [inputUrls, setInputUrls] = useState(
    "github.com\ncloudflare.com\nemudhra-auth-gateway-test.net\nsecure-login-hdfc-update.com",
  );
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BulkScanItem[]>([]);
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [sortField, setSortField] = useState<"domain" | "score" | "status">("score");
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Parse lines/delimiters from textarea
  const parseDomains = (text: string): string[] => {
    return text
      .split(/[\n,;]+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#"))
      .slice(0, 12); // Limit to 12
  };

  const handleRunBulkScan = async () => {
    const urls = parseDomains(inputUrls);
    if (urls.length === 0) {
      setErrorMessage("Please enter at least one valid domain or URL to scan.");
      return;
    }

    setErrorMessage(null);
    setIsRunning(true);
    setResults([]);

    try {
      const response = await fetch("/api/bulk-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });

      if (!response.ok) {
        const errPayload = await response.json().catch(() => ({}));
        throw new Error(errPayload.error || `Bulk scan failed with status ${response.status}`);
      }

      const data = (await response.json()) as { count: number; results: BulkScanItem[] };
      setResults(data.results || []);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setIsRunning(false);
    }
  };

  const handleLoadPreset = (presetKey: keyof typeof PRESET_BATCHES) => {
    setInputUrls(PRESET_BATCHES[presetKey].join("\n"));
  };

  const handleClear = () => {
    setInputUrls("");
    setResults([]);
    setErrorMessage(null);
  };

  // Export CSV
  const handleExportCsv = () => {
    if (results.length === 0) return;

    const headers = [
      "Domain",
      "Status",
      "Threat Score",
      "Risk Level",
      "Primary Vector",
      "Issuer CA",
      "eMudhra Status",
      "HSTS",
      "CSP",
      "Latency (ms)",
    ];

    const rows = results.map((item) => {
      if (item.success && item.result) {
        const r = item.result;
        return [
          r.domain,
          "SUCCESS",
          r.aiAnalysis.threatScore,
          r.aiAnalysis.riskLevel,
          `"${r.aiAnalysis.primaryVector.replace(/"/g, '""')}"`,
          `"${(r.certificate.issuer.CN || r.certificate.issuer.O || "").replace(/"/g, '""')}"`,
          r.certificate.emudhraVulnerabilityCheck.keyGenerationStatus,
          r.securityHeaders.hsts.present ? "YES" : "NO",
          r.securityHeaders.csp.present ? "YES" : "NO",
          r.scanDurationMs,
        ];
      }
      return [
        item.target,
        "FAILED",
        "-",
        "-",
        `"${item.error || "Scan failed"}"`,
        "-",
        "-",
        "-",
        "-",
        "-",
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `trustguard-bulk-audit-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Copy Summary to clipboard
  const handleCopySummary = async () => {
    if (results.length === 0) return;

    let text = `TRUSTGUARD AI — BULK THREAT SCAN REPORT (${results.length} Domains)\nGenerated: ${new Date().toISOString()}\n\n`;

    for (const item of results) {
      if (item.success && item.result) {
        const r = item.result;
        text += `• ${r.domain.toUpperCase()}: ${r.aiAnalysis.riskLevel} (Score: ${r.aiAnalysis.threatScore}/100)\n`;
        text += `  Vector: ${r.aiAnalysis.primaryVector}\n`;
        text += `  CA: ${r.certificate.issuer.CN || "Unknown"} | eMudhra: ${r.certificate.emudhraVulnerabilityCheck.keyGenerationStatus}\n`;
      } else {
        text += `• ${item.target.toUpperCase()}: AUDIT FAILED (${item.error || "Handshake error"})\n`;
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Filter & sort results
  const filteredResults = results.filter((item) => {
    if (filterRisk === "all") return true;
    if (filterRisk === "failed") return !item.success;
    if (!item.success || !item.result) return false;
    return item.result.aiAnalysis.riskLevel.toLowerCase() === filterRisk.toLowerCase();
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortField === "domain") {
      const nameA = (a.result?.domain || a.target).toLowerCase();
      const nameB = (b.result?.domain || b.target).toLowerCase();
      return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    }
    if (sortField === "score") {
      const scoreA = a.result?.aiAnalysis.threatScore ?? -1;
      const scoreB = b.result?.aiAnalysis.threatScore ?? -1;
      return sortAsc ? scoreA - scoreB : scoreB - scoreA;
    }
    if (sortField === "status") {
      const statusA = a.success ? 1 : 0;
      const statusB = b.success ? 1 : 0;
      return sortAsc ? statusA - statusB : statusB - statusA;
    }
    return 0;
  });

  // Calculate batch metrics
  const successfulScans = results.filter((r) => r.success && r.result);
  const criticalThreats = successfulScans.filter(
    (r) => r.result?.aiAnalysis.riskLevel === "CRITICAL",
  ).length;
  const highThreats = successfulScans.filter(
    (r) => r.result?.aiAnalysis.riskLevel === "HIGH",
  ).length;
  const emudhraVulnerable = successfulScans.filter(
    (r) => r.result?.certificate.emudhraVulnerabilityCheck.isVulnerable,
  ).length;
  const avgThreatScore =
    successfulScans.length > 0
      ? Math.round(
          successfulScans.reduce(
            (acc, curr) => acc + (curr.result?.aiAnalysis.threatScore || 0),
            0,
          ) / successfulScans.length,
        )
      : 0;

  return (
    <section id="bulk-scanner" className="border border-border bg-card p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center border border-primary/30 bg-primary/10 text-primary">
              <Layers size={16} />
            </span>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                Concurrent Probing Matrix
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Bulk URL Threat Assessment & Comparison
              </h2>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 max-w-2xl leading-relaxed">
            Paste multiple domains or hostnames to dispatch concurrent server-side TLS handshakes,
            eMudhra CA key pattern diagnostics, and threat synthesis. Compare results side-by-side
            in the summary comparison matrix.
          </p>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[10px] uppercase text-muted-foreground font-mono mr-1">
            Presets:
          </span>
          <button
            type="button"
            onClick={() => handleLoadPreset("mixedRisk")}
            className="border border-border px-2 py-1 text-[11px] font-mono hover:border-primary hover:text-foreground text-muted-foreground transition-colors"
          >
            Mixed Risk
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset("banking")}
            className="border border-border px-2 py-1 text-[11px] font-mono hover:border-primary hover:text-foreground text-muted-foreground transition-colors"
          >
            Banking Targets
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset("infrastructure")}
            className="border border-border px-2 py-1 text-[11px] font-mono hover:border-primary hover:text-foreground text-muted-foreground transition-colors"
          >
            Critical Infra
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="bulk-domains-textarea" className="font-mono text-muted-foreground">
            Target Hostnames (One per line, up to 12 targets):
          </label>
          <span className="font-mono text-[11px] text-muted-foreground">
            {parseDomains(inputUrls).length} of 12 domains queued
          </span>
        </div>

        <Textarea
          id="bulk-domains-textarea"
          value={inputUrls}
          onChange={(e) => setInputUrls(e.target.value)}
          placeholder="example.com&#10;paypal.com&#10;secure-login-hdfc-update.com&#10;github.com"
          rows={4}
          disabled={isRunning}
          className="rounded-none border-border bg-secondary/20 font-mono text-xs focus-visible:ring-primary leading-relaxed"
        />

        {errorMessage && (
          <div className="border border-danger/40 bg-danger/10 p-3 text-xs text-danger flex items-center gap-2 font-mono">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handleRunBulkScan}
              disabled={isRunning || parseDomains(inputUrls).length === 0}
              className="rounded-none bg-primary text-primary-foreground font-semibold text-xs h-9 px-5 hover:bg-primary/90"
            >
              {isRunning ? (
                <>
                  <RefreshCw size={13} className="mr-2 animate-spin" />
                  Auditing {parseDomains(inputUrls).length} Targets Concurrently...
                </>
              ) : (
                <>
                  <Play size={13} className="mr-2 fill-current" />
                  Run Concurrent Bulk Scan
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={isRunning || (!inputUrls && results.length === 0)}
              className="rounded-none border-border h-9 text-xs text-muted-foreground hover:text-foreground"
            >
              <Trash2 size={13} className="mr-1.5" />
              Clear
            </Button>
          </div>

          {results.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopySummary}
                className="rounded-none border-border h-9 text-xs font-mono"
              >
                <Copy size={13} className="mr-1.5" />
                {copiedSummary ? "Copied!" : "Copy Summary"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                className="rounded-none border-border h-9 text-xs font-mono"
              >
                <Download size={13} className="mr-1.5" />
                Export CSV
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Aggregate Batch KPIs */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="border border-border bg-secondary/30 p-3.5 space-y-1">
            <div className="text-[10px] uppercase font-mono text-muted-foreground">
              Total Audited Targets
            </div>
            <div className="text-xl font-mono font-bold text-foreground">
              {results.length}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                ({successfulScans.length} ok)
              </span>
            </div>
          </div>

          <div className="border border-border bg-secondary/30 p-3.5 space-y-1">
            <div className="text-[10px] uppercase font-mono text-muted-foreground">
              Average Threat Score
            </div>
            <div className="text-xl font-mono font-bold text-foreground flex items-center gap-2">
              <span>{avgThreatScore}/100</span>
              <span
                className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 border ${
                  avgThreatScore >= 60
                    ? "text-danger border-danger/40 bg-danger/10"
                    : avgThreatScore >= 35
                      ? "text-warning border-warning/40 bg-warning/10"
                      : "text-success border-success/40 bg-success/10"
                }`}
              >
                {avgThreatScore >= 60 ? "High Risk" : avgThreatScore >= 35 ? "Elevated" : "Normal"}
              </span>
            </div>
          </div>

          <div className="border border-border bg-secondary/30 p-3.5 space-y-1">
            <div className="text-[10px] uppercase font-mono text-muted-foreground">
              High / Critical Threats
            </div>
            <div className="text-xl font-mono font-bold text-danger">
              {criticalThreats + highThreats}{" "}
              <span className="text-xs text-muted-foreground font-normal">domains flagged</span>
            </div>
          </div>

          <div className="border border-border bg-secondary/30 p-3.5 space-y-1">
            <div className="text-[10px] uppercase font-mono text-muted-foreground">
              eMudhra Weak Keys
            </div>
            <div
              className={`text-xl font-mono font-bold ${
                emudhraVulnerable > 0 ? "text-warning" : "text-success"
              }`}
            >
              {emudhraVulnerable}{" "}
              <span className="text-xs text-muted-foreground font-normal">flagged</span>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Matrix Table */}
      {results.length > 0 && (
        <div className="space-y-3 pt-2">
          {/* Controls Bar: Filter & Sort */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground uppercase text-[10px] font-mono">
                Filter Risk:
              </span>
              <div className="flex items-center gap-1">
                {(["all", "critical", "high", "medium", "low", "safe", "failed"] as const).map(
                  (risk) => (
                    <button
                      key={risk}
                      type="button"
                      onClick={() => setFilterRisk(risk)}
                      className={`px-2 py-0.5 font-mono text-[11px] uppercase transition-colors ${
                        filterRisk === risk
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "border border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {risk}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                <span>Sort by:</span>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as "domain" | "score" | "status")}
                  className="bg-secondary/40 border border-border px-2 py-0.5 text-foreground rounded-none"
                >
                  <option value="score">Threat Score</option>
                  <option value="domain">Domain Name</option>
                  <option value="status">Audit Status</option>
                </select>
                <button
                  type="button"
                  onClick={() => setSortAsc(!sortAsc)}
                  className="p-1 hover:text-foreground transition-colors"
                  title="Toggle Ascending/Descending"
                >
                  <ArrowUpDown size={12} />
                </button>
              </div>
              <span className="text-muted-foreground font-mono text-[11px]">
                Showing {sortedResults.length} of {results.length} targets
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-border">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/50 font-mono text-[10px] uppercase text-muted-foreground">
                  <th className="py-2.5 px-3">Target Domain</th>
                  <th className="py-2.5 px-3 text-center">Threat Score</th>
                  <th className="py-2.5 px-3">Risk Assessment</th>
                  <th className="py-2.5 px-3">Primary Attack Vector</th>
                  <th className="py-2.5 px-3">Issuer CA & Algorithm</th>
                  <th className="py-2.5 px-3 text-center">eMudhra Audit</th>
                  <th className="py-2.5 px-3 text-center">HSTS / CSP</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-[11px]">
                {sortedResults.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No domains match the selected filter.
                    </td>
                  </tr>
                ) : (
                  sortedResults.map((item, idx) => {
                    if (item.success && item.result) {
                      const r = item.result;
                      const isEmudhraVuln = r.certificate.emudhraVulnerabilityCheck.isVulnerable;
                      const risk = r.aiAnalysis.riskLevel;

                      return (
                        <tr
                          key={`${r.domain}-${idx}`}
                          className="hover:bg-secondary/30 transition-colors group"
                        >
                          {/* Domain */}
                          <td className="py-3 px-3 font-semibold text-foreground">
                            <div className="flex items-center gap-1.5">
                              {risk === "CRITICAL" || risk === "HIGH" ? (
                                <ShieldAlert size={14} className="text-danger shrink-0" />
                              ) : (
                                <ShieldCheck size={14} className="text-success shrink-0" />
                              )}
                              <span className="truncate max-w-[180px]" title={r.domain}>
                                {r.domain}
                              </span>
                            </div>
                            <div className="text-[10px] text-muted-foreground font-normal truncate">
                              IP: {r.dns.ipAddress || "Unresolved"} · {r.scanDurationMs}ms
                            </div>
                          </td>

                          {/* Threat Score */}
                          <td className="py-3 px-3 text-center">
                            <div
                              className={`text-base font-bold tabular-nums ${
                                r.aiAnalysis.threatScore >= 60
                                  ? "text-danger"
                                  : r.aiAnalysis.threatScore >= 35
                                    ? "text-warning"
                                    : "text-success"
                              }`}
                            >
                              {r.aiAnalysis.threatScore}
                            </div>
                            <span className="text-[9px] text-muted-foreground">/ 100</span>
                          </td>

                          {/* Risk Level Badge */}
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                                risk === "CRITICAL"
                                  ? "bg-danger/15 text-danger border-danger/40"
                                  : risk === "HIGH"
                                    ? "bg-warning/15 text-warning border-warning/40"
                                    : risk === "MEDIUM"
                                      ? "bg-amber-500/15 text-amber-400 border-amber-500/40"
                                      : "bg-success/15 text-success border-success/40"
                              }`}
                            >
                              {risk}
                            </span>
                          </td>

                          {/* Primary Vector */}
                          <td className="py-3 px-3 text-foreground/90">
                            <div
                              className="font-sans text-xs truncate max-w-[220px]"
                              title={r.aiAnalysis.primaryVector}
                            >
                              {r.aiAnalysis.primaryVector}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate max-w-[220px]">
                              {r.aiAnalysis.summary.slice(0, 50)}...
                            </div>
                          </td>

                          {/* Issuer CA & Alg */}
                          <td className="py-3 px-3 text-muted-foreground">
                            <div
                              className="truncate max-w-[160px] text-foreground font-sans text-xs"
                              title={r.certificate.issuer.CN}
                            >
                              {r.certificate.issuer.CN || r.certificate.issuer.O || "Unknown CA"}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {r.certificate.keyAlgorithm} ({r.certificate.bits}b) ·{" "}
                              {r.certificate.protocol}
                            </div>
                          </td>

                          {/* eMudhra Audit */}
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-1.5 py-0.5 text-[10px] uppercase font-bold border ${
                                isEmudhraVuln
                                  ? "bg-danger/15 text-danger border-danger/40"
                                  : "bg-success/15 text-success border-success/40"
                              }`}
                            >
                              {r.certificate.emudhraVulnerabilityCheck.keyGenerationStatus}
                            </span>
                          </td>

                          {/* Headers */}
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1 text-[10px]">
                              <span
                                className={`px-1 py-0.5 ${
                                  r.securityHeaders.hsts.present
                                    ? "text-success bg-success/10"
                                    : "text-muted-foreground bg-secondary/60"
                                }`}
                                title={
                                  r.securityHeaders.hsts.present ? "HSTS Present" : "HSTS Missing"
                                }
                              >
                                HSTS
                              </span>
                              <span
                                className={`px-1 py-0.5 ${
                                  r.securityHeaders.csp.present
                                    ? "text-success bg-success/10"
                                    : "text-muted-foreground bg-secondary/60"
                                }`}
                                title={
                                  r.securityHeaders.csp.present ? "CSP Present" : "CSP Missing"
                                }
                              >
                                CSP
                              </span>
                            </div>
                          </td>

                          {/* Action Button */}
                          <td className="py-3 px-3 text-right">
                            {onInspectDomain && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => onInspectDomain(r.domain, r)}
                                className="rounded-none border-border h-7 text-[10px] font-mono hover:bg-primary hover:text-primary-foreground transition-colors"
                              >
                                <ExternalLink size={10} className="mr-1" />
                                Inspect
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    }

                    // Failed row
                    return (
                      <tr
                        key={`${item.target}-${idx}`}
                        className="bg-danger/5 hover:bg-danger/10 transition-colors"
                      >
                        <td className="py-3 px-3 font-semibold text-danger">
                          <div className="flex items-center gap-1.5">
                            <XCircle size={14} className="shrink-0" />
                            <span className="truncate max-w-[180px]">{item.target}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center text-muted-foreground font-mono">-</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border bg-danger/15 text-danger border-danger/40">
                            HANDSHAKE FAILED
                          </span>
                        </td>
                        <td colSpan={4} className="py-3 px-3 text-danger/80 text-[10px] font-mono">
                          {item.error || "TLS socket timeout or unresolved address"}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {onInspectDomain && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => onInspectDomain(item.target)}
                              className="rounded-none border-border h-7 text-[10px] font-mono"
                            >
                              Retry
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
