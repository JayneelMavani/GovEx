import { PromiseStatus, SourceTier } from "@prisma/client";

export const STATUS_CONFIG: Record<
  PromiseStatus,
  { label: string; color: string; bgColor: string; textColor: string; icon: string }
> = {
  NOT_STARTED: {
    label: "Not Started",
    color: "#64748b",
    bgColor: "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800",
    textColor: "text-slate-700 dark:text-slate-300",
    icon: "⬜",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "#d97706",
    bgColor: "bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800",
    textColor: "text-amber-800 dark:text-amber-300",
    icon: "🔄",
  },
  PARTIALLY_IMPLEMENTED: {
    label: "Partially Implemented",
    color: "#ea580c",
    bgColor: "bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800",
    textColor: "text-orange-800 dark:text-orange-300",
    icon: "◐",
  },
  IMPLEMENTED: {
    label: "Implemented",
    color: "#059669",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800",
    textColor: "text-emerald-800 dark:text-emerald-300",
    icon: "✅",
  },
  STALLED: {
    label: "Stalled",
    color: "#e11d48",
    bgColor: "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800",
    textColor: "text-rose-800 dark:text-rose-300",
    icon: "🚫",
  },
  UNVERIFIABLE: {
    label: "Unverifiable",
    color: "#64748b",
    bgColor: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
    textColor: "text-slate-700 dark:text-slate-300",
    icon: "❓",
  },
};

export const TIER_CONFIG: Record<
  SourceTier,
  { label: string; color: string; bgColor: string; textColor: string; description: string }
> = {
  HIGH: {
    label: "High",
    color: "#10b981",
    bgColor: "bg-emerald-100 dark:bg-emerald-900",
    textColor: "text-emerald-800 dark:text-emerald-200",
    description:
      "Government notifications, legislation, budgets, departmental reports, official statistics — primary basis for status determination.",
  },
  MEDIUM: {
    label: "Medium",
    color: "#3b82f6",
    bgColor: "bg-blue-100 dark:bg-blue-900",
    textColor: "text-blue-800 dark:text-blue-200",
    description:
      "Parliamentary records, government statements, reputable institutional reports — used for corroboration.",
  },
  SUPPORTING: {
    label: "Supporting",
    color: "#8b5cf6",
    bgColor: "bg-violet-100 dark:bg-violet-900",
    textColor: "text-violet-800 dark:text-violet-200",
    description:
      "Reputable news articles, secondary research — provides context and aids discovery.",
  },
};

export const CATEGORIES = [
  "Infrastructure",
  "Employment",
  "Education",
  "Healthcare",
  "Taxation",
  "Welfare",
] as const;

export const ALL_STATUSES = Object.keys(STATUS_CONFIG) as PromiseStatus[];
