import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Lock } from "lucide-react";

import { CommunityHub } from "@/components/CommunityHub";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/community")({
  head: () => ({ meta: [{ title: "TrustGuard AI — Community IOCs" }] }),
  component: CommunityPage,
});

function CommunityPage() {
  const { user, canAccessCommunityIntelligence } = useAuth();

  return (
    <div className="min-h-screen bg-[#070a0e] text-[#e2e8f0]">
      <header className="border-b border-[#243346] bg-[#0c1017]/95 px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-xs font-pixel text-[#a3e635]">
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <span className="font-pixel text-xs text-[#a3e635]">COMMUNITY IOCs</span>
        </div>
      </header>
      <main className="mx-auto max-w-[1440px] space-y-6 px-4 py-8 sm:px-8 lg:px-12">
        <div className="border-b border-[#243346] pb-4">
          <h1 className="font-arcade text-lg text-white">Collaborative Threat Intelligence</h1>
          <p className="mt-1 text-xs text-[#94a3b8]">Connect with analysts, publish findings, and discuss live incidents.</p>
        </div>
        {user && canAccessCommunityIntelligence ? (
          <CommunityHub />
        ) : (
          <div className="border border-[#ff6b35]/50 bg-[#0c1017] p-10 text-center">
            <Lock className="mx-auto mb-4 text-[#ff6b35]" size={28} />
            <h2 className="font-arcade text-lg text-white">Authentication required</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#94a3b8]">
              Sign in with Google to join the authenticated TrustGuard analyst community.
            </p>
            <Link to="/" className="mt-5 inline-flex border border-[#ff6b35] px-4 py-2 text-xs font-pixel text-[#ff6b35]">
              Go to sign in
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
