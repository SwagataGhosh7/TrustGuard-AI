import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  Filter,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ThumbsUp,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CommunityThreatReport } from "@/server/threat-store";

interface CommunityThreatFeedProps {
  onInspectDomain?: (domain: string) => void;
  canParticipate?: boolean;
}

const COMMON_TAGS = [
  { id: "all", label: "All Reports" },
  { id: "phishing", label: "Phishing" },
  { id: "malware", label: "Malware" },
  { id: "impersonation", label: "Impersonation" },
  { id: "weak key", label: "Weak Key / CA" },
  { id: "critical", label: "Critical Only" },
];

export function CommunityThreatFeed({
  onInspectDomain,
  canParticipate = false,
}: CommunityThreatFeedProps) {
  const [threats, setThreats] = useState<CommunityThreatReport[]>([]);
  const [activeTag, setActiveTag] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"votes" | "recent">("votes");
  const [loading, setLoading] = useState(false);
  const [votedIds, setVotedIds] = useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);

  // New report form state
  const [newDomain, setNewDomain] = useState("");
  const [newVector, setNewVector] = useState("Credential Theft & Phishing");
  const [newSeverity, setNewSeverity] = useState<"Critical" | "High" | "Medium" | "Low">(
    "Critical",
  );
  const [newReporter, setNewReporter] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newSelectedTags, setNewSelectedTags] = useState<string[]>(["phishing"]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch real threats from API
  const fetchThreats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/threats");
      if (res.ok) {
        const data = (await res.json()) as CommunityThreatReport[];
        setThreats(data);
      }
    } catch (err) {
      console.error("Failed to load threats feed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreats();
  }, []);

  const handleUpvote = async (id: string) => {
    // Optimistic toggle
    const isCurrentlyVoted = Boolean(votedIds[id]);
    const delta = isCurrentlyVoted ? -1 : 1;

    setVotedIds((prev) => ({ ...prev, [id]: !isCurrentlyVoted }));
    setThreats((prev) =>
      prev.map((t) => (t.id === id ? { ...t, votes: Math.max(0, t.votes + delta) } : t)),
    );

    try {
      const res = await fetch("/api/threats/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, delta }),
      });
      if (res.ok) {
        const updated = (await res.json()) as CommunityThreatReport;
        setThreats((prev) => prev.map((t) => (t.id === id ? updated : t)));
      }
    } catch (err) {
      console.error("Vote failed, reverting:", err);
      // Revert optimistic update
      setVotedIds((prev) => ({ ...prev, [id]: isCurrentlyVoted }));
      setThreats((prev) =>
        prev.map((t) => (t.id === id ? { ...t, votes: Math.max(0, t.votes - delta) } : t)),
      );
    }
  };

  const handleCreateReport = async (e: FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/threats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: newDomain.trim(),
          vector: newVector,
          severity: newSeverity,
          reporter: newReporter.trim() || "ThreatHunter",
          notes: newNotes.trim() || "Observed malicious activity reported by community analyst.",
          tags: newSelectedTags.length > 0 ? newSelectedTags : ["phishing", "community"],
        }),
      });

      if (res.ok) {
        await fetchThreats();
        setModalOpen(false);
        setNewDomain("");
        setNewNotes("");
        setNewReporter("");
        setNewSelectedTags(["phishing"]);
      }
    } catch (err) {
      console.error("Failed to post threat report:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTagInForm = (tag: string) => {
    setNewSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  // Filter & sort reports
  const displayedThreats = useMemo(() => {
    let list = [...threats];

    // Filter by tag
    if (activeTag !== "all") {
      if (activeTag === "critical") {
        list = list.filter((t) => t.severity === "Critical");
      } else {
        list = list.filter((t) => {
          const matchTag = t.tags.some((tag) => tag.toLowerCase() === activeTag.toLowerCase());
          const matchVector = t.vector.toLowerCase().includes(activeTag.toLowerCase());
          return matchTag || matchVector;
        });
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.domain.toLowerCase().includes(q) ||
          t.vector.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)),
      );
    }

    // Sort
    if (sortBy === "votes") {
      list.sort((a, b) => b.votes - a.votes);
    } else {
      list.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
    }

    return list;
  }, [threats, activeTag, searchQuery, sortBy]);

  return (
    <section id="threat-feed" className="space-y-6 pt-10">
      {/* Feed Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-primary mb-1">
            <span className="size-1.5 rounded-full bg-primary" />
            Live Intelligence Network
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            Community Threat Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Real-time feed of confirmed phishing sites, weak CA certificates, and malicious domains.
            Upvote verified IOCs or submit new threat indicators for community analysis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchThreats}
            disabled={loading}
            className="rounded-none border-border h-8 text-xs font-mono"
            title="Refresh feed"
          >
            <RefreshCw size={13} className={`mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {canParticipate ? (
            <Button
              size="sm"
              onClick={() => setModalOpen(true)}
              className="rounded-none bg-primary text-primary-foreground h-8 text-xs font-semibold hover:bg-primary/90"
            >
              <Plus size={13} className="mr-1.5" />
              Submit Threat
            </Button>
          ) : (
            <span className="flex h-8 items-center gap-1.5 border border-border px-3 text-xs text-muted-foreground" title="Sign-in is not available until Firebase is connected">
              Sign-in required to participate
            </span>
          )}
        </div>
      </div>

      {/* Control Bar: Tag Filters, Search, and Sort */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Tag Filter Segmented Controls */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-card border border-border text-xs">
            {COMMON_TAGS.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => setActiveTag(tag.id)}
                className={`px-3 py-1 font-medium transition-colors whitespace-nowrap ${
                  activeTag === tag.id
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 lg:w-64">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="text"
                placeholder="Filter by domain or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-9 pr-3 rounded-none border-border bg-card text-xs font-mono"
              />
            </div>

            {/* Sort Toggle */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "votes" | "recent")}
              className="h-8 rounded-none border border-border bg-card px-2 text-xs font-mono text-muted-foreground focus:outline-none"
            >
              <option value="votes">Top Upvoted</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>
        </div>

        {/* Active Filter Indicator */}
        {(activeTag !== "all" || searchQuery) && (
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <div className="flex items-center gap-2">
              <Filter size={12} className="text-primary" />
              <span>
                Filtered by{" "}
                {activeTag !== "all" && (
                  <span className="font-semibold text-foreground capitalize">'{activeTag}'</span>
                )}
                {activeTag !== "all" && searchQuery && <span> and </span>}
                {searchQuery && (
                  <span className="font-semibold text-foreground">'{searchQuery}'</span>
                )}
                {" · "}
                <span className="font-mono text-primary">{displayedThreats.length}</span> reports
                found
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTag("all");
                setSearchQuery("");
              }}
              className="text-[11px] text-primary hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Threats Grid / List */}
      <div className="border border-border bg-card divide-y divide-border overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[140px_1fr_190px_100px_90px] gap-4 px-5 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-secondary/30">
          <span>Reported</span>
          <span>Target Domain & Evidence</span>
          <span>Attack Vector</span>
          <span>Severity</span>
          <span className="text-right">Upvotes</span>
        </div>

        {displayedThreats.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShieldAlert size={28} className="mx-auto text-muted-foreground opacity-50" />
            <h3 className="text-sm font-semibold text-foreground">No Threat Reports Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              No community reports match the filter tag '{activeTag}'. Try clearing your filter or
              submit a new verified incident.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTag("all");
                setSearchQuery("");
              }}
              className="rounded-none border-border h-8 text-xs"
            >
              Show All Reports
            </Button>
          </div>
        ) : (
          displayedThreats.map((threat) => {
            const hasVoted = Boolean(votedIds[threat.id]);
            return (
              <div
                key={threat.id}
                className="grid grid-cols-1 md:grid-cols-[140px_1fr_190px_100px_90px] gap-3 md:gap-4 p-4 md:px-5 md:py-4 hover:bg-secondary/15 transition-colors items-center"
              >
                {/* Timestamp & Reporter */}
                <div className="text-xs font-mono text-muted-foreground space-y-0.5">
                  <div className="text-foreground/90 font-medium">
                    {new Date(threat.reportedAt).toLocaleDateString()}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    by <span className="text-primary">{threat.reporter}</span>
                  </div>
                </div>

                {/* Domain, Notes, and Tag Chips */}
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="font-mono text-xs font-semibold text-foreground truncate select-all"
                      title={threat.domain}
                    >
                      {threat.domain}
                    </span>
                    {onInspectDomain && (
                      <button
                        type="button"
                        onClick={() => onInspectDomain(threat.domain)}
                        className="text-[11px] font-medium text-primary hover:underline flex items-center gap-0.5 shrink-0"
                        title="Audit this domain with live TLS socket scanner"
                      >
                        Deep Audit <ChevronRight size={12} />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed" title={threat.notes}>
                    {threat.notes}
                  </p>

                  {/* Interactive Tag Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {threat.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setActiveTag(tag.toLowerCase())}
                        className={`text-[10px] font-mono px-2 py-0.5 border transition-colors ${
                          activeTag.toLowerCase() === tag.toLowerCase()
                            ? "border-primary bg-primary/20 text-primary font-semibold"
                            : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                        title={`Filter feed by tag '${tag}'`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Threat Vector */}
                <div className="text-xs text-foreground/90 font-medium flex items-center gap-1.5">
                  <span className="size-1 rounded-full bg-primary shrink-0 hidden md:inline-block" />
                  <span>{threat.vector}</span>
                </div>

                {/* Severity Badge */}
                <div>
                  <span
                    className={`inline-block text-[10px] font-semibold uppercase px-2 py-0.5 border ${
                      threat.severity === "Critical"
                        ? "border-danger/40 bg-danger/10 text-danger"
                        : threat.severity === "High"
                          ? "border-warning/40 bg-warning/10 text-warning"
                          : "border-border bg-secondary text-foreground"
                    }`}
                  >
                    {threat.severity}
                  </span>
                </div>

                {/* Upvote Button */}
                <div className="flex md:justify-end items-center">
                  {canParticipate ? (
                    <button
                      type="button"
                      onClick={() => handleUpvote(threat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold border transition-all ${
                        hasVoted
                          ? "border-primary bg-primary text-primary-foreground shadow-[0_0_12px_rgba(45,212,191,0.25)]"
                          : "border-border bg-card hover:bg-secondary text-foreground hover:border-primary/50"
                      }`}
                      title={hasVoted ? "Click to remove upvote" : "Upvote this threat report"}
                    >
                      <ThumbsUp
                        size={12}
                        className={hasVoted ? "text-primary-foreground" : "text-primary"}
                      />
                      <span className="tabular-nums">{threat.votes}</span>
                    </button>
                  ) : (
                    <span
                      className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs font-mono text-muted-foreground"
                      title="Sign-in is not available until Firebase is connected"
                    >
                      <ThumbsUp size={12} />
                      <span className="tabular-nums">{threat.votes}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Submit Threat Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="w-full max-w-lg border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Submit Threat Intelligence
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Publish a newly identified malicious domain, phishing campaign, or weak CA
                  certificate.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setModalOpen(false)}
                className="size-8 -mr-2 -mt-2 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </Button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
                  Target Domain or URL *
                </label>
                <Input
                  required
                  placeholder="e.g. secure-login-account-update.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="rounded-none border-border bg-background font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
                    Primary Vector
                  </label>
                  <select
                    value={newVector}
                    onChange={(e) => setNewVector(e.target.value)}
                    className="w-full h-9 rounded-none border border-border bg-background px-3 text-xs text-foreground focus:outline-none"
                  >
                    <option value="Credential Theft & Phishing">Credential Theft & Phishing</option>
                    <option value="eMudhra CA Weak Key Generation">
                      eMudhra CA Weak Key Generation
                    </option>
                    <option value="Brand Impersonation & Typosquatting">
                      Brand Impersonation & Typosquatting
                    </option>
                    <option value="Malware Dropper / Exploit">Malware Dropper / Exploit</option>
                    <option value="Fake KYC & SMS Phishing">Fake KYC & SMS Phishing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
                    Severity
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) =>
                      setNewSeverity(e.target.value as "Critical" | "High" | "Medium" | "Low")
                    }
                    className="w-full h-9 rounded-none border border-border bg-background px-3 text-xs text-foreground focus:outline-none"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Tag Selector */}
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
                  Select Threat Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "phishing",
                    "malware",
                    "impersonation",
                    "weak key",
                    "eMudhra",
                    "credential theft",
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTagInForm(tag)}
                      className={`text-xs px-2.5 py-1 border font-mono transition-colors ${
                        newSelectedTags.includes(tag)
                          ? "border-primary bg-primary text-primary-foreground font-semibold"
                          : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
                  Reporter Name / Handle
                </label>
                <Input
                  placeholder="e.g. SecOps_Analyst"
                  value={newReporter}
                  onChange={(e) => setNewReporter(e.target.value)}
                  className="rounded-none border-border bg-background text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
                  Forensic Evidence & Behavioral Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Details on fake login fields, stolen brands, weak key parameters, or victim reports..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full rounded-none border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="rounded-none border-border h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !newDomain.trim()}
                  className="rounded-none bg-primary text-primary-foreground h-9 text-xs font-semibold hover:bg-primary/90"
                >
                  {submitting ? "Submitting Report..." : "Submit to Live Feed"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
