import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Layers } from "lucide-react";

import { BulkUrlScanner } from "@/components/BulkUrlScanner";

export const Route = createFileRoute("/bulk-audit")({
  head: () => ({ meta: [{ title: "TrustGuard AI — Bulk Audit" }] }),
  component: BulkAuditPage,
});

function BulkAuditPage() {
  return (
    <div className="min-h-screen bg-[#070a0e] text-[#e2e8f0]">
      <header className="border-b border-[#243346] bg-[#0c1017]/95 px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-xs font-pixel text-[#ff6b35]">
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <span className="font-pixel text-xs text-[#ff6b35]">BULK URL AUDIT</span>
        </div>
      </header>
      <main className="mx-auto max-w-[1440px] space-y-6 px-4 py-8 sm:px-8 lg:px-12">
        <div className="flex items-center gap-3 border-b border-[#243346] pb-4">
          <Layers className="text-[#ff6b35]" size={22} />
          <div>
            <h1 className="font-arcade text-lg text-white">Concurrent Threat Assessment</h1>
            <p className="mt-1 text-xs text-[#94a3b8]">Audit up to twelve domains in one focused workspace.</p>
          </div>
        </div>
        <BulkUrlScanner />
      </main>
    </div>
  );
}
