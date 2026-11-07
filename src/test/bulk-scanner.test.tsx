import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { BulkUrlScanner } from "@/components/BulkUrlScanner";

const mockBulkResponse = {
  count: 2,
  results: [
    {
      target: "github.com",
      success: true,
      result: {
        domain: "github.com",
        targetUrl: "https://github.com",
        scannedAt: "2026-11-07T08:00:00.000Z",
        scanDurationMs: 120,
        dns: {
          ipAddress: "140.82.121.4",
          hasMx: true,
          mxRecords: [],
          hasSpf: true,
          hasDmarc: true,
        },
        certificate: {
          subject: { CN: "github.com" },
          issuer: { CN: "DigiCert TLS Hybrid ECC SHA384 2020 CA1", O: "DigiCert Inc" },
          validFrom: "2026-01-01",
          validTo: "2027-01-01",
          daysRemaining: 180,
          isExpired: false,
          fingerprint256: "AA:BB:CC",
          serialNumber: "123456",
          bits: 256,
          keyAlgorithm: "ECDSA",
          cipherSuite: "TLS_AES_256_GCM_SHA384",
          protocol: "TLSv1.3",
          sans: ["github.com"],
          authorized: true,
          authorizationError: null,
          emudhraVulnerabilityCheck: {
            isVulnerable: false,
            severity: "NONE",
            keyGenerationStatus: "SECURE",
            reasons: [],
          },
          certificateTransparency: {
            logged: true,
            count: 35,
            sampleEntries: [],
          },
        },
        securityHeaders: {
          hsts: { present: true, score: 100 },
          csp: { present: true, score: 100 },
          xFrameOptions: { present: true, score: 100 },
          xContentTypeOptions: { present: true, score: 100 },
          referrerPolicy: { present: true, score: 100 },
          permissionsPolicy: { present: true, score: 100 },
          statusCode: 200,
          redirects: [],
          score: 100,
        },
        aiAnalysis: {
          threatScore: 8,
          riskLevel: "SAFE",
          primaryVector: "No Significant Anomalies Detected",
          confidenceScore: 98,
          summary: "Legitimate developer platform with valid modern ECDSA cryptography.",
          indicators: [],
          recommendations: [],
        },
      },
      error: null,
    },
    {
      target: "emudhra-auth-gateway-test.net",
      success: true,
      result: {
        domain: "emudhra-auth-gateway-test.net",
        targetUrl: "https://emudhra-auth-gateway-test.net",
        scannedAt: "2026-11-07T08:00:00.000Z",
        scanDurationMs: 190,
        dns: {
          ipAddress: "198.51.100.99",
          hasMx: false,
          mxRecords: [],
          hasSpf: false,
          hasDmarc: false,
        },
        certificate: {
          subject: { CN: "emudhra-auth-gateway-test.net" },
          issuer: { CN: "eMudhra Sub-CA 2024", O: "eMudhra Limited" },
          validFrom: "2026-01-01",
          validTo: "2026-12-01",
          daysRemaining: 40,
          isExpired: false,
          fingerprint256: "CC:DD:EE",
          serialNumber: "998877",
          bits: 2048,
          keyAlgorithm: "RSA",
          cipherSuite: "TLS_AES_256_GCM_SHA384",
          protocol: "TLSv1.3",
          sans: ["emudhra-auth-gateway-test.net"],
          authorized: true,
          authorizationError: null,
          emudhraVulnerabilityCheck: {
            isVulnerable: true,
            severity: "HIGH",
            keyGenerationStatus: "VULNERABLE",
            reasons: ["eMudhra CA key generation vulnerability flagged"],
          },
          certificateTransparency: {
            logged: true,
            count: 3,
            sampleEntries: [],
          },
        },
        securityHeaders: {
          hsts: { present: false, score: 0 },
          csp: { present: false, score: 0 },
          xFrameOptions: { present: false, score: 0 },
          xContentTypeOptions: { present: true, score: 100 },
          referrerPolicy: { present: false, score: 0 },
          permissionsPolicy: { present: false, score: 0 },
          statusCode: 200,
          redirects: [],
          score: 20,
        },
        aiAnalysis: {
          threatScore: 78,
          riskLevel: "HIGH",
          primaryVector: "Weak CA Cryptographic Key Generation",
          confidenceScore: 92,
          summary: "Uses predictable eMudhra CA key parameters susceptible to impersonation.",
          indicators: ["eMudhra weak key pattern"],
          recommendations: ["Revoke immediately"],
        },
      },
      error: null,
    },
  ],
};

describe("BulkUrlScanner Component", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/api/bulk-scan")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockBulkResponse),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      }),
    );
  });

  it("renders bulk scanner header and preset buttons", () => {
    render(<BulkUrlScanner />);
    expect(screen.getByText("Bulk URL Threat Assessment & Comparison")).toBeInTheDocument();
    expect(screen.getByText("Run Concurrent Bulk Scan")).toBeInTheDocument();
    expect(screen.getByText("Banking Targets")).toBeInTheDocument();
    expect(screen.getByText("Critical Infra")).toBeInTheDocument();
  });

  it("loads preset domains when preset button clicked", () => {
    render(<BulkUrlScanner />);
    const bankingBtn = screen.getByRole("button", { name: /Banking Targets/i });
    fireEvent.click(bankingBtn);

    const textarea = screen.getByPlaceholderText(/example.com/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain("paypal.com");
    expect(textarea.value).toContain("chase.com");
  });

  it("executes bulk scan and displays comparison table", async () => {
    render(<BulkUrlScanner />);
    const scanBtn = screen.getByRole("button", { name: /Run Concurrent Bulk Scan/i });
    fireEvent.click(scanBtn);

    await waitFor(() => {
      expect(screen.getByText("github.com")).toBeInTheDocument();
      expect(screen.getByText("emudhra-auth-gateway-test.net")).toBeInTheDocument();
      expect(screen.getByText("SAFE")).toBeInTheDocument();
      expect(screen.getByText("HIGH")).toBeInTheDocument();
      expect(screen.getByText("Total Audited Targets")).toBeInTheDocument();
    });
  });

  it("triggers inspect callback when inspect button clicked", async () => {
    const handleInspect = vi.fn();
    render(<BulkUrlScanner onInspectDomain={handleInspect} />);
    const scanBtn = screen.getByRole("button", { name: /Run Concurrent Bulk Scan/i });
    fireEvent.click(scanBtn);

    await waitFor(() => {
      expect(screen.getByText("github.com")).toBeInTheDocument();
    });

    const inspectButtons = screen.getAllByRole("button", { name: /Inspect/i });
    expect(inspectButtons.length).toBeGreaterThan(0);
    // Since default sorting is descending threat score (score 78 > score 8), index 0 is emudhra-auth-gateway-test.net
    fireEvent.click(inspectButtons[0]!);

    expect(handleInspect).toHaveBeenCalledWith("emudhra-auth-gateway-test.net", expect.any(Object));
  });

  it("filters results by risk level", async () => {
    render(<BulkUrlScanner />);
    const scanBtn = screen.getByRole("button", { name: /Run Concurrent Bulk Scan/i });
    fireEvent.click(scanBtn);

    await waitFor(() => {
      expect(screen.getByText("github.com")).toBeInTheDocument();
    });

    const highFilterBtn = screen.getByRole("button", { name: /^high$/i });
    fireEvent.click(highFilterBtn);

    // github.com (SAFE) should be hidden, emudhra-auth-gateway-test.net (HIGH) remains visible
    expect(screen.queryByText("github.com")).not.toBeInTheDocument();
    expect(screen.getByText("emudhra-auth-gateway-test.net")).toBeInTheDocument();
  });
});
