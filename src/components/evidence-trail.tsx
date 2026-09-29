"use client";

import { useState } from "react";
import { SourceTier, PromiseStatus } from "@prisma/client";
import { StatusBadge, TierBadge } from "@/components/ui/badges";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  CheckCircle2,
  Link2,
  User,
  Calendar,
  Building,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface VerificationData {
  id: string;
  status: PromiseStatus;
  notes: string | null;
  verifiedAt: string;
  verifiedBy: string | null;
  source: {
    id: string;
    name: string;
    url: string;
    sourceType: string;
    tier: SourceTier;
  } | null;
}

interface EvidenceData {
  id: string;
  title: string;
  description: string;
  evidenceUrl: string | null;
  publishedDate: string | null;
  source: {
    id: string;
    name: string;
    url: string;
    sourceType: string;
    tier: SourceTier;
  };
}

interface EvidenceTrailProps {
  verifications: VerificationData[];
  evidences: EvidenceData[];
}

export function EvidenceTrail({
  verifications,
  evidences,
}: EvidenceTrailProps) {
  const [expandedVerifications, setExpandedVerifications] = useState<Set<string>>(
    new Set(verifications.length > 0 ? [verifications[0].id] : [])
  );
  const [expandedEvidences, setExpandedEvidences] = useState<Set<string>>(
    new Set(evidences.length > 0 ? [evidences[0].id] : [])
  );

  const toggleVerification = (id: string) => {
    setExpandedVerifications((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleEvidence = (id: string) => {
    setExpandedEvidences((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (verifications.length === 0 && evidences.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed rounded-xl p-6 bg-muted/20">
        <Link2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/60" />
        <p className="text-sm font-medium text-foreground">No evidence artifacts uploaded yet</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Accredited researchers can append verified gazette notifications, parliamentary papers, or secondary reports via the Researcher Portal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Verifications Section */}
      {verifications.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Researcher Verification Records ({verifications.length})</span>
            </h4>
            <span className="text-[11px] text-muted-foreground">Click item to toggle audit notes</span>
          </div>

          <div className="space-y-2.5">
            {verifications.map((v) => {
              const expanded = expandedVerifications.has(v.id);
              return (
                <div
                  key={v.id}
                  className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleVerification(v.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/40 transition-colors"
                    aria-expanded={expanded}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                        {expanded ? (
                          <ChevronDown className="w-4 h-4 text-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                      <StatusBadge status={v.status} size="sm" />
                      <span className="text-xs text-muted-foreground font-medium">
                        {new Date(v.verifiedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {v.source && <TierBadge tier={v.source.tier} size="sm" />}
                    </div>
                  </button>

                  {expanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-border/60 bg-muted/15 space-y-4">
                      {v.notes && (
                        <div className="mt-2 text-xs leading-relaxed text-foreground bg-card p-3 rounded-lg border border-border">
                          <span className="font-semibold text-muted-foreground block mb-1 uppercase tracking-wider text-[10px]">
                            Methodological Notes
                          </span>
                          {v.notes}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground pt-1">
                        <div className="flex items-center gap-3">
                          {v.verifiedBy && (
                            <span className="inline-flex items-center gap-1.5 font-medium">
                              <User className="w-3.5 h-3.5 text-primary" />
                              <span>Verified by: {v.verifiedBy}</span>
                            </span>
                          )}
                        </div>

                        {v.source && (
                          <a
                            href={v.source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline bg-primary/5 px-2.5 py-1 rounded-md border border-primary/20"
                          >
                            <span>Inspect Source Document</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Evidence Items Section */}
      {evidences.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Documentary Artifacts ({evidences.length})</span>
            </h4>
            <span className="text-[11px] text-muted-foreground">Certified documentation items</span>
          </div>

          <div className="space-y-2.5">
            {evidences.map((e) => {
              const expanded = expandedEvidences.has(e.id);
              return (
                <div
                  key={e.id}
                  className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleEvidence(e.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/40 transition-colors"
                    aria-expanded={expanded}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                        {expanded ? (
                          <ChevronDown className="w-4 h-4 text-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
                        {e.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <TierBadge tier={e.source.tier} size="sm" />
                    </div>
                  </button>

                  {expanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-border/60 bg-muted/15 space-y-4">
                      <p className="text-xs leading-relaxed text-muted-foreground mt-2">
                        {e.description}
                      </p>

                      <div className="p-3.5 rounded-xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Building className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="font-bold text-foreground">{e.source.name}</span>
                            <Badge variant="outline" className="text-[10px] py-0">
                              {e.source.sourceType}
                            </Badge>
                          </div>
                          {e.publishedDate && (
                            <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                              <Calendar className="w-3 h-3" />
                              <span>
                                Published:{" "}
                                {new Date(e.publishedDate).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {e.evidenceUrl && (
                            <Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                              <a
                                href={e.evidenceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <span>Artifact Link</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </Button>
                          )}
                          <Button asChild variant="default" size="sm" className="h-8 text-xs gap-1.5">
                            <a
                              href={e.source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <span>Primary Source</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
