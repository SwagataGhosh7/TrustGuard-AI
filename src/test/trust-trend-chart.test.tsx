import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TrustScoreTrendChart } from "@/components/TrustScoreTrendChart";

describe("TrustScoreTrendChart Component", () => {
  it("renders the trust score trend chart title and summary KPIs", () => {
    render(<TrustScoreTrendChart />);
    expect(screen.getByText("Certificate Trust Score Fluctuations Over Time")).toBeInTheDocument();
    expect(screen.getByText("Current Trust Index")).toBeInTheDocument();
    expect(screen.getByText("Lowest Recorded Dip")).toBeInTheDocument();
    expect(screen.getByText("Security Lapses Logged")).toBeInTheDocument();
  });

  it("waits for a valid target before showing trust metrics", () => {
    render(<TrustScoreTrendChart />);
    expect(screen.getByText("Awaiting Valid Target")).toBeInTheDocument();
    expect(screen.getByText("Current URL/Domain:")).toBeInTheDocument();
    expect(screen.getByText("awaiting scan")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /github\.com \(Clean\)/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /emudhra-gateway/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /legacy-portal/i })).not.toBeInTheDocument();
  });
});
