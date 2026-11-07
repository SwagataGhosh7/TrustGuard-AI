import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuthProvider } from "@/lib/auth-context";
import { MlhLandingPage } from "@/components/MlhLandingPage";

describe("MlhLandingPage Component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("renders MLH x Hacktoberfest ribbon, motto, and contact section", () => {
    render(
      <AuthProvider>
        <MlhLandingPage onEnterDashboard={vi.fn()} />
      </AuthProvider>,
    );

    expect(screen.getByText(/Diversion 2026/i)).toBeInTheDocument();
    expect(
      screen.getByText(/"Trust is Not a Default Certificate; It is Cryptographic Proof."/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/swagataghosh538@gmail.com/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Contact the TrustGuard Team")).toBeInTheDocument();
  });

  it("renders both access options: with signin and without signin", () => {
    render(
      <AuthProvider>
        <MlhLandingPage onEnterDashboard={vi.fn()} />
      </AuthProvider>,
    );

    expect(screen.getByText("Access With Sign In")).toBeInTheDocument();
    expect(screen.getByText("Access Without Sign In")).toBeInTheDocument();
    expect(screen.getByText(/Full Community Threat Feed Participation/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Read-only: Cannot upvote or file threat reports/i),
    ).toBeInTheDocument();
  });

  it("allows entering dashboard as guest when clicking Continue as Guest", () => {
    const handleEnter = vi.fn();
    render(
      <AuthProvider>
        <MlhLandingPage onEnterDashboard={handleEnter} />
      </AuthProvider>,
    );

    const guestButtons = screen.getAllByRole("button", { name: /Guest/i });
    expect(guestButtons.length).toBeGreaterThan(0);
    fireEvent.click(guestButtons[0]!);

    expect(handleEnter).toHaveBeenCalled();
  });

  it("opens Firebase authentication modal when clicking Sign In", () => {
    render(
      <AuthProvider>
        <MlhLandingPage onEnterDashboard={vi.fn()} />
      </AuthProvider>,
    );

    const signInBtn = screen.getByRole("button", { name: /Sign In \(Firebase\)/i });
    fireEvent.click(signInBtn);

    expect(screen.getByText("Firebase Authentication")).toBeInTheDocument();
    expect(screen.getByText("GitHub Auth")).toBeInTheDocument();
    expect(screen.getByText("Google Auth")).toBeInTheDocument();
  });

  it("handles contact form dispatch submission", () => {
    render(
      <AuthProvider>
        <MlhLandingPage onEnterDashboard={vi.fn()} />
      </AuthProvider>,
    );

    const nameInput = screen.getByPlaceholderText(/Alex/i);
    const emailInput = screen.getByPlaceholderText(/analyst@domain.com/i);
    const msgInput = screen.getByPlaceholderText(/Provide/i);

    fireEvent.change(nameInput, { target: { value: "Security Analyst" } });
    fireEvent.change(emailInput, { target: { value: "tester@security.org" } });
    fireEvent.change(msgInput, { target: { value: "Testing the contact dispatch form." } });

    const submitBtn = screen.getByRole("button", { name: /Dispatch Note/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText("Dispatch Transmitted!")).toBeInTheDocument();
  });
});
