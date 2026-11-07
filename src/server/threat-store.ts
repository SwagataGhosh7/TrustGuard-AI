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

const threatStore: CommunityThreatReport[] = [
  {
    id: "rep-001",
    domain: "secure-login-hdfc-update.com",
    vector: "Credential Theft & Brand Impersonation",
    severity: "Critical",
    reportedAt: "2026-11-06T14:32:00Z",
    votes: 42,
    reporter: "SecOps_Falcon",
    notes:
      "Direct clone of net banking portal requesting OTP and debit card PIN. Hosted on bulletproof ASN.",
    tags: ["Banking Phishing", "Credential Theft", "Homoglyph"],
    status: "Verified Malicious",
  },
  {
    id: "rep-002",
    domain: "emudhra-auth-gateway-test.net",
    vector: "eMudhra CA Weak Key Generation",
    severity: "Critical",
    reportedAt: "2026-11-05T09:15:00Z",
    votes: 38,
    reporter: "CryptoAudit_Lab",
    notes:
      "Demonstrates weak entropy in RSA modulus generation linked to eMudhra CA key generation vulnerability incident.",
    tags: ["eMudhra", "Weak RSA", "CA Compromise", "TLS Incident"],
    status: "Verified Malicious",
  },
  {
    id: "rep-003",
    domain: "paypaI-verify-account.net",
    vector: "Punycode & Brand Spoofing",
    severity: "Critical",
    reportedAt: "2026-11-04T18:40:00Z",
    votes: 29,
    reporter: "ThreatHunter99",
    notes:
      "Uses uppercase 'I' to mimic lowercase 'l' in PayPal. Harvests login credentials and recovery questions.",
    tags: ["Punycode", "Phishing", "Payment Fraud"],
    status: "Verified Malicious",
  },
  {
    id: "rep-004",
    domain: "accounts-google-auth.co",
    vector: "Fraudulent TLS & OAuth Phishing",
    severity: "High",
    reportedAt: "2026-11-03T11:20:00Z",
    votes: 21,
    reporter: "CertTracker_Bot",
    notes:
      "Fake SSO prompt attempting to steal Google Workspace session cookies. Self-signed TLS fallback.",
    tags: ["OAuth Phishing", "Fake SSO", "Untrusted CA"],
    status: "Verified Malicious",
  },
  {
    id: "rep-005",
    domain: "microsoft-security-check.io",
    vector: "Fake Security Alert & Malware Dropper",
    severity: "High",
    reportedAt: "2026-11-02T16:05:00Z",
    votes: 16,
    reporter: "EnterpriseDefense",
    notes:
      "Deceptive popups warning user of virus infection and directing to download malicious remote-support exe.",
    tags: ["Tech Support Scam", "Malware Dropper"],
    status: "Flagged by AI",
  },
  {
    id: "rep-006",
    domain: "sbi-kyc-pan-update.org",
    vector: "SMS Phishing (Smishing) Landing",
    severity: "Critical",
    reportedAt: "2026-11-01T08:12:00Z",
    votes: 34,
    reporter: "CyberCell_Alert",
    notes:
      "Promoted via bulk SMS claiming bank account suspension unless PAN card is uploaded immediately.",
    tags: ["KYC Phishing", "SMS Phishing", "Identity Theft"],
    status: "Verified Malicious",
  },
];

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
