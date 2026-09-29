import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { StatusBadge, EvidenceCountBadge } from "@/components/ui/badges";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ChevronRight, Filter } from "lucide-react";
import { PromiseFilters } from "@/components/promise-filters";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ManifestoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ category?: string; status?: string; q?: string }>;
}) {
  const { id } = await params;
  const filters = await searchParams;

  const manifesto = await prisma.manifesto.findUnique({
    where: { id },
    include: {
      party: true,
      election: true,
    },
  });

  if (!manifesto) notFound();

  const whereClause: Record<string, unknown> = {
    manifestoId: id,
  };

  if (filters.category) {
    whereClause.category = filters.category;
  }
  if (filters.status) {
    whereClause.implementationStatus = { status: filters.status };
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
      _count: { select: { evidences: true } },
    },
    orderBy: { title: "asc" },
  });

  const categories = [
    ...new Set(
      (
        await prisma.promise.findMany({
          where: { manifestoId: id },
          select: { category: true },
          distinct: ["category"],
        })
      ).map((p) => p.category)
    ),
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/20 py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground">
          <Link href={`/elections/${manifesto.election.id}`}>
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {manifesto.election.name}</span>
          </Link>
        </Button>

        {/* Manifesto Header Card */}
        <Card className="border-border shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 bg-slate-900 text-white">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-blue-600 text-white font-bold text-xs uppercase tracking-wider">
                    {manifesto.party.abbreviation}
                  </Badge>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-300 font-medium">
                    {manifesto.election.name}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
                  {manifesto.title}
                </h1>

                <p className="text-sm text-slate-300">
                  Published by <span className="font-semibold text-white">{manifesto.party.name}</span>
                  {manifesto.publishedDate && (
                    <>
                      {" "}•{" "}
                      {new Date(manifesto.publishedDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </>
                  )}
                  {" "}• Version {manifesto.version}
                </p>
              </div>

              {manifesto.documentUrl && (
                <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white gap-2 shrink-0">
                  <a
                    href={manifesto.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Official Document</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Filters */}
        <PromiseFilters
          categories={categories}
          parties={[]}
          currentCategory={filters.category}
          currentStatus={filters.status}
          currentQuery={filters.q}
          basePath={`/manifestos/${id}`}
        />

        {/* Promises Grid */}
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {promises.length} PROMISE{promises.length !== 1 ? "S" : ""} CATALOGUED
          </p>

          {promises.length === 0 ? (
            <Card className="text-center py-16 border-dashed">
              <CardContent>
                <Filter className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
                <h3 className="text-base font-bold text-foreground mb-1">
                  No promises found
                </h3>
                <p className="text-xs text-muted-foreground">
                  Try adjusting the filter criteria above.
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
                          <Badge variant="outline" className="text-[11px] font-semibold">
                            {promise.category}
                          </Badge>
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
                          <span>Evidence Trail</span>
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
