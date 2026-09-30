import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui/badges";
import Link from "next/link";
import {
  BarChart3,
  ArrowRight,
  FileText,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ExternalLink,
  ScrollText,
  SearchCheck,
  FileSpreadsheet,
  CheckCheck,
  ShieldAlert,
  Sparkles,
  Building2,
  Calendar,
  Briefcase,
  HeartPulse,
  GraduationCap,
  Receipt,
  Users,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { HomeSearch } from "@/components/home-search";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

async function getHomeData() {
  const [elections, promises, statusCounts] = await Promise.all([
    prisma.election.findMany({
      include: {
        manifestos: {
          include: {
            party: true,
            promises: {
              include: {
                implementationStatus: true,
                _count: { select: { evidences: true } },
              },
            },
          },
        },
      },
      orderBy: { electionDate: "desc" },
    }),
    prisma.promise.findMany({
      include: { implementationStatus: true },
    }),
    prisma.implementationStatus.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  const totalPromises = promises.length;
  const statusMap: Record<string, number> = {};
  for (const s of statusCounts) {
    statusMap[s.status] = s._count.status;
  }

  return { elections, totalPromises, statusMap };
}

export default async function HomePage() {
  const { elections, totalPromises, statusMap } = await getHomeData();

  const statCards = [
    {
      label: "Documented Promises",
      value: totalPromises,
      subtext: "Across all parties & manifestos",
      icon: FileText,
      iconColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-900/50",
    },
    {
      label: "Implemented",
      value: statusMap["IMPLEMENTED"] || 0,
      subtext: "Verified by High Tier government gazettes",
      icon: CheckCircle2,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-200 dark:border-emerald-900/50",
    },
    {
      label: "In Progress / Partial",
      value: (statusMap["IN_PROGRESS"] || 0) + (statusMap["PARTIALLY_IMPLEMENTED"] || 0),
      subtext: "Active tenders, pilot projects or bills",
      icon: TrendingUp,
      iconColor: "text-amber-600 dark:text-amber-400",
      borderColor: "border-amber-200 dark:border-amber-900/50",
    },
    {
      label: "Stalled / Stagnant",
      value: statusMap["STALLED"] || 0,
      subtext: "No budgetary or executive momentum",
      icon: AlertTriangle,
      iconColor: "text-rose-600 dark:text-rose-400",
      borderColor: "border-rose-200 dark:border-rose-900/50",
    },
  ];

  const popularTopics = [
    { label: "Infrastructure", icon: Building2 },
    { label: "Employment", icon: Briefcase },
    { label: "Healthcare", icon: HeartPulse },
    { label: "Education", icon: GraduationCap },
    { label: "Taxation", icon: Receipt },
    { label: "Welfare", icon: Users },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 border-b border-border pt-16 pb-20">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Official badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verifiable Electoral Accountability</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground font-normal">Evidence Chain Standard</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground mb-6 leading-[1.15]">
            Every Electoral Promise.
            <br />
            <span className="text-blue-600 dark:text-blue-400">
              Backed by Primary Evidence.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed font-normal">
            GovEx tracks manifesto pledges using a verifiable audit trail. We present evidence, never political judgment.
          </p>

          {/* Forensic Evidence Chain Pill Bar */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4 py-2 rounded-2xl bg-card border border-border shadow-2xs mb-10 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <ScrollText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Promise</span>
            </span>
            <ArrowRight className="w-3 h-3 text-muted-foreground/60" />
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <SearchCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Verification</span>
            </span>
            <ArrowRight className="w-3 h-3 text-muted-foreground/60" />
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <FileSpreadsheet className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Evidence</span>
            </span>
            <ArrowRight className="w-3 h-3 text-muted-foreground/60" />
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Source</span>
            </span>
            <ArrowRight className="w-3 h-3 text-muted-foreground/60" />
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Status</span>
            </span>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <HomeSearch />
          </div>

          {/* Quick topic tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium">Quick Topics:</span>
            {popularTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <Link
                  key={topic.label}
                  href={`/elections/search?q=${encodeURIComponent(topic.label)}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{topic.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className={`border ${stat.borderColor} bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden relative`}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {stat.label}
                    </span>
                    <div className="p-2 rounded-lg bg-muted/80">
                      <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <div className="text-3xl font-black tracking-tight text-foreground mb-1">
                    {stat.value}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    {stat.subtext}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Main Content Area: Elections & Manifestos */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Elections &amp; Manifesto Records
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Explore tracked promises grouped by election, jurisdiction, and political party.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/compare">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span>Cross-Party Comparison</span>
            </Link>
          </Button>
        </div>

        {elections.length === 0 ? (
          <Card className="text-center py-16 border-dashed">
            <CardContent>
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No election data loaded</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                No elections currently registered. Please initialize the database with seed records.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {elections.map((election) => (
              <Card key={election.id} className="overflow-hidden border-border shadow-sm">
                {/* Election Header Bar */}
                <div className="p-5 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-blue-600/80 hover:bg-blue-600 text-white font-semibold text-[10px]">
                        {election.level}
                      </Badge>
                      <span className="text-xs text-slate-300 font-medium">{election.jurisdiction}</span>
                    </div>
                    <Link
                      href={`/elections/${election.id}`}
                      className="text-xl sm:text-2xl font-extrabold hover:text-blue-300 transition-colors"
                    >
                      {election.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        Election Date:{" "}
                        {new Date(election.electionDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 text-white gap-1.5 shrink-0 self-start sm:self-center">
                    <Link href={`/elections/${election.id}`}>
                      <span>View All Election Promises</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>

                {/* Party Manifestos Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-slate-50/60 dark:bg-slate-900/40 border-t border-border">
                  {election.manifestos.map((manifesto) => {
                    const implementedCount = manifesto.promises.filter(
                      (p) => p.implementationStatus?.status === "IMPLEMENTED"
                    ).length;
                    const inProgressCount = manifesto.promises.filter(
                      (p) =>
                        p.implementationStatus?.status === "IN_PROGRESS" ||
                        p.implementationStatus?.status === "PARTIALLY_IMPLEMENTED"
                    ).length;

                    return (
                      <div
                        key={manifesto.id}
                        className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all duration-200"
                      >
                        <div>
                          {/* Party Header */}
                          <div className="flex items-start justify-between gap-3 mb-4 pb-3.5 border-b border-border/80">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-blue-500/20" />
                                <Link
                                  href={`/manifestos/${manifesto.id}`}
                                  className="font-bold text-base text-foreground hover:text-primary transition-colors"
                                >
                                  {manifesto.party.name}
                                </Link>
                                <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                                  {manifesto.party.abbreviation}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Manifesto: <span className="font-medium text-foreground">{manifesto.title}</span>
                              </p>
                              {/* Quick summary chips */}
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground">
                                  <FileText className="w-3 h-3 text-muted-foreground" />
                                  <span>{manifesto.promises.length} Pledges</span>
                                </span>
                                {implementedCount > 0 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                    <span>{implementedCount} Implemented</span>
                                  </span>
                                )}
                                {inProgressCount > 0 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400">
                                    <TrendingUp className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                    <span>{inProgressCount} In Progress</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {manifesto.documentUrl && (
                              <Button asChild variant="outline" size="sm" className="h-8 px-2.5 text-xs text-muted-foreground hover:text-primary gap-1 shrink-0">
                                <a
                                  href={manifesto.documentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Open primary source manifesto document"
                                >
                                  <span>Official PDF</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </Button>
                            )}
                          </div>

                          {/* Promise List */}
                          <div className="space-y-2.5 mb-4">
                            {manifesto.promises.slice(0, 4).map((promise) => (
                              <Link
                                key={promise.id}
                                href={`/promises/${promise.id}`}
                                className="group block p-3 rounded-lg border border-border/70 bg-muted/20 hover:bg-muted/60 hover:border-primary/30 transition-all duration-150"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                      {promise.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                                        <Tag className="w-3 h-3 text-muted-foreground/70" />
                                        <span>{promise.category}</span>
                                      </span>
                                      <span className="text-muted-foreground/40">•</span>
                                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                        <FileText className="w-3 h-3 text-muted-foreground/70" />
                                        <span>{promise._count.evidences} evidence document{promise._count.evidences !== 1 ? "s" : ""}</span>
                                      </span>
                                    </div>
                                  </div>
                                  <div className="shrink-0 pt-0.5">
                                    {promise.implementationStatus ? (
                                      <StatusBadge
                                        status={promise.implementationStatus.status}
                                        size="sm"
                                      />
                                    ) : (
                                      <Badge variant="outline" className="text-[11px]">Unevaluated</Badge>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>

                        {/* Footer CTA */}
                        <div className="pt-2">
                          <Button asChild variant="outline" size="sm" className="w-full justify-between hover:bg-primary hover:text-primary-foreground transition-colors">
                            <Link href={`/manifestos/${manifesto.id}`}>
                              <span>Explore all {manifesto.promises.length} promises from {manifesto.party.abbreviation}</span>
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* How It Works: The 4-Step Chain */}
      <section className="bg-slate-50 dark:bg-slate-900/60 border-t border-border py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" className="mb-3 text-xs uppercase tracking-wider font-bold">
              Traceable Methodology
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              How GovEx Verifies Each Promise
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Unlike subjective political report cards, GovEx converts every commitment into a forensic evidentiary record.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {[
              {
                step: "01",
                title: "Promise Ingestion",
                desc: "Every manifesto pledge is extracted verbatim with page numbers and original contextual language.",
                icon: ScrollText,
                color: "text-blue-600 dark:text-blue-400",
                bg: "bg-blue-50 dark:bg-blue-950",
              },
              {
                step: "02",
                title: "Research Verification",
                desc: "Credentialed researchers cross-examine claims against legislative dockets, budgets, and official records.",
                icon: SearchCheck,
                color: "text-indigo-600 dark:text-indigo-400",
                bg: "bg-indigo-50 dark:bg-indigo-950",
              },
              {
                step: "03",
                title: "Tiered Evidence Chain",
                desc: "Each finding is chained to primary sources (High: Gazettes/Budgets, Med: Statements, Supporting: Press).",
                icon: FileSpreadsheet,
                color: "text-purple-600 dark:text-purple-400",
                bg: "bg-purple-50 dark:bg-purple-950",
              },
              {
                step: "04",
                title: "Status Determination",
                desc: "Status is awarded strictly based on evidentiary tier criteria. Implemented status requires High Tier proof.",
                icon: CheckCheck,
                color: "text-emerald-600 dark:text-emerald-400",
                bg: "bg-emerald-50 dark:bg-emerald-950",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.step} className="border-border shadow-xs hover:shadow-md transition-shadow relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2.5 rounded-xl ${item.bg}`}>
                        <Icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <span className="text-xs font-black text-muted-foreground/60 tracking-wider">
                        STEP {item.step}
                      </span>
                    </div>
                    <CardTitle className="text-base font-bold text-foreground">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Principle Callout */}
          <div className="mt-12 p-6 rounded-2xl bg-card border border-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">
                  Strict Evidence Rule Enforced
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  A promise can NEVER be marked as &quot;Implemented&quot; or &quot;Partially Implemented&quot; without at least one verified <strong className="text-foreground">High Tier</strong> official government gazette or legislative enactment.
                </p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="shrink-0 gap-1.5">
              <Link href="/compare">
                <span>View Comparison Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
