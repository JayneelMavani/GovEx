import { prisma } from "@/lib/prisma";
import { StatusBadge, EvidenceCountBadge } from "@/components/ui/badges";
import Link from "next/link";
import { ArrowLeft, Search, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HomeSearch } from "@/components/home-search";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || "";

  const promises = query
    ? await prisma.promise.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            {
              manifesto: {
                party: {
                  name: { contains: query, mode: "insensitive" },
                },
              },
            },
          ],
        },
        include: {
          implementationStatus: true,
          manifesto: { include: { party: true, election: true } },
          _count: { select: { evidences: true } },
        },
        orderBy: { title: "asc" },
      })
    : [];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/20 py-8 lg:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground">
          <Link href="/">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>
        </Button>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs uppercase font-bold tracking-wider">
              Search Results
            </Badge>
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            Query: &ldquo;{query}&rdquo;
          </h1>
          <p className="text-sm text-muted-foreground">
            Found <strong className="text-foreground">{promises.length}</strong> matching commitment{promises.length !== 1 ? "s" : ""} across all verified manifestos.
          </p>

          <div className="pt-2">
            <HomeSearch />
          </div>
        </div>

        {promises.length === 0 ? (
          <Card className="text-center py-16 border-dashed">
            <CardContent>
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="text-lg font-bold text-foreground mb-1">
                No matching commitments found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Try searching for broader terms like &quot;tax&quot;, &quot;highway&quot;, &quot;clinic&quot;, or &quot;energy&quot;.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3.5">
            {promises.map((promise) => (
              <Link
                key={promise.id}
                href={`/promises/${promise.id}`}
                className="group block"
              >
                <Card className="border-border hover:border-primary/40 hover:shadow-xs transition-all duration-200">
                  <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase">
                          {promise.manifesto.party.abbreviation}
                        </Badge>
                        <span className="font-medium text-foreground/80">{promise.manifesto.party.name}</span>
                        <span>•</span>
                        <span>{promise.manifesto.election.name}</span>
                      </div>

                      <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {promise.title}
                      </h3>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {promise.description}
                      </p>

                      <div className="flex items-center gap-2 pt-1">
                        <Badge variant="secondary" className="text-[10px] py-0 h-4">
                          {promise.category}
                        </Badge>
                        <EvidenceCountBadge count={promise._count.evidences} />
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-3">
                      {promise.implementationStatus && (
                        <StatusBadge status={promise.implementationStatus.status} size="sm" />
                      )}
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors hidden sm:block" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
