import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { CommunityThreatFeed } from "@/components/CommunityThreatFeed";

const mockThreats = [
  {
    id: "test-1",
    domain: "phishing-target.com",
    vector: "Credential Theft",
    severity: "Critical",
    reportedAt: "2026-11-06T12:00:00Z",
    votes: 10,
    reporter: "AnalystA",
    notes: "Direct fake banking login page.",
    tags: ["phishing", "impersonation"],
    status: "Verified Malicious",
  },
  {
    id: "test-2",
    domain: "malware-dropper.net",
    vector: "Trojan Dropper",
    severity: "High",
    reportedAt: "2026-11-05T12:00:00Z",
    votes: 5,
    reporter: "AnalystB",
    notes: "Exploit kit delivering malware payload.",
    tags: ["malware", "exploit"],
    status: "Verified Malicious",
  },
];

describe("CommunityThreatFeed Component", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/api/threats/vote")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ ...mockThreats[0], votes: 11 }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockThreats),
        });
      }),
    );
  });

  it("renders the feed title and loads threat reports", async () => {
    render(<CommunityThreatFeed />);
    expect(screen.getByText("Community Threat Intelligence")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("phishing-target.com")).toBeInTheDocument();
      expect(screen.getByText("malware-dropper.net")).toBeInTheDocument();
    });
  });

  it("filters reports by tag when clicking 'Malware'", async () => {
    render(<CommunityThreatFeed />);

    await waitFor(() => {
      expect(screen.getByText("phishing-target.com")).toBeInTheDocument();
    });

    const malwareTab = screen.getByRole("button", { name: "Malware" });
    fireEvent.click(malwareTab);

    expect(screen.getByText("malware-dropper.net")).toBeInTheDocument();
    expect(screen.queryByText("phishing-target.com")).not.toBeInTheDocument();
  });

  it("filters reports by tag when clicking 'Phishing'", async () => {
    render(<CommunityThreatFeed />);

    await waitFor(() => {
      expect(screen.getByText("phishing-target.com")).toBeInTheDocument();
    });

    const phishingTab = screen.getByRole("button", { name: "Phishing" });
    fireEvent.click(phishingTab);

    expect(screen.getByText("phishing-target.com")).toBeInTheDocument();
    expect(screen.queryByText("malware-dropper.net")).not.toBeInTheDocument();
  });

  it("handles upvoting a threat report", async () => {
    render(<CommunityThreatFeed />);

    await waitFor(() => {
      expect(screen.getByText("10")).toBeInTheDocument();
    });

    const upvoteButtons = screen.getAllByTitle(/upvote/i);
    const firstUpvoteButton = upvoteButtons[0];
    if (!firstUpvoteButton) throw new Error("Upvote button not found");

    fireEvent.click(firstUpvoteButton);

    await waitFor(() => {
      expect(screen.getByText("11")).toBeInTheDocument();
    });
  });
});
