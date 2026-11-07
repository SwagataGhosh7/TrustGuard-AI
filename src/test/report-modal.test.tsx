import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ShareReportModal } from "@/components/ShareReportModal";
import type { FullScanResult } from "@/server/scanner";

vi.mock("@/lib/report-generator", () => ({
  generatePdfReport: vi.fn(),
  generatePngReport: vi.fn().mockResolvedValue(undefined),
}));

import { generatePdfReport, generatePngReport } from "@/lib/report-generator";

const mockScanResult: FullScanResult = {
  domain: "suspicious-bank-login.com",
  targetUrl: "https://suspicious-bank-login.com",
  scannedAt: "2026-11-07T08:00:00.000Z",
  scanDurationMs: 245,
  dns: {
    ipAddress: "198.51.100.42",
    hasMx: true,
    mxRecords: ["mail.suspicious-bank-login.com"],
    hasSpf: false,
    hasDmarc: false,
  },
  certificate: {
    subject: { CN: "suspicious-bank-login.com", O: "Target Mimic" },
    issuer: { CN: "eMudhra Sub-CA 2024", O: "eMudhra Limited" },
    validFrom: "2026-01-01T00:00:00.000Z",
    validTo: "2027-01-01T00:00:00.000Z",
    daysRemaining: 55,
    isExpired: false,
    fingerprint256: "AA:BB:CC:DD:EE:FF:11:22:33:44:55:66:77:88:99:00",
    serialNumber: "A1B2C3D4E5F6",
    bits: 2048,
    keyAlgorithm: "RSA",
    cipherSuite: "TLS_AES_256_GCM_SHA384",
    protocol: "TLSv1.3",
    sans: ["suspicious-bank-login.com"],
    authorized: true,
    authorizationError: null,
    emudhraVulnerabilityCheck: {
      isVulnerable: true,
      severity: "HIGH",
      keyGenerationStatus: "VULNERABLE",
      reasons: ["Potentially affected by eMudhra predictable CA key generation pattern"],
    },
    certificateTransparency: {
      logged: true,
      count: 2,
      sampleEntries: [
        {
          id: 1001,
          issuer_name: "eMudhra Sub-CA 2024",
          entry_timestamp: "2026-01-02T10:00:00Z",
        },
      ],
    },
  },
  securityHeaders: {
    hsts: { present: false, score: 0 },
    csp: { present: false, score: 0 },
    xFrameOptions: { present: false, score: 0 },
    xContentTypeOptions: { present: true, value: "nosniff", score: 100 },
    referrerPolicy: { present: true, value: "strict-origin", score: 100 },
    permissionsPolicy: { present: false, score: 0 },
    statusCode: 200,
    redirects: [],
    score: 30,
  },
  aiAnalysis: {
    threatScore: 88,
    riskLevel: "CRITICAL",
    primaryVector: "Brand Impersonation & Weak CA Cryptography",
    confidenceScore: 94,
    summary:
      "Website mimics secure banking interface and utilizes a certificate authority key potentially subject to predictable generation flaws.",
    indicators: [
      "eMudhra CA key generation vulnerability flagged",
      "Missing critical HTTP Strict-Transport-Security (HSTS) header",
      "Missing Content-Security-Policy (CSP) protection",
    ],
    recommendations: [
      "Immediately revoke and re-issue certificate with hardened RNG",
      "Deploy HSTS header with max-age=31536000",
    ],
  },
};

describe("ShareReportModal Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <ShareReportModal isOpen={false} onClose={vi.fn()} scanResult={mockScanResult} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders report preview and download options when open", () => {
    render(<ShareReportModal isOpen={true} onClose={vi.fn()} scanResult={mockScanResult} />);

    expect(screen.getByText("Download & Share Audit Report")).toBeInTheDocument();
    expect(screen.getByText("suspicious-bank-login.com")).toBeInTheDocument();
    expect(screen.getByText("Download PDF Report")).toBeInTheDocument();
    expect(screen.getByText("Download PNG Card")).toBeInTheDocument();
    expect(screen.getByText("Share Link")).toBeInTheDocument();
    expect(screen.getByText("Copy Text Summary")).toBeInTheDocument();
  });

  it("calls generatePdfReport when clicking Download PDF Report", () => {
    render(<ShareReportModal isOpen={true} onClose={vi.fn()} scanResult={mockScanResult} />);

    const pdfBtn = screen.getByRole("button", { name: /Download PDF Report/i });
    fireEvent.click(pdfBtn);

    expect(generatePdfReport).toHaveBeenCalledWith(mockScanResult);
  });

  it("calls generatePngReport when clicking Download PNG Card", () => {
    render(<ShareReportModal isOpen={true} onClose={vi.fn()} scanResult={mockScanResult} />);

    const pngBtn = screen.getByRole("button", { name: /Download PNG Card/i });
    fireEvent.click(pngBtn);

    expect(generatePngReport).toHaveBeenCalledWith(mockScanResult);
  });

  it("calls onClose when close button is clicked", () => {
    const handleClose = vi.fn();
    render(<ShareReportModal isOpen={true} onClose={handleClose} scanResult={mockScanResult} />);

    const closeBtn = screen.getByRole("button", { name: /Close modal/i });
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalled();
  });
});
