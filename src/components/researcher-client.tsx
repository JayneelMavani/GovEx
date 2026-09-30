"use client";

import { useState, useMemo } from "react";
import { PromiseStatus, SourceTier } from "@prisma/client";
import { STATUS_CONFIG, ALL_STATUSES } from "@/lib/constants";
import { StatusBadge } from "@/components/ui/badges";
import Link from "next/link";
import {
  Search,
  Filter,
  FileJson,
  Sheet,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface EvidenceItem {
  title: string;
  description: string;
  evidenceUrl: string | null;
  publishedDate: string | null;
  sourceName: string;
  sourceUrl: string;
  sourceType: string;
  sourceTier: SourceTier;
}

interface PromiseData {
  id: string;
  title: string;
  description: string;
  category: string;
  sourceText: string | null;
  partyName: string;
  partyAbbreviation: string;
  electionName: string;
  manifestoTitle: string;
  status: PromiseStatus | null;
  statusExplanation: string | null;
  lastUpdated: string | null;
  evidences: EvidenceItem[];
  verifications: {
    status: PromiseStatus;
    notes: string | null;
    verifiedAt: string;
    verifiedBy: string | null;
    sourceName: string | null;
    sourceTier: SourceTier | null;
  }[];
  statusHistory: {
    status: PromiseStatus;
    explanation: string | null;
    changedAt: string;
    changedBy: string | null;
  }[];
}

interface ResearcherClientProps {
  promises: PromiseData[];
  categories: string[];
  parties: { id: string; name: string; abbreviation: string }[];
}

export function ResearcherClient({
  promises,
  categories,
  parties,
}: ResearcherClientProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [partyFilter, setPartyFilter] = useState("ALL");
  const [tierFilter, setTierFilter] = useState("ALL");

  const filtered = useMemo(() => {
    return promises.filter((p) => {
      if (
        search &&
        !p.title.toLowerCase().includes(search.toLowerCase()) &&
        !p.description.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      if (categoryFilter && categoryFilter !== "ALL" && p.category !== categoryFilter) return false;
      if (statusFilter && statusFilter !== "ALL" && p.status !== statusFilter) return false;
      if (partyFilter && partyFilter !== "ALL" && p.partyAbbreviation !== partyFilter) return false;
      if (tierFilter && tierFilter !== "ALL") {
        const hasRequiredTier = p.evidences.some(
          (e) => e.sourceTier === tierFilter
        );
        if (!hasRequiredTier) return false;
      }
      return true;
    });
  }, [promises, search, categoryFilter, statusFilter, partyFilter, tierFilter]);

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("ALL");
    setStatusFilter("ALL");
    setPartyFilter("ALL");
    setTierFilter("ALL");
  };

  const hasFilters = Boolean(
    search ||
    categoryFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    partyFilter !== "ALL" ||
    tierFilter !== "ALL"
  );

  const exportCSV = () => {
    const headers = [
      "Promise Title",
      "Description",
      "Category",
      "Party",
      "Election",
      "Status",
      "Status Explanation",
      "Last Updated",
      "Evidence Count",
      "High Tier Evidence",
      "Medium Tier Evidence",
      "Supporting Evidence",
      "Verification Count",
      "Source Text",
    ];

    const rows = filtered.map((p) => [
      p.title,
      p.description,
      p.category,
      p.partyName,
      p.electionName,
      p.status || "N/A",
      p.statusExplanation || "",
      p.lastUpdated || "",
      p.evidences.length,
      p.evidences.filter((e) => e.sourceTier === "HIGH").length,
      p.evidences.filter((e) => e.sourceTier === "MEDIUM").length,
      p.evidences.filter((e) => e.sourceTier === "SUPPORTING").length,
      p.verifications.length,
      p.sourceText || "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    downloadFile(csv, "govex-promises.csv", "text/csv");
  };

  const exportJSON = () => {
    const data = filtered.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      party: p.partyName,
      election: p.electionName,
      manifesto: p.manifestoTitle,
      sourceText: p.sourceText,
      status: p.status,
      statusExplanation: p.statusExplanation,
      lastUpdated: p.lastUpdated,
      evidences: p.evidences,
      verifications: p.verifications,
      statusHistory: p.statusHistory,
    }));

    downloadFile(
      JSON.stringify(data, null, 2),
      "govex-promises.json",
      "application/json"
    );
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <Card className="border-border shadow-xs bg-card">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-[2] min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search across all commitments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 text-sm"
              />
            </div>

            <div className="flex-1 min-w-[150px]">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  {ALL_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_CONFIG[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <Select value={partyFilter} onValueChange={setPartyFilter}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="All Parties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Parties</SelectItem>
                  {parties.map((p) => (
                    <SelectItem key={p.id} value={p.abbreviation}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Any Quality Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Any Quality Tier</SelectItem>
                  <SelectItem value="HIGH">Requires HIGH Tier</SelectItem>
                  <SelectItem value="MEDIUM">Requires MEDIUM Tier</SelectItem>
                  <SelectItem value="SUPPORTING">Requires SUPPORTING Tier</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-10 px-3 text-muted-foreground hover:text-foreground gap-1.5 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dataset Summary & Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-bold text-xs">
            {filtered.length} matched
          </Badge>
          <span className="text-xs text-muted-foreground">
            out of {promises.length} catalogued promises
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="h-9 gap-1.5 text-xs font-semibold"
          >
            <Sheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportJSON}
            className="h-9 gap-1.5 text-xs font-semibold"
          >
            <FileJson className="w-3.5 h-3.5 text-blue-600" />
            <span>Export JSON</span>
          </Button>
        </div>
      </div>

      {/* Results Table with shadcn Table */}
      <Card className="border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[38%] font-bold">Promise Title</TableHead>
              <TableHead className="w-[12%] font-bold">Party</TableHead>
              <TableHead className="w-[14%] font-bold">Category</TableHead>
              <TableHead className="w-[16%] font-bold">Status</TableHead>
              <TableHead className="w-[10%] text-center font-bold">Evidence</TableHead>
              <TableHead className="w-[10%] text-center font-bold">High Tier</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                  <Filter className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-medium text-sm">No promises match the specified criteria.</p>
                  <p className="text-xs text-muted-foreground mt-1">Try resetting the filter toolbar above.</p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => {
                const highTierCount = p.evidences.filter((e) => e.sourceTier === "HIGH").length;
                return (
                  <TableRow key={p.id} className="group">
                    <TableCell className="align-top py-3.5">
                      <Link
                        href={`/promises/${p.id}`}
                        className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 block text-sm"
                      >
                        {p.title}
                      </Link>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {p.description}
                      </p>
                    </TableCell>
                    <TableCell className="align-top py-3.5">
                      <Badge variant="outline" className="font-bold text-[10px] uppercase">
                        {p.partyAbbreviation}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-top py-3.5 text-xs font-medium text-muted-foreground">
                      {p.category}
                    </TableCell>
                    <TableCell className="align-top py-3.5">
                      {p.status ? (
                        <StatusBadge status={p.status} size="sm" />
                      ) : (
                        <span className="text-xs text-muted-foreground italic">None</span>
                      )}
                    </TableCell>
                    <TableCell className="align-top py-3.5 text-center text-xs font-bold text-foreground">
                      {p.evidences.length}
                    </TableCell>
                    <TableCell className="align-top py-3.5 text-center">
                      {highTierCount > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <ShieldCheck className="w-3 h-3" />
                          <span>{highTierCount}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground font-normal">0</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
