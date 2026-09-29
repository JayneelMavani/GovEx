import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { StatusBadge, EvidenceCountBadge } from "@/components/ui/badges";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Filter, ChevronRight, Layers } from "lucide-react";
import { PromiseFilters } from "@/components/promise-filters";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ElectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ category?: string; status?: string; party?: string; q?: string }>;
}) {
  const { id } = await params;
  const filters = await searchParams;

  const election = await prisma.election.findUnique({
    where: { id },
    include: {
      manifestos: {
        include: {
          party: true,
        },
      },
    },
  });

  if (!election) notFound();

  // Build promise query with filters
  const whereClause: Record<string, unknown> = {
    manifesto: { electionId: id },
  };

  if (filters.category) {
    whereClause.category = filters.category;
  }

  if (filters.status) {
    whereClause.implementationStatus = { status: filters.status };
  }

  if (filters.party) {
    (whereClause.manifesto as Record<string, unknown>).partyId = filters.party;
  }

  if (filters.q) {
    whereClause.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  const promises = await prisma.promise.findMany({
    where: whereClause as never,
    include: {
      implementationStatus: true,
      manifesto: { include: { party: true } },
      _count: { select: { evidences: true } },
    },
    orderBy: { title: "asc" },
  });

  const categories = [
    ...new Set(
      (
        await prisma.promise.findMany({
          where: { manifesto: { electionId: id } },
          select: { category: true },
          distinct: ["category"],
        })
      ).map((p) => p.category)
    ),
  ];

  const parties = election.manifestos.map((m) => ({
    id: m.party.id,
    name: m.party.name,
    abbreviation: m.party.abbreviation,
  }));

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/20 py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground">
          <Link href="/">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to overview</span>
          </Link>
        </Button>

        {/* Election Header Card */}
        <Card className="border-border shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 bg-slate-900 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className="bg-blue-600 text-white font-bold text-xs uppercase tracking-wider">
                {election.level} Election
              </Badge>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                {election.jurisdiction}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-3">
              {election.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mb-6">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>
                  Held on:{" "}
                  {new Date(election.electionDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-400" />
                <span>{election.manifestos.length} Manifestos on Record</span>
              </span>
            </div>

            {/* Parties Manifestos Pills */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Contesting Parties:</span>
              {election.manifestos.map((m) => (
                <Link
                  key={m.id}
                  href={`/manifestos/${m.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
                >
                  <span>{m.party.name}</span>
                  <span className="text-blue-400">({m.party.abbreviation})</span>
                </Link>
              ))}
            </div>
          </div>
        </Card>

        {/* Filter bar */}
        <PromiseFilters
          categories={categories}
          parties={parties}
          currentCategory={filters.category}
          currentStatus={filters.status}
          currentParty={filters.party}
          currentQuery={filters.q}
          basePath={`/elections/${id}`}
        />

        {/* Promises Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {promises.length} PLEDGE{promises.length !== 1 ? "S" : ""} RECORDED
            </p>
          </div>

          {promises.length === 0 ? (
            <Card className="text-center py-16 border-dashed">
              <CardContent>
                <Filter className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
                <h3 className="text-base font-bold text-foreground mb-1">
                  No matching promises found
                </h3>
                <p className="text-xs text-muted-foreground">
                  Try adjusting the party, category, or search filters above.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {promises.map((promise) => (
                <Link
                  key={promise.id}
                  href={`/promises/${promise.id}`}
                  className="group block"
                >
                  <Card className="h-full border-border hover:border-primary/40 hover:shadow-xs transition-all duration-200">
                    <CardContent className="p-5 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] font-bold uppercase">
                              {promise.manifesto.party.abbreviation}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-medium">
                              {promise.category}
                            </span>
                          </div>
                          {promise.implementationStatus && (
                            <StatusBadge status={promise.implementationStatus.status} size="sm" />
                          )}
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                          {promise.title}
                        </h3>

                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                          {promise.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                        <EvidenceCountBadge count={promise._count.evidences} />
                        <span className="text-primary font-semibold group-hover:underline flex items-center gap-1 text-[11px]">
                          <span>Audit Trail</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
