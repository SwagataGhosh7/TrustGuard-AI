import { render, screen, fireEvent } from "@testing-library/react";
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

  it("displays verified continuous maintenance for github.com clean baseline", () => {
    render(<TrustScoreTrendChart />);
    expect(screen.getByText("Continuous Security Maintenance Verified")).toBeInTheDocument();
  });

  it("detects security maintenance lapses when switching to emudhra profile", () => {
    render(<TrustScoreTrendChart />);
    const emudhraBtn = screen.getByRole("button", {
      name: /emudhra-gateway/i,
    });
    fireEvent.click(emudhraBtn);

    expect(screen.getByText("Security Maintenance Lapse Detected")).toBeInTheDocument();
    expect(screen.getByText(/Action Required/i)).toBeInTheDocument();
  });

  it("switches to legacy portal profile and displays maintenance lapses", () => {
    render(<TrustScoreTrendChart />);
    const legacyBtn = screen.getByRole("button", {
      name: /legacy-portal/i,
    });
    fireEvent.click(legacyBtn);

    expect(screen.getByText("Security Maintenance Lapse Detected")).toBeInTheDocument();
  });
});
