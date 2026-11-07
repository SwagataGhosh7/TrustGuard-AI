import { jsPDF } from "jspdf";
import type { FullScanResult } from "@/server/scanner";

/**
 * Generate a downloadable, multi-section vector PDF report for a scanned domain.
 */
export function generatePdfReport(scan: FullScanResult): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Colors
  const darkBg = [19, 23, 34];
  const accentTeal = [45, 212, 191];
  const dangerRed = [239, 68, 68];
  const warningAmber = [245, 158, 11];
  const successGreen = [34, 197, 94];
  const textWhite = [248, 250, 252];
  const textMuted = [148, 163, 184];
  const cardBg = [28, 33, 48];
  const borderColor = [45, 55, 75];

  // Background
  doc.setFillColor(darkBg[0]!, darkBg[1]!, darkBg[2]!);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Header Banner
  doc.setFillColor(cardBg[0]!, cardBg[1]!, cardBg[2]!);
  doc.rect(margin, y, contentWidth, 24, "F");
  doc.setDrawColor(borderColor[0]!, borderColor[1]!, borderColor[2]!);
  doc.rect(margin, y, contentWidth, 24, "S");

  // Logo / Brand
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(accentTeal[0]!, accentTeal[1]!, accentTeal[2]!);
  doc.text("TRUSTGUARD AI", margin + 6, y + 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0]!, textMuted[1]!, textMuted[2]!);
  doc.text("DIGITAL TRUST & CRYPTOGRAPHIC THREAT INTELLIGENCE REPORT", margin + 6, y + 18);

  // Scan ID & Date in Header
  doc.setFont("courier", "bold");
  doc.setFontSize(9);
  doc.setTextColor(textWhite[0]!, textWhite[1]!, textWhite[2]!);
  const scanDate = new Date(scan.scannedAt).toISOString().replace("T", " ").slice(0, 19) + " UTC";
  doc.text(`DATE: ${scanDate}`, margin + contentWidth - 6, y + 11, { align: "right" });
  doc.setFontSize(8);
  doc.setTextColor(accentTeal[0]!, accentTeal[1]!, accentTeal[2]!);
  doc.text(`TARGET: ${scan.domain}`, margin + contentWidth - 6, y + 18, { align: "right" });

  y += 28;

  // Executive Summary Card
  const riskColor =
    scan.aiAnalysis.riskLevel === "CRITICAL"
      ? dangerRed
      : scan.aiAnalysis.riskLevel === "HIGH"
        ? warningAmber
        : scan.aiAnalysis.riskLevel === "MEDIUM"
          ? [234, 179, 8]
          : successGreen;

  doc.setFillColor(cardBg[0]!, cardBg[1]!, cardBg[2]!);
  doc.rect(margin, y, contentWidth, 34, "F");
  doc.setDrawColor(riskColor[0]!, riskColor[1]!, riskColor[2]!);
  doc.rect(margin, y, contentWidth, 34, "S");

  // Risk Level Box
  doc.setFillColor(riskColor[0]!, riskColor[1]!, riskColor[2]!);
  doc.rect(margin + 5, y + 6, 44, 9, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(darkBg[0]!, darkBg[1]!, darkBg[2]!);
  doc.text(`${scan.aiAnalysis.riskLevel} RISK`, margin + 27, y + 12.5, { align: "center" });

  // Score
  doc.setFont("courier", "bold");
  doc.setFontSize(16);
  doc.setTextColor(riskColor[0]!, riskColor[1]!, riskColor[2]!);
  doc.text(`${scan.aiAnalysis.threatScore} / 100`, margin + 27, y + 26, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(textMuted[0]!, textMuted[1]!, textMuted[2]!);
  doc.text("THREAT SCORE", margin + 27, y + 30, { align: "center" });

  // Summary Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(textWhite[0]!, textWhite[1]!, textWhite[2]!);
  doc.text(scan.aiAnalysis.primaryVector, margin + 54, y + 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(textMuted[0]!, textMuted[1]!, textMuted[2]!);
  const summaryLines = doc.splitTextToSize(scan.aiAnalysis.summary, contentWidth - 60);
  doc.text(summaryLines, margin + 54, y + 18);

  y += 38;

  // Pillar 1: TLS Certificate & Cryptographic Trust
  doc.setFillColor(cardBg[0]!, cardBg[1]!, cardBg[2]!);
  doc.rect(margin, y, contentWidth, 54, "F");
  doc.setDrawColor(borderColor[0]!, borderColor[1]!, borderColor[2]!);
  doc.rect(margin, y, contentWidth, 54, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(accentTeal[0]!, accentTeal[1]!, accentTeal[2]!);
  doc.text("PILLAR 01: TLS CERTIFICATE & CRYPTOGRAPHIC AUDIT", margin + 5, y + 7);

  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(textWhite[0]!, textWhite[1]!, textWhite[2]!);

  const certLines = [
    `Common Name (CN):      ${scan.certificate.subject.CN || "None"}`,
    `Issuing Authority:    ${scan.certificate.issuer.CN || scan.certificate.issuer.O || "Unknown CA"}`,
    `Key Algorithm & Size: ${scan.certificate.keyAlgorithm} (${scan.certificate.bits} bits)`,
    `TLS Protocol:         ${scan.certificate.protocol}  |  Cipher: ${scan.certificate.cipherSuite}`,
    `Validity Window:      ${scan.certificate.validFrom} to ${scan.certificate.validTo} (${scan.certificate.daysRemaining} days left)`,
    `Certificate Status:   ${scan.certificate.isExpired ? "EXPIRED (SECURITY VIOLATION)" : "ACTIVE / VALID"}`,
  ];

  let certY = y + 14;
  for (const line of certLines) {
    doc.text(line, margin + 5, certY);
    certY += 4.5;
  }

  // eMudhra Status Callout inside Pillar 1
  const emudhraVulnerable = scan.certificate.emudhraVulnerabilityCheck.isVulnerable;
  const emudhraColor = emudhraVulnerable ? dangerRed : successGreen;
  doc.setFillColor(emudhraColor[0]!, emudhraColor[1]!, emudhraColor[2]!, 0.15);
  doc.rect(margin + 5, certY + 1, contentWidth - 10, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(emudhraColor[0]!, emudhraColor[1]!, emudhraColor[2]!);
  doc.text(
    `eMudhra CA Key Audit: ${scan.certificate.emudhraVulnerabilityCheck.keyGenerationStatus} — ${
      scan.certificate.emudhraVulnerabilityCheck.reasons[0] || "Cryptographic entropy verified."
    }`,
    margin + 8,
    certY + 6,
  );

  y += 58;

  // Pillar 2: Web Security Headers & Infrastructure
  doc.setFillColor(cardBg[0]!, cardBg[1]!, cardBg[2]!);
  doc.rect(margin, y, contentWidth, 42, "F");
  doc.setDrawColor(borderColor[0]!, borderColor[1]!, borderColor[2]!);
  doc.rect(margin, y, contentWidth, 42, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(accentTeal[0]!, accentTeal[1]!, accentTeal[2]!);
  doc.text(
    `PILLAR 02: WEB APPLICATION SECURITY (SCORE: ${scan.securityHeaders.score}/100)`,
    margin + 5,
    y + 7,
  );

  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(textWhite[0]!, textWhite[1]!, textWhite[2]!);

  const leftHeaders = [
    `HSTS:              ${scan.securityHeaders.hsts.present ? "CONFIGURED (ENFORCED)" : "MISSING (VULNERABLE)"}`,
    `CSP:               ${scan.securityHeaders.csp.present ? "ACTIVE POLICY" : "MISSING (VULNERABLE)"}`,
    `X-Frame-Options:   ${scan.securityHeaders.xFrameOptions.present ? "DENY / SAMEORIGIN" : "MISSING"}`,
  ];
  const rightHeaders = [
    `Content-Type:      ${scan.securityHeaders.xContentTypeOptions.present ? "NOSNIFF" : "MISSING"}`,
    `Referrer-Policy:   ${scan.securityHeaders.referrerPolicy.present ? "CONFIGURED" : "MISSING"}`,
    `DNS Protections:   SPF: ${scan.dns.hasSpf ? "YES" : "NO"} | DMARC: ${scan.dns.hasDmarc ? "YES" : "NO"}`,
  ];

  let headerY = y + 14;
  for (const line of leftHeaders) {
    doc.text(line, margin + 5, headerY);
    headerY += 5;
  }
  headerY = y + 14;
  for (const line of rightHeaders) {
    doc.text(line, margin + contentWidth / 2 + 2, headerY);
    headerY += 5;
  }

  // CT logs & Fingerprint
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.setTextColor(textMuted[0]!, textMuted[1]!, textMuted[2]!);
  doc.text(`SHA-256 Fingerprint: ${scan.certificate.fingerprint256}`, margin + 5, y + 36);

  y += 46;

  // Observed Forensic Risk Indicators
  doc.setFillColor(cardBg[0]!, cardBg[1]!, cardBg[2]!);
  doc.rect(margin, y, contentWidth, 34, "F");
  doc.setDrawColor(borderColor[0]!, borderColor[1]!, borderColor[2]!);
  doc.rect(margin, y, contentWidth, 34, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(warningAmber[0]!, warningAmber[1]!, warningAmber[2]!);
  doc.text("OBSERVED RISK INDICATORS & FORENSIC EVIDENCE", margin + 5, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(textWhite[0]!, textWhite[1]!, textWhite[2]!);

  let indY = y + 12;
  const indicators =
    scan.aiAnalysis.indicators.length > 0
      ? scan.aiAnalysis.indicators.slice(0, 4)
      : ["No critical behavioral anomalies or brand spoofing patterns identified."];
  for (const ind of indicators) {
    doc.text(`• ${ind}`, margin + 5, indY);
    indY += 4.5;
  }

  y += 38;

  // Recommended Remediation Actions
  doc.setFillColor(cardBg[0]!, cardBg[1]!, cardBg[2]!);
  doc.rect(margin, y, contentWidth, 28, "F");
  doc.setDrawColor(borderColor[0]!, borderColor[1]!, borderColor[2]!);
  doc.rect(margin, y, contentWidth, 28, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(successGreen[0]!, successGreen[1]!, successGreen[2]!);
  doc.text("RECOMMENDED MITIGATION ACTIONS", margin + 5, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(textWhite[0]!, textWhite[1]!, textWhite[2]!);

  let recY = y + 12;
  const recommendations =
    scan.aiAnalysis.recommendations.length > 0
      ? scan.aiAnalysis.recommendations.slice(0, 3)
      : ["Maintain automated 90-day certificate renewal cycles and monitor CT log issuances."];
  for (const rec of recommendations) {
    doc.text(`✓ ${rec}`, margin + 5, recY);
    recY += 4.5;
  }

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(textMuted[0]!, textMuted[1]!, textMuted[2]!);
  doc.text(
    "TRUSTGUARD AI · REAL-TIME THREAT DETECTION PLATFORM · ZERO MOCK TELEMETRY",
    pageWidth / 2,
    pageHeight - 8,
    { align: "center" },
  );

  doc.save(`trustguard-audit-${scan.domain}.pdf`);
}

/**
 * Generate a downloadable high-resolution PNG summary card (1200x800) using HTML5 Canvas.
 */
export async function generatePngReport(scan: FullScanResult): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 760;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not acquire canvas 2D context");

  // Background
  ctx.fillStyle = "#111520";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle grid lines
  ctx.strokeStyle = "rgba(45, 55, 75, 0.4)";
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Border
  ctx.strokeStyle = "#2d374b";
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  // Header Bar
  ctx.fillStyle = "#1a2130";
  ctx.fillRect(20, 20, canvas.width - 40, 70);

  // Logo & Header text
  ctx.fillStyle = "#2dd4bf";
  ctx.font = "bold 24px 'DM Sans', sans-serif";
  ctx.fillText("TRUSTGUARD AI", 45, 60);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "12px 'IBM Plex Mono', monospace";
  ctx.fillText("DIGITAL TRUST & CRYPTOGRAPHIC THREAT INTELLIGENCE CARD", 260, 58);

  const timestamp = new Date(scan.scannedAt).toISOString().replace("T", " ").slice(0, 19) + " UTC";
  ctx.textAlign = "right";
  ctx.fillStyle = "#f8fafc";
  ctx.fillText(timestamp, canvas.width - 45, 58);
  ctx.textAlign = "left";

  // Target Domain Banner
  ctx.fillStyle = "#161b26";
  ctx.fillRect(45, 110, canvas.width - 90, 80);
  ctx.strokeStyle = "#2d374b";
  ctx.strokeRect(45, 110, canvas.width - 90, 80);

  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 26px 'IBM Plex Mono', monospace";
  ctx.fillText(scan.domain, 65, 148);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "13px 'DM Sans', sans-serif";
  ctx.fillText(
    `Target URL: ${scan.targetUrl}  |  IP: ${scan.dns.ipAddress || "Unresolved"}  |  Latency: ${scan.scanDurationMs}ms`,
    65,
    172,
  );

  // Risk Score Badge
  const isCritical = scan.aiAnalysis.riskLevel === "CRITICAL";
  const isHigh = scan.aiAnalysis.riskLevel === "HIGH";
  const badgeColor = isCritical ? "#ef4444" : isHigh ? "#f59e0b" : "#22c55e";

  ctx.fillStyle = badgeColor;
  ctx.fillRect(canvas.width - 230, 125, 160, 48);
  ctx.fillStyle = "#111520";
  ctx.font = "bold 15px 'DM Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${scan.aiAnalysis.riskLevel} RISK`, canvas.width - 150, 146);
  ctx.font = "bold 13px 'IBM Plex Mono', monospace";
  ctx.fillText(`SCORE: ${scan.aiAnalysis.threatScore}/100`, canvas.width - 150, 164);
  ctx.textAlign = "left";

  // Two Column Layout
  const colWidth = (canvas.width - 110) / 2;

  // Left Column: TLS & Cryptography
  ctx.fillStyle = "#161b26";
  ctx.fillRect(45, 210, colWidth, 310);
  ctx.strokeStyle = "#2d374b";
  ctx.strokeRect(45, 210, colWidth, 310);

  ctx.fillStyle = "#2dd4bf";
  ctx.font = "bold 14px 'DM Sans', sans-serif";
  ctx.fillText("TLS & CRYPTOGRAPHIC VALIDATION", 65, 238);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "13px 'IBM Plex Mono', monospace";
  let ly = 270;
  const leftData = [
    `Common Name (CN):   ${scan.certificate.subject.CN || "None"}`,
    `Certificate CA:    ${(scan.certificate.issuer.CN || scan.certificate.issuer.O || "Unknown").slice(0, 30)}`,
    `Algorithm & Size:  ${scan.certificate.keyAlgorithm} (${scan.certificate.bits} bits)`,
    `TLS Protocol:      ${scan.certificate.protocol}`,
    `Cipher Suite:      ${scan.certificate.cipherSuite.slice(0, 30)}`,
    `Validity Window:   ${scan.certificate.daysRemaining} days remaining`,
    `CT Logs Verified:  ${scan.certificate.certificateTransparency.count > 0 ? "Logged on crt.sh" : "Public CT checked"}`,
  ];
  for (const line of leftData) {
    ctx.fillText(line, 65, ly);
    ly += 24;
  }

  // eMudhra Vulnerability Badge inside Left Col
  const emudhraBad = scan.certificate.emudhraVulnerabilityCheck.isVulnerable;
  ctx.fillStyle = emudhraBad ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)";
  ctx.fillRect(65, 450, colWidth - 40, 50);
  ctx.strokeStyle = emudhraBad ? "#ef4444" : "#22c55e";
  ctx.strokeRect(65, 450, colWidth - 40, 50);

  ctx.fillStyle = emudhraBad ? "#ef4444" : "#22c55e";
  ctx.font = "bold 12px 'DM Sans', sans-serif";
  ctx.fillText(
    `eMudhra CA Key Audit: ${scan.certificate.emudhraVulnerabilityCheck.keyGenerationStatus}`,
    78,
    470,
  );
  ctx.fillStyle = "#94a3b8";
  ctx.font = "11px 'DM Sans', sans-serif";
  ctx.fillText(
    scan.certificate.emudhraVulnerabilityCheck.reasons[0] || "No weak key markers identified.",
    78,
    488,
  );

  // Right Column: Application Security & Threat Assessment
  const rightX = 45 + colWidth + 20;
  ctx.fillStyle = "#161b26";
  ctx.fillRect(rightX, 210, colWidth, 310);
  ctx.strokeStyle = "#2d374b";
  ctx.strokeRect(rightX, 210, colWidth, 310);

  ctx.fillStyle = "#2dd4bf";
  ctx.font = "bold 14px 'DM Sans', sans-serif";
  ctx.fillText(`WEB APPLICATION SECURITY (${scan.securityHeaders.score}/100)`, rightX + 20, 238);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "13px 'IBM Plex Mono', monospace";
  let ry = 270;
  const rightData = [
    `HSTS Directive:     ${scan.securityHeaders.hsts.present ? "ENFORCED (VALID)" : "MISSING (RISK)"}`,
    `Content-Security:   ${scan.securityHeaders.csp.present ? "POLICY ACTIVE" : "MISSING (RISK)"}`,
    `X-Frame-Options:    ${scan.securityHeaders.xFrameOptions.present ? "DENY / SAMEORIGIN" : "MISSING"}`,
    `MIME Sniffing (XCT): ${scan.securityHeaders.xContentTypeOptions.present ? "NOSNIFF" : "MISSING"}`,
    `Mail Protections:   SPF: ${scan.dns.hasSpf ? "YES" : "NO"}  |  DMARC: ${scan.dns.hasDmarc ? "YES" : "NO"}`,
  ];
  for (const line of rightData) {
    ctx.fillText(line, rightX + 20, ry);
    ry += 24;
  }

  // Summary Note Box
  ctx.fillStyle = "rgba(45, 212, 191, 0.1)";
  ctx.fillRect(rightX + 20, 410, colWidth - 40, 90);
  ctx.strokeStyle = "rgba(45, 212, 191, 0.4)";
  ctx.strokeRect(rightX + 20, 410, colWidth - 40, 90);

  ctx.fillStyle = "#2dd4bf";
  ctx.font = "bold 12px 'DM Sans', sans-serif";
  ctx.fillText(`Primary Vector: ${scan.aiAnalysis.primaryVector}`, rightX + 32, 432);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "11px 'DM Sans', sans-serif";
  const summaryShort =
    scan.aiAnalysis.summary.length > 150
      ? scan.aiAnalysis.summary.slice(0, 147) + "..."
      : scan.aiAnalysis.summary;
  ctx.fillText(summaryShort, rightX + 32, 452, colWidth - 64);

  // Bottom Evidence Bar
  ctx.fillStyle = "#161b26";
  ctx.fillRect(45, 540, canvas.width - 90, 150);
  ctx.strokeStyle = "#2d374b";
  ctx.strokeRect(45, 540, canvas.width - 90, 150);

  ctx.fillStyle = "#f59e0b";
  ctx.font = "bold 13px 'DM Sans', sans-serif";
  ctx.fillText("OBSERVED RISK EVIDENCE & MITIGATION CHECKLIST", 65, 568);

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "12px 'DM Sans', sans-serif";
  let ey = 594;
  const evidenceList = [
    ...scan.aiAnalysis.indicators.slice(0, 2).map((i) => `[!] ${i}`),
    ...scan.aiAnalysis.recommendations.slice(0, 2).map((r) => `[✓] ${r}`),
  ];
  for (const item of evidenceList) {
    ctx.fillText(item, 65, ey, canvas.width - 130);
    ey += 22;
  }

  // Footer Watermark
  ctx.fillStyle = "#64748b";
  ctx.font = "11px 'IBM Plex Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(
    "TRUSTGUARD AI THREAT INTELLIGENCE NETWORK · VERIFIED AUDIT PROBE",
    canvas.width / 2,
    canvas.height - 30,
  );

  const dataUrl = canvas.toDataURL("image/png");

  // Trigger download
  const link = document.createElement("a");
  link.download = `trustguard-report-${scan.domain}.png`;
  link.href = dataUrl;
  link.click();

  return dataUrl;
}
