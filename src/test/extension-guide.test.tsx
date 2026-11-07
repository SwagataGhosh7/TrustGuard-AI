import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { BrowserExtensionGuide } from "@/components/BrowserExtensionGuide";

describe("BrowserExtensionGuide Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders guide header and architecture steps", () => {
    render(<BrowserExtensionGuide />);
    expect(screen.getByText("Browser Extension Integration Guide")).toBeInTheDocument();
    expect(screen.getByText("Manifest V3 Configuration")).toBeInTheDocument();
    expect(screen.getByText("Passive Socket Interception")).toBeInTheDocument();
    expect(screen.getByText("Credential Sentinel Alerts")).toBeInTheDocument();
  });

  it("switches code snippet tabs between background, manifest, and content", () => {
    render(<BrowserExtensionGuide />);

    // Initially shows background.js snippet
    expect(
      screen.getByText(/chrome\.webNavigation\.onCommitted\.addListener/i),
    ).toBeInTheDocument();

    // Click manifest.json tab
    const manifestTab = screen.getByRole("button", { name: /manifest\.json/i });
    fireEvent.click(manifestTab);
    expect(screen.getByText(/"manifest_version": 3/i)).toBeInTheDocument();

    // Click content.js tab
    const contentTab = screen.getByRole("button", { name: /content\.js/i });
    fireEvent.click(contentTab);
    expect(screen.getByText(/CHECK_CURRENT_TRUST/i)).toBeInTheDocument();
  });

  it("copies snippet code to clipboard when Copy Code is clicked", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<BrowserExtensionGuide />);
    const copyBtn = screen.getByRole("button", { name: /Copy Code/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalled();
  });

  it("renders the 2-minute Chrome installation walkthrough steps", () => {
    render(<BrowserExtensionGuide />);
    expect(screen.getByText(/How to Test in Chrome \/ Chromium/i)).toBeInTheDocument();
    expect(screen.getByText(/chrome:\/\/extensions\//i)).toBeInTheDocument();
  });
});
