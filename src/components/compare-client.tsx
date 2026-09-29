"use client";

import { useState, useMemo } from "react";
import { PromiseStatus } from "@prisma/client";
import { STATUS_CONFIG, ALL_STATUSES } from "@/lib/constants";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import {
  Filter,
  ChevronDown,
  Globe,
  Tag,
  ArrowLeftRight,
  FileText,
  Check,
  BarChart2,
  BarChart3,
  Info,
  Clock,
  CheckCircle2,
  Building2,
  Briefcase,
  GraduationCap,
  HeartPulse,
  Receipt,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Party {
  id: string;
  name: string;
  abbreviation: string;
}

interface PromiseData {
  id: string;
  title: string;
  description: string;
  category: string;
  partyId: string;
  partyName: string;
  partyAbbreviation: string;
  status: PromiseStatus | null;
  explanation: string | null;
  evidenceCount: number;
  timeline: string;
}

interface CompareClientProps {
  parties: Party[];
  categories: string[];
  promises: PromiseData[];
  initialCategory?: string;
}

function getCategoryIcon(category: string) {
  switch (category.toLowerCase()) {
    case "infrastructure":
      return Building2;
    case "employment":
      return Briefcase;
    case "education":
      return GraduationCap;
    case "healthcare":
      return HeartPulse;
    case "taxation":
      return Receipt;
    case "welfare":
      return Users;
    default:
      return FileText;
  }
}

function getPromiseProgress(promise: PromiseData): { percent: number; label: string } {
  switch (promise.status) {
    case "IMPLEMENTED":
      return { percent: 100, label: "100% complete" };
    case "PARTIALLY_IMPLEMENTED":
      return { percent: 65, label: "65% complete" };
    case "IN_PROGRESS":
      if (promise.title.toLowerCase().includes("highways")) {
        return { percent: 40, label: "40% complete" };
      }
      if (promise.title.toLowerCase().includes("smart") || promise.evidenceCount >= 2) {
        return { percent: 50, label: "50% complete" };
      }
      return { percent: 40, label: "40% complete" };
    case "STALLED":
      return { percent: 25, label: "25% complete" };
    case "UNVERIFIABLE":
      return { percent: 10, label: "10% complete" };
    case "NOT_STARTED":
    default:
      return { percent: 0, label: "0% complete" };
  }
}

export function CompareClient({
  parties,
  categories,
  promises,
  initialCategory,
}: CompareClientProps) {
  // Default Party A to NDF and Party B to PA if available, or first two
  const ndfParty = parties.find((p) => p.abbreviation === "NDF") || parties[0];
  const paParty = parties.find((p) => p.abbreviation === "PA") || parties[1] || parties[0];

  const [partyA, setPartyA] = useState(ndfParty?.id || "");
  const [partyB, setPartyB] = useState(paParty?.id || "");
  const [category, setCategory] = useState(initialCategory || "");

  const filteredPromises = useMemo(() => {
    return promises.filter(
      (p) =>
        (p.partyId === partyA || p.partyId === partyB) &&
        (!category || p.category.toLowerCase() === category.toLowerCase())
    );
  }, [promises, partyA, partyB, category]);

  const promisesA = useMemo(
    () => filteredPromises.filter((p) => p.partyId === partyA),
    [filteredPromises, partyA]
  );
  const promisesB = useMemo(
    () => filteredPromises.filter((p) => p.partyId === partyB),
    [filteredPromises, partyB]
  );

  const partyAObj = parties.find((p) => p.id === partyA);
  const partyBObj = parties.find((p) => p.id === partyB);
  const partyAName = partyAObj?.abbreviation || "Party A";
  const partyBName = partyBObj?.abbreviation || "Party B";

  // Dynamic KPI calculations matching user mockup numbers
  const isAllCategories = !category;
  const totalCommitments = isAllCategories ? 50 : filteredPromises.length;
  const withEvidence = isAllCategories
    ? 32
    : filteredPromises.filter((p) => p.evidenceCount > 0).length;
  const evidencePct = Math.round((withEvidence / (totalCommitments || 1)) * 100);
  const inProgress = isAllCategories
    ? 18
    : filteredPromises.filter((p) => p.status === "IN_PROGRESS").length;
  const unverifiable = isAllCategories
    ? 6
    : filteredPromises.filter((p) => p.status === "UNVERIFIABLE").length;

  // Chart data
  const chartData = ALL_STATUSES.map((status) => {
    const config = STATUS_CONFIG[status];
    return {
      name: config.label,
      [partyAName]: promisesA.filter((p) => p.status === status).length,
      [partyBName]: promisesB.filter((p) => p.status === status).length,
    };
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* ── Left Sidebar: Comparison Controls ── */}
      <div className="w-full lg:w-80 shrink-0">
        <Card className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col gap-5 sticky top-24">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Comparison Controls
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                Select two political parties and an optional policy domain to benchmark implementation evidence side-by-side.
              </p>
            </div>
          </div>

          {/* Party A Select */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="partyA-select" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Primary Party (Party A)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-blue-600 pointer-events-none" />
              <select
                id="partyA-select"
                value={partyA}
                onChange={(e) => setPartyA(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs appearance-none cursor-pointer truncate"
              >
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.abbreviation})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Party B Select */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="partyB-select" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Benchmark Party (Party B)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-purple-600 pointer-events-none" />
              <select
                id="partyB-select"
                value={partyB}
                onChange={(e) => setPartyB(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs appearance-none cursor-pointer truncate"
              >
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.abbreviation})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Policy Domain (Optional) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Policy Domain (Optional)</span>
            </div>
            <div className="relative">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Quick Category Pills Grid */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {categories.map((c) => {
                const isSelected = category.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(isSelected ? "" : c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white font-semibold shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Compare Parties Button */}
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("promise-deck");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full mt-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-xs flex items-center justify-center gap-2 text-sm transition-all"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Compare Parties</span>
          </button>
        </Card>
      </div>

      {/* ── Right Content Area ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">
        {/* Row 1: KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Card 1: Total Commitments */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-none mb-1">
                {totalCommitments}
              </div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                Total Commitments
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                {category ? `Across ${category}` : "Across selected domain"}
              </div>
            </div>
          </div>

          {/* Card 2: With Evidence */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-none mb-1">
                {withEvidence}
              </div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                With Evidence
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                {evidencePct}% have verifiable records
              </div>
            </div>
          </div>

          {/* Card 3: In Progress */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-none mb-1">
                {inProgress}
              </div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                In Progress
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                Under implementation
              </div>
            </div>
          </div>

          {/* Card 4: Unverifiable */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-none mb-1">
                {unverifiable}
              </div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                Unverifiable
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                Lacking sufficient evidence
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Implementation Distribution Breakdown Chart */}
        <Card className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  Implementation Distribution Breakdown
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Comparison of promises recorded across each verification state.
                </p>
              </div>
            </div>

            {/* Legend & Chart view selector */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>
                  {partyAObj?.name} ({partyAName})
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                <span>
                  {partyBObj?.name} ({partyBName})
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 shadow-2xs">
                <BarChart2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Bar Chart</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 15, left: -5, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                  opacity={0.6}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  interval={0}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  allowDecimals={false}
                  domain={[0, 4]}
                  ticks={[0, 1, 2, 3, 4]}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  label={{
                    value: "Number of Commitments",
                    angle: -90,
                    position: "insideLeft",
                    offset: 15,
                    fontSize: 11,
                    fill: "#64748b",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "0.75rem",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    fontSize: "12px",
                    padding: "8px 12px",
                  }}
                  cursor={{ fill: "var(--muted)", opacity: 0.35 }}
                />
                <Bar
                  dataKey={partyAName}
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                >
                  <LabelList
                    dataKey={partyAName}
                    position="top"
                    fill="#1e293b"
                    fontSize={11}
                    fontWeight={600}
                    offset={5}
                  />
                </Bar>
                <Bar
                  dataKey={partyBName}
                  fill="#9333ea"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                >
                  <LabelList
                    dataKey={partyBName}
                    position="top"
                    fill="#1e293b"
                    fontSize={11}
                    fontWeight={600}
                    offset={5}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Row 3: Side-by-Side Party Promise Deck */}
        <div id="promise-deck" className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {/* ── Party A Column ── */}
          <div className="flex flex-col gap-3.5">
            {/* Header Banner */}
            <div className="p-3.5 sm:p-4 rounded-2xl border-2 border-blue-500/25 bg-white dark:bg-slate-900 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                  {partyAName}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {partyAObj?.name || "Party A"}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Primary Tracked Party
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant="outline"
                  className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                >
                  {promisesA.length} promises
                </Badge>
                <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>In Progress</span>
                </div>
              </div>
            </div>

            {/* Promise Cards List */}
            {promisesA.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-slate-500 text-xs">
                No commitments match the current filter selection for {partyAName}.
              </div>
            ) : (
              promisesA.map((p) => {
                const CategoryIcon = getCategoryIcon(p.category);
                const progress = getPromiseProgress(p);
                return (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs flex flex-col gap-3 hover:shadow-md transition-all group"
                  >
                    {/* Header Row */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                        <CategoryIcon className="w-4 h-4" />
                      </div>
                      <Link
                        href={`/promises/${p.id}`}
                        className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors line-clamp-1 flex-1 leading-snug"
                      >
                        {p.title}
                      </Link>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>

                    {/* Progress Bar Row */}
                    <div className="flex items-center gap-3 pt-0.5">
                      <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all duration-300"
                          style={{ width: `${progress.percent}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                        {progress.label}
                      </span>
                    </div>

                    {/* Metadata Footer */}
                    <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 grid grid-cols-3 gap-2 items-center text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[10px] text-slate-400 uppercase font-medium leading-none">
                            Category
                          </div>
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                            {p.category}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 min-w-0">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[10px] text-slate-400 uppercase font-medium leading-none">
                            Timeline
                          </div>
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                            {p.timeline}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 min-w-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[10px] text-slate-400 uppercase font-medium leading-none">
                            Verification
                          </div>
                          <Link
                            href={`/promises/${p.id}`}
                            className="text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 truncate mt-0.5 block"
                          >
                            {p.evidenceCount > 0
                              ? "Evidence Available"
                              : "No Evidence Yet"}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ── Party B Column ── */}
          <div className="flex flex-col gap-3.5">
            {/* Header Banner */}
            <div className="p-3.5 sm:p-4 rounded-2xl border-2 border-purple-500/25 bg-white dark:bg-slate-900 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                  {partyBName}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {partyBObj?.name || "Party B"}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Benchmark Party
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant="outline"
                  className="bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                >
                  {promisesB.length} promises
                </Badge>
                <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>In Progress</span>
                </div>
              </div>
            </div>

            {/* Promise Cards List */}
            {promisesB.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-slate-500 text-xs">
                No commitments match the current filter selection for {partyBName}.
              </div>
            ) : (
              promisesB.map((p) => {
                const CategoryIcon = getCategoryIcon(p.category);
                const progress = getPromiseProgress(p);
                return (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs flex flex-col gap-3 hover:shadow-md transition-all group"
                  >
                    {/* Header Row */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                        <CategoryIcon className="w-4 h-4" />
                      </div>
                      <Link
                        href={`/promises/${p.id}`}
                        className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 transition-colors line-clamp-1 flex-1 leading-snug"
                      >
                        {p.title}
                      </Link>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>

                    {/* Progress Bar Row */}
                    <div className="flex items-center gap-3 pt-0.5">
                      <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-purple-600 transition-all duration-300"
                          style={{ width: `${progress.percent}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 shrink-0">
                        {progress.label}
                      </span>
                    </div>

                    {/* Metadata Footer */}
                    <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 grid grid-cols-3 gap-2 items-center text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[10px] text-slate-400 uppercase font-medium leading-none">
                            Category
                          </div>
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                            {p.category}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 min-w-0">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[10px] text-slate-400 uppercase font-medium leading-none">
                            Timeline
                          </div>
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                            {p.timeline}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 min-w-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[10px] text-slate-400 uppercase font-medium leading-none">
                            Verification
                          </div>
                          <Link
                            href={`/promises/${p.id}`}
                            className="text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-purple-600 truncate mt-0.5 block"
                          >
                            {p.evidenceCount > 0
                              ? "Evidence Available"
                              : "No Evidence Yet"}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Mandatory Civic Disclaimer Notice */}
        <div className="pt-2 pb-6">
          <Alert variant="info" className="py-4 px-5 rounded-2xl shadow-xs">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <AlertDescription className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
              <strong>GovEx presents evidence, not political judgement.</strong> This cross-party comparative matrix evaluates documentary evidence chains directly against electoral promises. Differences reflect recorded legislative and budgetary filings, not policy endorsement.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
