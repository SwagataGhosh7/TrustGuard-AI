import { describe, expect, it } from "vitest";
import { addThreatReport, getAllThreats, voteThreatReport } from "@/server/threat-store";

describe("Community Threat Store", () => {
  it("starts with no built-in threat reports", () => {
    const threats = getAllThreats();
    expect(threats).toEqual([]);
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
    const first = addThreatReport({
      domain: "vote-test.example",
      vector: "Suspicious Portal",
      severity: "High",
      notes: "Test report for voting.",
    });

    const previousVotes = first.votes;
    const updated = voteThreatReport(first.id, 1);
    expect(updated?.votes).toBe(previousVotes + 1);
  });
});
