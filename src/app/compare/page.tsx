import { prisma } from "@/lib/prisma";
import { CompareClient } from "@/components/compare-client";
import { Settings, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

function HeroIllustration() {
  return (
    <div className="hidden lg:flex relative w-80 h-32 rounded-2xl bg-muted/40 border border-border p-4 shadow-2xs items-center justify-between overflow-hidden shrink-0">
      {/* Floating report card mockup */}
      <div className="relative z-10 w-44 rounded-xl bg-card border border-border p-2.5 shadow-xs">
        <div className="h-2.5 w-16 bg-blue-500/80 rounded-sm mb-2" />
        <div className="space-y-1 mb-2.5">
          <div className="h-1 w-full bg-muted rounded" />
          <div className="h-1 w-3/4 bg-muted rounded" />
        </div>
        {/* Mini bars */}
        <div className="flex items-end gap-1.5 h-8 pt-1 border-t border-border">
          <div className="w-2 h-3.5 bg-blue-300 dark:bg-blue-600 rounded-t-xs" />
          <div className="w-2 h-6 bg-blue-500 dark:bg-blue-500 rounded-t-xs" />
          <div className="w-2 h-4.5 bg-indigo-400 dark:bg-indigo-500 rounded-t-xs" />
          <div className="w-2 h-7 bg-purple-500 dark:bg-purple-500 rounded-t-xs" />
        </div>
      </div>

      {/* Balance scale visual */}
      <div className="relative z-10 flex flex-col items-center justify-center pr-3">
        <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground shadow-xs flex items-center justify-center">
          <Scale className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>
    </div>
  );
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const parties = await prisma.politicalParty.findMany({
    orderBy: { name: "asc" },
  });

  const categories = [
    ...new Set(
      (
        await prisma.promise.findMany({
          select: { category: true },
          distinct: ["category"],
        })
      ).map((p) => p.category)
    ),
  ];

  // Get all promises with statuses
  const promises = await prisma.promise.findMany({
    include: {
      implementationStatus: true,
      manifesto: {
        include: {
          party: true,
          election: true,
        },
      },
      _count: { select: { evidences: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950/20 py-8 lg:py-10">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Hero Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-1">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-blue-50/80 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200/80 dark:border-blue-800 text-[11px] uppercase font-bold tracking-wider px-2.5 py-1 flex items-center gap-1.5 shadow-2xs"
              >
                <Settings className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Empirical Benchmark</span>
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Political Party Comparative Matrix
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Directly benchmark commitments, evidentiary records, and verified progress between political parties across specific legislative and societal categories.
            </p>
          </div>

          <HeroIllustration />
        </div>

        <CompareClient
          parties={parties.map((p) => ({
            id: p.id,
            name: p.name,
            abbreviation: p.abbreviation,
          }))}
          categories={categories}
          promises={promises.map((p) => {
            const electionYear = p.manifesto?.election?.electionDate
              ? new Date(p.manifesto.election.electionDate).getFullYear()
              : 2024;
            return {
              id: p.id,
              title: p.title,
              description: p.description,
              category: p.category,
              partyId: p.manifesto.party.id,
              partyName: p.manifesto.party.name,
              partyAbbreviation: p.manifesto.party.abbreviation,
              status: p.implementationStatus?.status || null,
              explanation: p.implementationStatus?.explanation || null,
              evidenceCount: p._count.evidences,
              timeline: `${electionYear} – ${electionYear + 5}`,
            };
          })}
          initialCategory={category}
        />
      </div>
    </div>
  );
}
