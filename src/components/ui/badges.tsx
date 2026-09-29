"use client";

import { PromiseStatus, SourceTier } from "@prisma/client";
import { STATUS_CONFIG, TIER_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ShieldCheck, ShieldAlert, Shield, CheckCircle2, Clock, PlayCircle, AlertOctagon, HelpCircle } from "lucide-react";

export function StatusBadge({
  status,
  size = "md",
  className,
}: {
  status: PromiseStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const config = STATUS_CONFIG[status];

  const getStatusIcon = (st: PromiseStatus) => {
    switch (st) {
      case "IMPLEMENTED":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case "IN_PROGRESS":
        return <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 animate-spin" style={{ animationDuration: "6s" }} />;
      case "PARTIALLY_IMPLEMENTED":
        return <PlayCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />;
      case "STALLED":
        return <AlertOctagon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />;
      case "UNVERIFIABLE":
        return <HelpCircle className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />;
    }
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border shadow-xs transition-colors",
        config.bgColor,
        config.textColor,
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      {getStatusIcon(status)}
      <span className="font-semibold">{config.label}</span>
    </span>
  );
}

export function TierBadge({
  tier,
  size = "md",
  showDescription = false,
  className,
}: {
  tier: SourceTier;
  size?: "sm" | "md";
  showDescription?: boolean;
  className?: string;
}) {
  const config = TIER_CONFIG[tier];

  const getTierIcon = (t: SourceTier) => {
    switch (t) {
      case "HIGH":
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case "MEDIUM":
        return <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />;
      case "SUPPORTING":
        return <ShieldAlert className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />;
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-md border shadow-2xs transition-colors",
        tier === "HIGH" && "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
        tier === "MEDIUM" && "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
        tier === "SUPPORTING" && "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        className
      )}
      title={config.description}
      role="note"
      aria-label={`Source tier: ${config.label}`}
    >
      {getTierIcon(tier)}
      <span className="font-semibold">{config.label} Tier</span>
      {showDescription && (
        <span className="text-[10px] opacity-75 hidden sm:inline">({config.label === "High" ? "Official" : config.label === "Medium" ? "Corroborated" : "Contextual"})</span>
      )}
    </span>
  );
}

export function EvidenceCountBadge({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 shadow-2xs",
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
      <span>{count} evidence item{count !== 1 ? "s" : ""}</span>
    </span>
  );
}
