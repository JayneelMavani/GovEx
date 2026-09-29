"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PromiseStatus, SourceTier } from "@prisma/client";
import { STATUS_CONFIG, ALL_STATUSES, TIER_CONFIG } from "@/lib/constants";
import { TierBadge } from "@/components/ui/badges";
import {
  Plus,
  FileText,
  Upload,
  Shield,
  Link2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Pencil,
  Search,
  Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AdminClientProps {
  elections: { id: string; name: string }[];
  parties: { id: string; name: string; abbreviation: string }[];
  manifestos: { id: string; title: string; partyName: string; electionName: string }[];
  promises: {
    id: string;
    title: string;
    description?: string | null;
    sourceText?: string | null;
    category: string;
    manifestoId?: string;
    partyAbbreviation: string;
    status: PromiseStatus | null;
    evidenceCount: number;
    verificationCount: number;
  }[];
  sources: {
    id: string;
    name: string;
    url: string;
    sourceType: string;
    tier: SourceTier;
  }[];
}

type Tab = "promises" | "evidence" | "verification" | "status" | "manifesto" | "source";

export function AdminClient({
  elections,
  parties,
  manifestos,
  promises,
  sources,
}: AdminClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("promises");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "promises", label: "Promises", icon: FileText },
    { id: "evidence", label: "Add Evidence", icon: Link2 },
    { id: "verification", label: "Record Verification", icon: CheckCircle2 },
    { id: "status", label: "Update Status", icon: Shield },
    { id: "manifesto", label: "Manifestos", icon: Upload },
    { id: "source", label: "Sources", icon: Link2 },
  ];

  const apiCall = async (body: Record<string, unknown>) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || "An error occurred",
        });
        return false;
      }
      setMessage({ type: "success", text: "Operation completed successfully!" });
      router.refresh();
      return true;
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-card rounded-xl border border-border shadow-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setActiveTab(tab.id);
                setMessage(null);
              }}
              className={`gap-2 h-9 font-semibold ${
                isActive ? "shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Message Banner */}
      {message && (
        <Alert
          variant={message.type === "success" ? "success" : "destructive"}
          className="relative pr-10"
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <AlertTitle className="text-sm font-bold">
            {message.type === "success" ? "Success" : "Error"}
          </AlertTitle>
          <AlertDescription className="text-xs">{message.text}</AlertDescription>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMessage(null)}
            className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </Alert>
      )}

      {/* Tab Panels */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          {activeTab === "promises" && (
            <AddPromiseForm
              manifestos={manifestos}
              promises={promises}
              loading={loading}
              onSubmit={apiCall}
            />
          )}
          {activeTab === "evidence" && (
            <AddEvidenceForm
              promises={promises}
              sources={sources}
              loading={loading}
              onSubmit={apiCall}
            />
          )}
          {activeTab === "verification" && (
            <RecordVerificationForm
              promises={promises}
              sources={sources}
              loading={loading}
              onSubmit={apiCall}
            />
          )}
          {activeTab === "status" && (
            <UpdateStatusForm
              promises={promises}
              loading={loading}
              onSubmit={apiCall}
            />
          )}
          {activeTab === "manifesto" && (
            <ManifestoForm
              elections={elections}
              parties={parties}
              manifestos={manifestos}
              loading={loading}
              onSubmit={apiCall}
            />
          )}
          {activeTab === "source" && (
            <SourceForm sources={sources} loading={loading} onSubmit={apiCall} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Manage Promises Form (Add / Edit) ──
function AddPromiseForm({
  manifestos,
  promises,
  loading,
  onSubmit,
}: {
  manifestos: AdminClientProps["manifestos"];
  promises: AdminClientProps["promises"];
  loading: boolean;
  onSubmit: (body: Record<string, unknown>) => Promise<boolean>;
}) {
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selectedPromiseId, setSelectedPromiseId] = useState("");
  const [manifestoId, setManifestoId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [sourceText, setSourceText] = useState("");

  const handlePromiseSelect = (id: string) => {
    setSelectedPromiseId(id);
    const p = promises.find((item) => item.id === id);
    if (p) {
      setTitle(p.title);
      setDescription(p.description || "");
      setCategory(p.category);
      setSourceText(p.sourceText || "");
      if (p.manifestoId) {
        setManifestoId(p.manifestoId);
      }
    }
  };

  const handleModeChange = (newMode: "add" | "edit") => {
    setMode(newMode);
    setSelectedPromiseId("");
    setTitle("");
    setDescription("");
    setCategory("");
    setSourceText("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "add") {
      const ok = await onSubmit({
        action: "addPromise",
        manifestoId,
        title,
        description,
        category,
        sourceText,
      });
      if (ok) {
        setTitle("");
        setDescription("");
        setSourceText("");
      }
    } else {
      if (!selectedPromiseId) return;
      const ok = await onSubmit({
        action: "editPromise",
        promiseId: selectedPromiseId,
        title,
        description,
        category,
        sourceText,
      });
      if (ok) {
        // kept edited state for review
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            {mode === "add" ? (
              <Plus className="w-5 h-5 text-primary" />
            ) : (
              <Pencil className="w-5 h-5 text-primary" />
            )}
            {mode === "add" ? "Create New Manifesto Promise" : "Edit Existing Promise Record"}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {mode === "add"
              ? "Ingest a new verbatim promise into the verifiable registry."
              : "Update category, title, or verbatim manifesto quote."}
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-muted rounded-lg shrink-0">
          <Button
            type="button"
            variant={mode === "add" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleModeChange("add")}
            className="h-8 text-xs font-semibold gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New
          </Button>
          <Button
            type="button"
            variant={mode === "edit" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleModeChange("edit")}
            className="h-8 text-xs font-semibold gap-1.5"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Promise
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
        {mode === "edit" && (
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Select Promise to Edit <span className="text-destructive">*</span>
            </label>
            <select
              value={selectedPromiseId}
              onChange={(e) => handlePromiseSelect(e.target.value)}
              required
              className="w-full h-10 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Choose a promise from registry...</option>
              {promises.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.partyAbbreviation}] {p.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {mode === "add" && (
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Target Manifesto <span className="text-destructive">*</span>
            </label>
            <select
              value={manifestoId}
              onChange={(e) => setManifestoId(e.target.value)}
              required
              className="w-full h-10 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select party manifesto...</option>
              {manifestos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.partyName} — {m.title} ({m.electionName})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Promise Title <span className="text-destructive">*</span>
          </label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Concise, clear promise title"
            className="h-10 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Detailed Description <span className="text-destructive">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            placeholder="Comprehensive description of what is pledged..."
            className="w-full rounded-lg border border-input bg-background p-3 text-sm font-normal shadow-2xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Policy Category <span className="text-destructive">*</span>
          </label>
          <Input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            placeholder="e.g., Infrastructure, Healthcare, Employment, Taxation"
            className="h-10 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Original Verbatim Manifesto Quote (optional)
          </label>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            rows={3}
            placeholder="Exact sentence or paragraph extracted verbatim from the manifesto..."
            className="w-full rounded-lg border border-input bg-background p-3 text-sm font-normal shadow-2xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y font-mono text-xs"
          />
        </div>

        <Button
          type="submit"
          disabled={loading || (mode === "edit" && !selectedPromiseId)}
          className="gap-2 font-semibold shadow-xs"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : mode === "add" ? (
            <Plus className="w-4 h-4" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          {mode === "add" ? "Create Promise Record" : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}

// ── Add Evidence Form ──
function AddEvidenceForm({
  promises,
  sources,
  loading,
  onSubmit,
}: {
  promises: AdminClientProps["promises"];
  sources: AdminClientProps["sources"];
  loading: boolean;
  onSubmit: (body: Record<string, unknown>) => Promise<boolean>;
}) {
  const [promiseId, setPromiseId] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [publishedDate, setPublishedDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSubmit({
      action: "addEvidence",
      promiseId,
      sourceId,
      title,
      description,
      evidenceUrl,
      publishedDate,
    });
    if (ok) {
      setTitle("");
      setDescription("");
      setEvidenceUrl("");
      setPublishedDate("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-border">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Link2 className="w-5 h-5 text-primary" />
          Attach Documentary Evidence
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Link a verifiable artifact (gazette, parliamentary report, audit, news article) to an electoral promise.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Promise <span className="text-destructive">*</span>
          </label>
          <select
            value={promiseId}
            onChange={(e) => setPromiseId(e.target.value)}
            required
            className="w-full h-10 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select target promise...</option>
            {promises.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.partyAbbreviation}] {p.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Primary Source Authority <span className="text-destructive">*</span>
          </label>
          <select
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            required
            className="w-full h-10 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select registered source...</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                [{s.tier}] {s.name} ({s.sourceType})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Evidence Item Title <span className="text-destructive">*</span>
          </label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g., National Highway Gazette Notification 2024/88"
            className="h-10 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Documentary Findings &amp; Summary <span className="text-destructive">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            placeholder="Explain what this document proves regarding implementation progress..."
            className="w-full rounded-lg border border-input bg-background p-3 text-sm font-normal shadow-2xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Evidence Document URL
          </label>
          <Input
            type="url"
            value={evidenceUrl}
            onChange={(e) => setEvidenceUrl(e.target.value)}
            placeholder="https://official-gazette.gov.demo/documents/..."
            className="h-10 text-sm font-mono text-xs"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Publication Date
          </label>
          <Input
            type="date"
            value={publishedDate}
            onChange={(e) => setPublishedDate(e.target.value)}
            className="h-10 text-sm"
          />
        </div>

        <Button type="submit" disabled={loading} className="gap-2 font-semibold shadow-xs">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
          Attach Evidence Record
        </Button>
      </form>
    </div>
  );
}

// ── Record Verification Form ──
function RecordVerificationForm({
  promises,
  sources,
  loading,
  onSubmit,
}: {
  promises: AdminClientProps["promises"];
  sources: AdminClientProps["sources"];
  loading: boolean;
  onSubmit: (body: Record<string, unknown>) => Promise<boolean>;
}) {
  const [promiseId, setPromiseId] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [status, setStatus] = useState<PromiseStatus | "">("");
  const [notes, setNotes] = useState("");
  const [verifiedBy, setVerifiedBy] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSubmit({
      action: "addVerification",
      promiseId,
      sourceId,
      status,
      notes,
      verifiedBy,
    });
    if (ok) {
      setNotes("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-border">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          Log Researcher Verification Audit
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Record a formal forensic review of a promise against primary evidence documents.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Promise <span className="text-destructive">*</span>
          </label>
          <select
            value={promiseId}
            onChange={(e) => setPromiseId(e.target.value)}
            required
            className="w-full h-10 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select promise...</option>
            {promises.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.partyAbbreviation}] {p.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Associated Source (Optional)
          </label>
          <select
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            className="w-full h-10 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">No specific source linked</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                [{s.tier}] {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Assessed Status <span className="text-destructive">*</span>
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PromiseStatus)}
            required
            className="w-full h-10 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Choose audited status...</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Verification Findings &amp; Methodology Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Detailed notes on how the evidence was verified..."
            className="w-full rounded-lg border border-input bg-background p-3 text-sm font-normal shadow-2xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Auditing Researcher Name
          </label>
          <Input
            type="text"
            value={verifiedBy}
            onChange={(e) => setVerifiedBy(e.target.value)}
            placeholder="e.g., Dr. Eleanor Vance, Lead Policy Auditor"
            className="h-10 text-sm"
          />
        </div>

        <Button type="submit" disabled={loading} className="gap-2 font-semibold shadow-xs">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          Log Verification Record
        </Button>
      </form>
    </div>
  );
}

// ── Update Status Form ──
function UpdateStatusForm({
  promises,
  loading,
  onSubmit,
}: {
  promises: AdminClientProps["promises"];
  loading: boolean;
  onSubmit: (body: Record<string, unknown>) => Promise<boolean>;
}) {
  const [promiseId, setPromiseId] = useState("");
  const [status, setStatus] = useState<PromiseStatus | "">("");
  const [explanation, setExplanation] = useState("");
  const [changedBy, setChangedBy] = useState("");

  const selectedPromise = promises.find((p) => p.id === promiseId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSubmit({
      action: "updateStatus",
      promiseId,
      status,
      explanation,
      changedBy,
    });
    if (ok) {
      setExplanation("");
    }
  };

  const showBusinessRuleWarning =
    (status === "IMPLEMENTED" || status === "PARTIALLY_IMPLEMENTED") &&
    selectedPromise &&
    selectedPromise.evidenceCount === 0;

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-border">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Update Official Implementation Determination
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Set the active implementation status of a commitment. Changes are saved to the permanent audit ledger.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Promise <span className="text-destructive">*</span>
          </label>
          <select
            value={promiseId}
            onChange={(e) => setPromiseId(e.target.value)}
            required
            className="w-full h-10 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select promise...</option>
            {promises.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.partyAbbreviation}] {p.title}{" "}
                {p.status ? `(${STATUS_CONFIG[p.status].label})` : "(No status)"}
              </option>
            ))}
          </select>

          {selectedPromise && (
            <div className="mt-2.5 p-3 rounded-lg bg-muted/40 border border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Current:{" "}
                <strong className="text-foreground">
                  {selectedPromise.status ? STATUS_CONFIG[selectedPromise.status].label : "None"}
                </strong>
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  {selectedPromise.evidenceCount} Evidences
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {selectedPromise.verificationCount} Audits
                </Badge>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            New Official Status <span className="text-destructive">*</span>
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PromiseStatus)}
            required
            className="w-full h-10 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select new status...</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}
              </option>
            ))}
          </select>
        </div>

        {showBusinessRuleWarning && (
          <Alert variant="warning">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle className="text-xs font-bold">Strict Rule Notice</AlertTitle>
            <AlertDescription className="text-xs leading-relaxed">
              Setting status to &quot;Implemented&quot; or &quot;Partially Implemented&quot; strictly requires at least one verified evidence item linked to a <strong>High Tier</strong> source. This promise currently has {selectedPromise.evidenceCount} evidence items.
            </AlertDescription>
          </Alert>
        )}

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Official Status Explanation
          </label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            rows={3}
            placeholder="Explain the evidentiary rationale for this status determination..."
            className="w-full rounded-lg border border-input bg-background p-3 text-sm font-normal shadow-2xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Officer / Auditor Name
          </label>
          <Input
            type="text"
            value={changedBy}
            onChange={(e) => setChangedBy(e.target.value)}
            placeholder="Your name or credentials"
            className="h-10 text-sm"
          />
        </div>

        <Button type="submit" disabled={loading} className="gap-2 font-semibold shadow-xs">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
          Update Implementation Status
        </Button>
      </form>
    </div>
  );
}

// ── Manifesto Form ──
function ManifestoForm({
  elections,
  parties,
  manifestos,
  loading,
  onSubmit,
}: {
  elections: AdminClientProps["elections"];
  parties: AdminClientProps["parties"];
  manifestos: AdminClientProps["manifestos"];
  loading: boolean;
  onSubmit: (body: Record<string, unknown>) => Promise<boolean>;
}) {
  const [mode, setMode] = useState<"add" | "import">("add");
  const [electionId, setElectionId] = useState("");
  const [partyId, setPartyId] = useState("");
  const [title, setTitle] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [importManifestoId, setImportManifestoId] = useState("");
  const [importText, setImportText] = useState("");
  const [importCategory, setImportCategory] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSubmit({
      action: "addManifesto",
      electionId,
      partyId,
      title,
      documentUrl,
    });
    if (ok) {
      setTitle("");
      setDocumentUrl("");
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      action: "importManifesto",
      manifestoId: importManifestoId,
      text: importText,
      category: importCategory,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Manifesto Management &amp; Batch Import
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Register new official manifesto documents or batch import pledges into an existing manifesto.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-muted rounded-lg shrink-0">
          <Button
            type="button"
            variant={mode === "add" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("add")}
            className="h-8 text-xs font-semibold gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Manifesto
          </Button>
          <Button
            type="button"
            variant={mode === "import" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("import")}
            className="h-8 text-xs font-semibold gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            Batch Import
          </Button>
        </div>
      </div>

      {mode === "add" ? (
        <form onSubmit={handleAdd} className="space-y-5 max-w-2xl">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Election <span className="text-destructive">*</span>
            </label>
            <select
              value={electionId}
              onChange={(e) => setElectionId(e.target.value)}
              required
              className="w-full h-10 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select election...</option>
              {elections.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Political Party <span className="text-destructive">*</span>
            </label>
            <select
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
              required
              className="w-full h-10 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select party...</option>
              {parties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.abbreviation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Manifesto Title <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Forward Together 2024 Manifesto"
              className="h-10 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Official Document URL (PDF)
            </label>
            <Input
              type="url"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              placeholder="https://party.org/manifesto-2024.pdf"
              className="h-10 text-sm font-mono text-xs"
            />
          </div>

          <Button type="submit" disabled={loading} className="gap-2 font-semibold shadow-xs">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Register Manifesto
          </Button>
        </form>
      ) : (
        <form onSubmit={handleImport} className="space-y-5 max-w-2xl">
          <Alert variant="info">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-xs leading-relaxed">
              Paste lines of manifesto commitments below. Each individual line will be ingested as a distinct promise record under the selected manifesto.
            </AlertDescription>
          </Alert>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Target Manifesto <span className="text-destructive">*</span>
            </label>
            <select
              value={importManifestoId}
              onChange={(e) => setImportManifestoId(e.target.value)}
              required
              className="w-full h-10 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select manifesto...</option>
              {manifestos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.partyName} — {m.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Default Category
            </label>
            <Input
              type="text"
              value={importCategory}
              onChange={(e) => setImportCategory(e.target.value)}
              placeholder="e.g., Infrastructure, Education"
              className="h-10 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Manifesto Commitments (One pledge per line) <span className="text-destructive">*</span>
            </label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              required
              rows={8}
              placeholder={"1. Upgrade national broadband coverage to 99%\n2. Double renewable energy capacity by 2028\n3. Reduce primary healthcare clinic wait times to under 30 minutes"}
              className="w-full rounded-lg border border-input bg-background p-3 text-sm font-mono shadow-2xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
            />
          </div>

          <Button type="submit" disabled={loading} className="gap-2 font-semibold shadow-xs">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Import Commitments
          </Button>
        </form>
      )}
    </div>
  );
}

// ── Source Form ──
function SourceForm({
  sources,
  loading,
  onSubmit,
}: {
  sources: AdminClientProps["sources"];
  loading: boolean;
  onSubmit: (body: Record<string, unknown>) => Promise<boolean>;
}) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [tier, setTier] = useState<SourceTier | "">("");
  const [searchSource, setSearchSource] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSubmit({
      action: "addSource",
      name,
      url,
      sourceType,
      tier,
    });
    if (ok) {
      setName("");
      setUrl("");
      setSourceType("");
    }
  };

  const filteredSources = sources.filter(
    (s) =>
      s.name.toLowerCase().includes(searchSource.toLowerCase()) ||
      s.sourceType.toLowerCase().includes(searchSource.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-border">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Link2 className="w-5 h-5 text-primary" />
          Primary Source Registry
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Register official gazettes, parliamentary records, and audited repositories used for evidence chains.
        </p>
      </div>

      {/* Existing sources list */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Registered Sources ({sources.length})
          </span>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search sources..."
              value={searchSource}
              onChange={(e) => setSearchSource(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
          {filteredSources.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border text-xs hover:border-primary/40 transition-colors"
            >
              <div className="min-w-0 pr-2">
                <p className="truncate font-semibold text-foreground">{s.name}</p>
                <p className="truncate text-[10px] text-muted-foreground">{s.sourceType}</p>
              </div>
              <TierBadge tier={s.tier} />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <h3 className="text-base font-bold text-foreground mb-4">Register New Source</h3>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Source Name <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., National Ministry of Finance Budget Docket"
              className="h-10 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Authority URL <span className="text-destructive">*</span>
            </label>
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="https://treasury.gov.demo/..."
              className="h-10 text-sm font-mono text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Source Type <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              required
              placeholder="e.g., Government Gazette, Parliamentary Hansard, Official Audit"
              className="h-10 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Evidentiary Quality Tier <span className="text-destructive">*</span>
            </label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as SourceTier)}
              required
              className="w-full h-10 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select evidentiary tier...</option>
              {(["HIGH", "MEDIUM", "SUPPORTING"] as SourceTier[]).map((t) => (
                <option key={t} value={t}>
                  {TIER_CONFIG[t].label} — {TIER_CONFIG[t].description.substring(0, 80)}...
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" disabled={loading} className="gap-2 font-semibold shadow-xs">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Register Source
          </Button>
        </form>
      </div>
    </div>
  );
}
