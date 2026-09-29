import { prisma } from "@/lib/prisma";
import { AdminClient } from "@/components/admin-client";
import { Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [elections, parties, manifestos, promises, sources] = await Promise.all([
    prisma.election.findMany({ orderBy: { name: "asc" } }),
    prisma.politicalParty.findMany({ orderBy: { name: "asc" } }),
    prisma.manifesto.findMany({
      include: { party: true, election: true },
      orderBy: { title: "asc" },
    }),
    prisma.promise.findMany({
      include: {
        implementationStatus: true,
        manifesto: { include: { party: true } },
        _count: { select: { evidences: true, verifications: true } },
      },
      orderBy: { title: "asc" },
    }),
    prisma.source.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/20 py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Settings className="w-5 h-5" />
            </div>
            <Badge variant="outline" className="text-xs uppercase font-bold tracking-wider">
              System Administration
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mb-2">
            GovEx Administration Console
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
            Manage electoral metadata, manifestos, verified commitments, documentary evidence chains, and status records under strict audit protocols.
          </p>
        </div>

        <AdminClient
          elections={elections.map((e) => ({
            id: e.id,
            name: e.name,
          }))}
          parties={parties.map((p) => ({
            id: p.id,
            name: p.name,
            abbreviation: p.abbreviation,
          }))}
          manifestos={manifestos.map((m) => ({
            id: m.id,
            title: m.title,
            partyName: m.party.name,
            electionName: m.election.name,
          }))}
          promises={promises.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            sourceText: p.sourceText,
            category: p.category,
            manifestoId: p.manifestoId,
            partyAbbreviation: p.manifesto.party.abbreviation,
            status: p.implementationStatus?.status || null,
            evidenceCount: p._count.evidences,
            verificationCount: p._count.verifications,
          }))}
          sources={sources.map((s) => ({
            id: s.id,
            name: s.name,
            url: s.url,
            sourceType: s.sourceType,
            tier: s.tier,
          }))}
        />
      </div>
    </div>
  );
}
