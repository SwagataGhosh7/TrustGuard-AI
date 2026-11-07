import { describe, expect, it } from "vitest";
import { addThreatReport, getAllThreats, voteThreatReport } from "@/server/threat-store";

describe("Community Threat Store", () => {
  it("retrieves seeded threats sorted by votes", () => {
    const threats = getAllThreats();
    expect(threats.length).toBeGreaterThan(0);
    expect(threats[0]?.votes).toBeGreaterThanOrEqual(threats[1]?.votes ?? 0);
  });

  it("adds a new threat report with clean domain and initial votes", () => {
    const newReport = addThreatReport({
      domain: "https://suspicious-portal-test.org/login",
      vector: "Credential Theft",
      severity: "High",
      notes: "Test reporting suspicious banking landing page.",
    });

    expect(newReport.domain).toBe("suspicious-portal-test.org");
    expect(newReport.votes).toBe(1);
    expect(newReport.severity).toBe("High");
  });

  it("increments upvotes on a threat report", () => {
    const threats = getAllThreats();
    const first = threats[0];
    if (!first) throw new Error("No threats found");

    const previousVotes = first.votes;
    const updated = voteThreatReport(first.id, 1);
    expect(updated?.votes).toBe(previousVotes + 1);
  });
});
