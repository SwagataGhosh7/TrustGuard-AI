import { describe, expect, it } from "vitest";

import { isValidTargetUrl, normalizeTargetUrl, SCAN_DURATION_MS, SCAN_STEPS } from "@/lib/scan";

describe("TrustGuard scan flow", () => {
  it("keeps the requested scan duration at three seconds", () => {
    expect(SCAN_DURATION_MS).toBe(3000);
  });

  it("shows all four scan phases in the requested order", () => {
    expect(SCAN_STEPS).toEqual([
      "Extracting TLS certificates...",
      "Analyzing DOM heuristics...",
      "Checking Certificate Transparency logs...",
      "Validating eMudhra CA signatures...",
    ]);
  });

  it("adds HTTPS when a user enters a bare domain", () => {
    expect(normalizeTargetUrl("example.com")).toBe("https://example.com/");
  });

  it("preserves a valid HTTP address", () => {
    expect(normalizeTargetUrl("http://example.com/path")).toBe("http://example.com/path");
  });

  it("rejects malformed addresses", () => {
    expect(normalizeTargetUrl("not a URL")).toBeNull();
  });

  it("rejects non-web protocols", () => {
    expect(normalizeTargetUrl("ftp://example.com")).toBeNull();
  });

  it("accepts domain-shaped targets and rejects plain words", () => {
    expect(isValidTargetUrl("www.example.com")).toBe(true);
    expect(isValidTargetUrl("https://example.com/login")).toBe(true);
    expect(isValidTargetUrl("cat")).toBe(false);
    expect(isValidTargetUrl("i am jack")).toBe(false);
  });
});
