export interface CommunityThreatReport {
  id: string;
  domain: string;
  vector: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  reportedAt: string;
  votes: number;
  reporter: string;
  notes: string;
  tags: string[];
  status: "Verified Malicious" | "Under Investigation" | "Flagged by AI";
}

const threatStore: CommunityThreatReport[] = [];

export function getAllThreats(): CommunityThreatReport[] {
  return [...threatStore].sort((a, b) => b.votes - a.votes);
}

export function addThreatReport(data: {
  domain: string;
  vector: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  reporter?: string;
  notes: string;
  tags?: string[];
}): CommunityThreatReport {
  const cleanDomain =
    data.domain
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\//i, "")
      .split("/")[0] || data.domain;

  const existing = threatStore.find((t) => t.domain.toLowerCase() === cleanDomain);
  if (existing) {
    existing.votes += 1;
    return existing;
  }

  const newReport: CommunityThreatReport = {
    id: `rep-${Date.now().toString(36)}`,
    domain: cleanDomain,
    vector: data.vector || "Suspicious Web Portal",
    severity: data.severity || "High",
    reportedAt: new Date().toISOString(),
    votes: 1,
    reporter: data.reporter?.trim() || "Community Analyst",
    notes: data.notes?.trim() || "User-submitted suspicious domain flagged for verification.",
    tags: data.tags && data.tags.length > 0 ? data.tags : ["Community Report", "Pending Triage"],
    status: "Flagged by AI",
  };

  threatStore.unshift(newReport);
  return newReport;
}

export function voteThreatReport(id: string, delta: number): CommunityThreatReport | null {
  const item = threatStore.find((t) => t.id === id);
  if (!item) return null;
  item.votes = Math.max(0, item.votes + delta);
  return item;
}
