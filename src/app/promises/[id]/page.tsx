import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { StatusBadge, TierBadge } from "@/components/ui/badges";
import { STATUS_CONFIG } from "@/lib/constants";
import Link from "next/link";
import {
  ExternalLink,
  Quote,
  Clock,
  Link2,
  Shield,
  Info,
  ChevronRight,
  Tag,
} from "lucide-react";
import { EvidenceTrail } from "@/components/evidence-trail";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const dynamic = "force-dynamic";

export default async function PromisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const promise = await prisma.promise.findUnique({
    where: { id },
    include: {
      manifesto: {
        include: {
          party: true,
          election: true,
        },
      },
      implementationStatus: true,
      evidences: {
        include: { source: true },
        orderBy: { publishedDate: "desc" },
      },
      verifications: {
        include: { source: true },
        orderBy: { verifiedAt: "desc" },
      },
      statusHistory: {
        orderBy: { changedAt: "asc" },
      },
    },
  });

  if (!promise) notFound();

  const status = promise.implementationStatus;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/20 py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground transition-colors font-medium">
            GovEx Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
          <Link
            href={`/elections/${promise.manifesto.election.id}`}
            className="hover:text-foreground transition-colors font-medium truncate max-w-[180px]"
          >
            {promise.manifesto.election.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
          <Link
            href={`/manifestos/${promise.manifesto.id}`}
            className="hover:text-foreground transition-colors font-medium"
          >
            {promise.manifesto.party.abbreviation}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span className="text-foreground font-semibold truncate max-w-[260px]">
            {promise.title}
          </span>
        </nav>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Promise Header Card */}
            <Card className="border-border shadow-sm overflow-hidden">
              <CardContent className="p-6 sm:p-8">
                {/* Meta pills */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge variant="default" className="text-xs font-bold uppercase tracking-wider">
                    {promise.manifesto.party.abbreviation}
                  </Badge>
                  <Badge variant="secondary" className="text-xs font-semibold gap-1">
                    <Tag className="w-3 h-3 text-muted-foreground" />
                    <span>{promise.category}</span>
                  </Badge>
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Record ID: {promise.id.slice(0, 8)}
                  </Badge>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-4 leading-snug">
                  {promise.title}
                </h1>

                <p className="text-base text-muted-foreground leading-relaxed mb-6 font-normal">
                  {promise.description}
                </p>

                {/* Original Verbatim Quote */}
                {promise.sourceText && (
                  <div className="relative rounded-xl border border-primary/20 bg-primary/5 p-5 mt-6">
                    <div className="flex items-start gap-3">
                      <Quote className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <p className="text-xs uppercase font-bold tracking-wider text-primary">
                          Verbatim Manifesto Commitment
                        </p>
                        <blockquote className="text-sm font-medium text-foreground italic leading-relaxed">
                          &ldquo;{promise.sourceText}&rdquo;
                        </blockquote>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                          <span>Source: {promise.manifesto.title}</span>
                          {promise.manifesto.documentUrl && (
                            <a
                              href={promise.manifesto.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline font-semibold ml-2"
                            >
                              <span>Official Document</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Implementation Status Banner */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg font-bold">
                      Current Implementation Determination
                    </CardTitle>
                  </div>
                  {status && (
                    <StatusBadge status={status.status} size="lg" />
                  )}
                </div>
                <CardDescription className="text-xs">
                  Determination derived strictly from verified primary documentation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {status ? (
                  <>
                    <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">Evidentiary Summary</span>
                        <span>
                          Last verified:{" "}
                          {new Date(status.lastUpdated).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {status.explanation || "No textual explanation provided for this status."}
                      </p>
                    </div>

                    <Alert variant="info" className="py-3">
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <AlertDescription className="text-xs text-blue-900 dark:text-blue-200">
                        Status is awarded mechanically based on verified documentation. &quot;Implemented&quot; and &quot;Partially Implemented&quot; designations require certified <strong>High Tier</strong> government gazette records.
                      </AlertDescription>
                    </Alert>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No status has been officially logged for this promise yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Evidence Trail Component */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg font-bold">
                      Auditable Evidence Chain
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold">
                    {promise.evidences.length} Artifacts / {promise.verifications.length} Verifications
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Promise → Verification → Evidence → Source: Full chain of custody with source tier attribution.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EvidenceTrail
                  verifications={promise.verifications.map((v) => ({
                    id: v.id,
                    status: v.status,
                    notes: v.notes,
                    verifiedAt: v.verifiedAt.toISOString(),
                    verifiedBy: v.verifiedBy,
                    source: v.source
                      ? {
                          id: v.source.id,
                          name: v.source.name,
                          url: v.source.url,
                          sourceType: v.source.sourceType,
                          tier: v.source.tier,
                        }
                      : null,
                  }))}
                  evidences={promise.evidences.map((e) => ({
                    id: e.id,
                    title: e.title,
                    description: e.description,
                    evidenceUrl: e.evidenceUrl,
                    publishedDate: e.publishedDate?.toISOString() || null,
                    source: {
                      id: e.source.id,
                      name: e.source.name,
                      url: e.source.url,
                      sourceType: e.source.sourceType,
                      tier: e.source.tier,
                    },
                  }))}
                />
              </CardContent>
            </Card>

            {/* Status History Timeline */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg font-bold">
                    Historical Status Ledger
                  </CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Chronological record of every status transition and justification.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {promise.statusHistory.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    No status transition history recorded for this entry yet.
                  </p>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                    {promise.statusHistory.map((entry) => {
                      const config = STATUS_CONFIG[entry.status];
                      return (
                        <div key={entry.id} className="relative group">
                          {/* Dot indicator */}
                          <div
                            className="absolute -left-[19px] top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-card transition-all group-hover:scale-110"
                            style={{ borderColor: config.color }}
                          />
                          <div className="bg-muted/30 border border-border/80 rounded-xl p-4 shadow-2xs">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <StatusBadge status={entry.status} size="sm" />
                              <span className="text-xs text-muted-foreground font-medium">
                                {new Date(entry.changedAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                            {entry.explanation && (
                              <p className="text-xs text-foreground leading-relaxed mt-1">
                                {entry.explanation}
                              </p>
                            )}
                            {entry.changedBy && (
                              <p className="text-[11px] text-muted-foreground mt-2">
                                Authenticated user: <span className="font-semibold text-foreground/80">{entry.changedBy}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Metadata Card */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Record Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5 text-xs">
                <div>
                  <span className="text-muted-foreground block mb-0.5">Political Party</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-sm">
                      {promise.manifesto.party.name}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {promise.manifesto.party.abbreviation}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <span className="text-muted-foreground block mb-0.5">Election & Jurisdiction</span>
                  <Link
                    href={`/elections/${promise.manifesto.election.id}`}
                    className="font-semibold text-primary hover:underline block"
                  >
                    {promise.manifesto.election.name}
                  </Link>
                  <span className="text-muted-foreground text-[11px]">
                    {promise.manifesto.election.jurisdiction} • {promise.manifesto.election.level}
                  </span>
                </div>

                <Separator />

                <div>
                  <span className="text-muted-foreground block mb-0.5">Policy Category</span>
                  <span className="font-medium text-foreground">{promise.category}</span>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border/60 text-center">
                    <span className="text-lg font-bold text-foreground block">
                      {promise.evidences.length}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                      Evidence Items
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border/60 text-center">
                    <span className="text-lg font-bold text-foreground block">
                      {promise.verifications.length}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                      Verifications
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Source Tier Summary Card */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Evidentiary Quality Tier
                </CardTitle>
                <CardDescription className="text-xs">
                  Breakdown of supporting documentation quality.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(["HIGH", "MEDIUM", "SUPPORTING"] as const).map((tier) => {
                  const count = promise.evidences.filter((e) => e.source.tier === tier).length;
                  return (
                    <div
                      key={tier}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/50"
                    >
                      <TierBadge tier={tier} size="sm" showDescription />
                      <span className="text-xs font-bold text-foreground">
                        {count} item{count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Compare CTA Card */}
            <Card className="border-blue-200 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 dark:from-blue-950/40 dark:to-indigo-950/20 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-blue-950 dark:text-blue-100">
                  Cross-Party Category Benchmark
                </CardTitle>
                <CardDescription className="text-xs text-blue-800/80 dark:text-blue-300/80">
                  Compare how different political parties performed on &quot;{promise.category}&quot;.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Button asChild size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  <Link href={`/compare?category=${encodeURIComponent(promise.category)}`}>
                    <span>Compare {promise.category} Promises</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
