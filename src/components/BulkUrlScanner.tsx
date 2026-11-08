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

export function BulkUrlScanner({ onInspectDomain }: BulkUrlScannerProps) {
  const [inputUrls, setInputUrls] = useState("");
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
    <section
      id="bulk-scanner"
      className="border border-amber-500/30 bg-[#0e0907]/90 p-6 space-y-6 shadow-[0_0_20px_rgba(245,158,11,0.05)] relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-amber-500/20 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center border border-amber-500/40 bg-amber-500/10 text-amber-400">
              <Layers size={16} />
            </span>
            <div>
              <div className="text-[9px] font-arcade uppercase tracking-widest text-amber-400">
                Concurrent Probing Matrix
              </div>
              <h2 className="text-base sm:text-lg font-pixel text-amber-200 tracking-wide mt-1">
                Bulk URL Threat Assessment & Comparison
              </h2>
            </div>
          </div>
          <p className="text-xs font-display text-zinc-300 mt-2 max-w-2xl leading-relaxed">
            Paste multiple domains or hostnames to dispatch concurrent server-side TLS handshakes,
            eMudhra CA key pattern diagnostics, and threat synthesis. Compare results side-by-side
            in the summary comparison matrix.
          </p>
        </div>

      </div>

      {/* Input Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <label
            htmlFor="bulk-domains-textarea"
            className="font-pixel text-[11px] text-amber-300/90"
          >
            Target Hostnames (One per line, up to 12 targets):
          </label>
          <span className="font-code text-[11px] text-zinc-400">
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
          className="rounded-none border-amber-500/40 bg-black/80 font-code text-xs text-amber-100 placeholder:text-zinc-600 focus-visible:ring-amber-500 leading-relaxed shadow-inner"
        />

        {errorMessage && (
          <div className="border border-red-500/50 bg-red-950/40 p-3 text-xs text-red-300 flex items-center gap-2 font-code">
            <AlertTriangle size={14} className="shrink-0 text-red-400" />
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
              className="rounded-none bg-gradient-to-r from-amber-500 to-orange-500 text-black font-pixel text-xs h-9 px-5 hover:from-amber-400 hover:to-orange-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RefreshCw size={13} className="mr-2 animate-spin text-black" />
                  Auditing {parseDomains(inputUrls).length} Targets...
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
              className="rounded-none border-amber-500/30 bg-black/50 h-9 text-xs font-code text-zinc-300 hover:text-white hover:border-amber-400"
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
                className="rounded-none border-amber-500/30 bg-black/60 h-9 text-xs font-code text-amber-300 hover:bg-amber-500/10"
              >
                <Copy size={13} className="mr-1.5" />
                {copiedSummary ? "Copied!" : "Copy Summary"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                className="rounded-none border-amber-500/30 bg-black/60 h-9 text-xs font-code text-amber-300 hover:bg-amber-500/10"
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
          <div className="border border-amber-500/30 bg-black/50 p-3.5 space-y-1">
            <div className="text-[10px] uppercase font-pixel text-zinc-400">
              Total Audited Targets
            </div>
            <div className="text-xl font-code font-bold text-amber-200">
              {results.length}{" "}
              <span className="text-xs font-normal text-zinc-400">
                ({successfulScans.length} ok)
              </span>
            </div>
          </div>

          <div className="border border-amber-500/30 bg-black/50 p-3.5 space-y-1">
            <div className="text-[10px] uppercase font-pixel text-zinc-400">Avg Threat Score</div>
            <div className="text-xl font-code font-bold text-amber-200 flex items-center gap-2">
              <span>{avgThreatScore}/100</span>
              <span
                className={`text-[9px] font-pixel uppercase px-1.5 py-0.5 border ${
                  avgThreatScore >= 60
                    ? "text-red-400 border-red-500/40 bg-red-950/40"
                    : avgThreatScore >= 35
                      ? "text-amber-400 border-amber-500/40 bg-amber-950/40"
                      : "text-emerald-400 border-emerald-500/40 bg-emerald-950/40"
                }`}
              >
                {avgThreatScore >= 60 ? "High Risk" : avgThreatScore >= 35 ? "Elevated" : "Normal"}
              </span>
            </div>
          </div>

          <div className="border border-amber-500/30 bg-black/50 p-3.5 space-y-1">
            <div className="text-[10px] uppercase font-pixel text-zinc-400">Critical Threats</div>
            <div className="text-xl font-code font-bold text-red-400">
              {criticalThreats + highThreats}{" "}
              <span className="text-xs text-zinc-400 font-normal">flagged</span>
            </div>
          </div>

          <div className="border border-amber-500/30 bg-black/50 p-3.5 space-y-1">
            <div className="text-[10px] uppercase font-pixel text-zinc-400">
              eMudhra Vulnerabilities
            </div>
            <div
              className={`text-xl font-code font-bold ${
                emudhraVulnerable > 0 ? "text-amber-400" : "text-emerald-400"
              }`}
            >
              {emudhraVulnerable} <span className="text-xs text-zinc-400 font-normal">flagged</span>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Matrix Table */}
      {results.length > 0 && (
        <div className="space-y-3 pt-2">
          {/* Controls Bar: Filter & Sort */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 uppercase text-[10px] font-pixel">Filter Risk:</span>
              <div className="flex items-center gap-1">
                {(["all", "critical", "high", "medium", "low", "safe", "failed"] as const).map(
                  (risk) => (
                    <button
                      key={risk}
                      type="button"
                      onClick={() => setFilterRisk(risk)}
                      className={`px-2 py-0.5 font-code text-[11px] uppercase transition-colors ${
                        filterRisk === risk
                          ? "bg-amber-500 text-black font-semibold shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                          : "border border-amber-500/30 bg-black/40 text-zinc-400 hover:text-amber-300"
                      }`}
                    >
                      {risk}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-code text-[11px] text-zinc-400">
                <span>Sort:</span>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as "domain" | "score" | "status")}
                  className="bg-black/60 border border-amber-500/40 px-2 py-0.5 text-amber-200 rounded-none focus:outline-none"
                >
                  <option value="score">Threat Score</option>
                  <option value="domain">Domain Name</option>
                  <option value="status">Audit Status</option>
                </select>
                <button
                  type="button"
                  onClick={() => setSortAsc(!sortAsc)}
                  className="p-1 text-amber-400 hover:text-amber-200 transition-colors"
                  title="Toggle Ascending/Descending"
                >
                  <ArrowUpDown size={12} />
                </button>
              </div>
              <span className="text-zinc-400 font-code text-[11px]">
                {sortedResults.length} of {results.length} targets
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-amber-500/30 bg-black/60">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-amber-500/30 bg-amber-950/30 font-pixel text-[9px] uppercase text-amber-400 tracking-wider">
                  <th className="py-2.5 px-3">Target Domain</th>
                  <th className="py-2.5 px-3 text-center">Score</th>
                  <th className="py-2.5 px-3">Assessment</th>
                  <th className="py-2.5 px-3">Primary Vector</th>
                  <th className="py-2.5 px-3">Issuer CA & Alg</th>
                  <th className="py-2.5 px-3 text-center">eMudhra Audit</th>
                  <th className="py-2.5 px-3 text-center">HSTS / CSP</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10 font-code text-[11px]">
                {sortedResults.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-400 font-code">
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
                          className="hover:bg-amber-500/10 transition-colors group"
                        >
                          {/* Domain */}
                          <td className="py-3 px-3 font-semibold text-amber-100">
                            <div className="flex items-center gap-1.5">
                              {risk === "CRITICAL" || risk === "HIGH" ? (
                                <ShieldAlert size={14} className="text-red-400 shrink-0" />
                              ) : (
                                <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                              )}
                              <span className="truncate max-w-[180px] font-code" title={r.domain}>
                                {r.domain}
                              </span>
                            </div>
                            <div className="text-[10px] text-zinc-400 font-normal truncate font-code">
                              IP: {r.dns.ipAddress || "Unresolved"} · {r.scanDurationMs}ms
                            </div>
                          </td>

                          {/* Threat Score */}
                          <td className="py-3 px-3 text-center">
                            <div
                              className={`text-base font-bold tabular-nums font-code ${
                                r.aiAnalysis.threatScore >= 60
                                  ? "text-red-400"
                                  : r.aiAnalysis.threatScore >= 35
                                    ? "text-amber-400"
                                    : "text-emerald-400"
                              }`}
                            >
                              {r.aiAnalysis.threatScore}
                            </div>
                            <span className="text-[9px] text-zinc-400 font-code">/ 100</span>
                          </td>

                          {/* Risk Level Badge */}
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 text-[9px] font-pixel uppercase tracking-wider border ${
                                risk === "CRITICAL"
                                  ? "bg-red-950/60 text-red-400 border-red-500/40"
                                  : risk === "HIGH"
                                    ? "bg-orange-950/60 text-orange-400 border-orange-500/40"
                                    : risk === "MEDIUM"
                                      ? "bg-amber-950/60 text-amber-300 border-amber-500/40"
                                      : "bg-emerald-950/60 text-emerald-400 border-emerald-500/40"
                              }`}
                            >
                              {risk}
                            </span>
                          </td>

                          {/* Primary Vector */}
                          <td className="py-3 px-3 text-zinc-200">
                            <div
                              className="font-display text-xs truncate max-w-[220px]"
                              title={r.aiAnalysis.primaryVector}
                            >
                              {r.aiAnalysis.primaryVector}
                            </div>
                            <div className="text-[10px] text-zinc-400 truncate max-w-[220px] font-code">
                              {r.aiAnalysis.summary.slice(0, 50)}...
                            </div>
                          </td>

                          {/* Issuer CA & Alg */}
                          <td className="py-3 px-3 text-zinc-300">
                            <div
                              className="truncate max-w-[160px] text-amber-200 font-display text-xs"
                              title={r.certificate.issuer.CN}
                            >
                              {r.certificate.issuer.CN || r.certificate.issuer.O || "Unknown CA"}
                            </div>
                            <div className="text-[10px] text-zinc-400 font-code">
                              {r.certificate.keyAlgorithm} ({r.certificate.bits}b) ·{" "}
                              {r.certificate.protocol}
                            </div>
                          </td>

                          {/* eMudhra Audit */}
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-1.5 py-0.5 text-[9px] uppercase font-pixel border ${
                                isEmudhraVuln
                                  ? "bg-red-950/50 text-red-400 border-red-500/40"
                                  : "bg-emerald-950/50 text-emerald-400 border-emerald-500/40"
                              }`}
                            >
                              {r.certificate.emudhraVulnerabilityCheck.keyGenerationStatus}
                            </span>
                          </td>

                          {/* Headers */}
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1 text-[10px] font-code">
                              <span
                                className={`px-1 py-0.5 border ${
                                  r.securityHeaders.hsts.present
                                    ? "text-emerald-400 border-emerald-500/40 bg-emerald-950/30"
                                    : "text-zinc-500 border-zinc-700 bg-zinc-900/50"
                                }`}
                                title={
                                  r.securityHeaders.hsts.present ? "HSTS Present" : "HSTS Missing"
                                }
                              >
                                HSTS
                              </span>
                              <span
                                className={`px-1 py-0.5 border ${
                                  r.securityHeaders.csp.present
                                    ? "text-emerald-400 border-emerald-500/40 bg-emerald-950/30"
                                    : "text-zinc-500 border-zinc-700 bg-zinc-900/50"
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
                                className="rounded-none border-amber-500/40 bg-black/60 h-7 text-[10px] font-code text-amber-300 hover:bg-amber-500 hover:text-black transition-colors"
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
                        className="bg-red-950/20 hover:bg-red-950/30 transition-colors"
                      >
                        <td className="py-3 px-3 font-semibold text-red-400">
                          <div className="flex items-center gap-1.5">
                            <XCircle size={14} className="shrink-0" />
                            <span className="truncate max-w-[180px] font-code">{item.target}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center text-zinc-500 font-code">-</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 text-[9px] font-pixel uppercase tracking-wider border bg-red-950/60 text-red-400 border-red-500/40">
                            FAILED
                          </span>
                        </td>
                        <td colSpan={4} className="py-3 px-3 text-red-300/80 text-[10px] font-code">
                          {item.error || "TLS socket timeout or unresolved address"}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {onInspectDomain && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => onInspectDomain(item.target)}
                              className="rounded-none border-amber-500/30 bg-black/60 h-7 text-[10px] font-code text-zinc-300 hover:text-white"
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
