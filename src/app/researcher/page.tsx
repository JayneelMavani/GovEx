import { prisma } from "@/lib/prisma";
import { ResearcherClient } from "@/components/researcher-client";
import { FileSearch } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ResearcherPage() {
  const promises = await prisma.promise.findMany({
    include: {
      implementationStatus: true,
      manifesto: {
        include: {
          party: true,
          election: true,
        },
      },
      evidences: {
        include: { source: true },
      },
      verifications: {
        include: { source: true },
      },
      statusHistory: {
        orderBy: { changedAt: "asc" },
      },
    },
    orderBy: { title: "asc" },
  });

  const categories = [
    ...new Set(promises.map((p) => p.category)),
  ];

  const parties = [
    ...new Map(
      promises.map((p) => [
        p.manifesto.party.id,
        {
          id: p.manifesto.party.id,
          name: p.manifesto.party.name,
          abbreviation: p.manifesto.party.abbreviation,
        },
      ])
    ).values(),
  ];

  // Serialize for client
  const serialized = promises.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    sourceText: p.sourceText,
    partyName: p.manifesto.party.name,
    partyAbbreviation: p.manifesto.party.abbreviation,
    electionName: p.manifesto.election.name,
    manifestoTitle: p.manifesto.title,
    status: p.implementationStatus?.status || null,
    statusExplanation: p.implementationStatus?.explanation || null,
    lastUpdated: p.implementationStatus?.lastUpdated?.toISOString() || null,
    evidences: p.evidences.map((e) => ({
      title: e.title,
      description: e.description,
      evidenceUrl: e.evidenceUrl,
      publishedDate: e.publishedDate?.toISOString() || null,
      sourceName: e.source.name,
      sourceUrl: e.source.url,
      sourceType: e.source.sourceType,
      sourceTier: e.source.tier,
    })),
    verifications: p.verifications.map((v) => ({
      status: v.status,
      notes: v.notes,
      verifiedAt: v.verifiedAt.toISOString(),
      verifiedBy: v.verifiedBy,
      sourceName: v.source?.name || null,
      sourceTier: v.source?.tier || null,
    })),
    statusHistory: p.statusHistory.map((h) => ({
      status: h.status,
      explanation: h.explanation,
      changedAt: h.changedAt.toISOString(),
      changedBy: h.changedBy,
    })),
  }));

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/20 py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FileSearch className="w-5 h-5" />
            </div>
            <Badge variant="outline" className="text-xs uppercase font-bold tracking-wider">
              Accredited Research Workspace
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mb-2">
            Researcher Evidence Repository
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
            Forensic analysis, tiered evidence auditing, filtering, and machine-readable data export (CSV/JSON) for academic and investigative researchers.
          </p>
        </div>

        <ResearcherClient
          promises={serialized}
          categories={categories}
          parties={parties}
        />
      </div>
    </div>
  );
}
