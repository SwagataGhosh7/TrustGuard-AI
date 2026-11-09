import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Puzzle } from "lucide-react";

import { BrowserExtensionGuide } from "@/components/BrowserExtensionGuide";

export const Route = createFileRoute("/extension")({
  head: () => ({ meta: [{ title: "TrustGuard AI — MV3 Extension" }] }),
  component: ExtensionPage,
});

function ExtensionPage() {
  return (
    <div className="min-h-screen bg-[#070a0e] text-[#e2e8f0]">
      <header className="border-b border-[#243346] bg-[#0c1017]/95 px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-xs font-pixel text-[#fef08a]">
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <span className="font-pixel text-xs text-[#fef08a]">MV3 EXTENSION</span>
        </div>
      </header>
      <main className="mx-auto max-w-[1440px] space-y-6 px-4 py-8 sm:px-8 lg:px-12">
        <div className="flex items-center gap-3 border-b border-[#243346] pb-4">
          <Puzzle className="text-[#fef08a]" size={22} />
          <div>
            <h1 className="font-arcade text-lg text-white">Passive Browser Guardian</h1>
            <p className="mt-1 text-xs text-[#94a3b8]">Install and configure the TrustGuard Manifest V3 extension.</p>
          </div>
        </div>
        <BrowserExtensionGuide />
      </main>
    </div>
  );
}
