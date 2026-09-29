"use client";

import { useRouter } from "next/navigation";
import { Search, Filter, RotateCcw } from "lucide-react";
import { useState, useCallback } from "react";
import { ALL_STATUSES, STATUS_CONFIG } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PromiseFiltersProps {
  categories: string[];
  parties: { id: string; name: string; abbreviation: string }[];
  currentCategory?: string;
  currentStatus?: string;
  currentParty?: string;
  currentQuery?: string;
  basePath: string;
}

export function PromiseFilters({
  categories,
  parties,
  currentCategory,
  currentStatus,
  currentParty,
  currentQuery,
  basePath,
}: PromiseFiltersProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(currentQuery || "");

  const updateFilters = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams();
      const current = {
        category: currentCategory,
        status: currentStatus,
        party: currentParty,
        q: currentQuery,
        ...updates,
      };

      Object.entries(current).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });

      router.push(`${basePath}?${params.toString()}`);
    },
    [router, basePath, currentCategory, currentStatus, currentParty, currentQuery]
  );

  const clearFilters = () => {
    setSearchTerm("");
    router.push(basePath);
  };

  const hasFilters = Boolean(currentCategory || currentStatus || currentParty || currentQuery);

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-2xs">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Filter promises by keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateFilters({ q: searchTerm || undefined });
              }
            }}
            className="pl-10 h-10 rounded-lg text-sm bg-background border-input"
            aria-label="Filter promises by keyword"
          />
        </div>

        {/* Category filter */}
        <select
          value={currentCategory || ""}
          onChange={(e) =>
            updateFilters({ category: e.target.value || undefined })
          }
          className="h-10 px-3 rounded-lg border border-input bg-background text-foreground text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={currentStatus || ""}
          onChange={(e) =>
            updateFilters({ status: e.target.value || undefined })
          }
          className="h-10 px-3 rounded-lg border border-input bg-background text-foreground text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_CONFIG[status].label}
            </option>
          ))}
        </select>

        {/* Party filter */}
        {parties.length > 0 && (
          <select
            value={currentParty || ""}
            onChange={(e) =>
              updateFilters({ party: e.target.value || undefined })
            }
            className="h-10 px-3 rounded-lg border border-input bg-background text-foreground text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Filter by party"
          >
            <option value="">All Parties</option>
            {parties.map((party) => (
              <option key={party.id} value={party.id}>
                {party.name} ({party.abbreviation})
              </option>
            ))}
          </select>
        )}

        {/* Action Buttons */}
        <Button
          variant="secondary"
          size="sm"
          className="h-10 px-3 gap-1 font-semibold"
          onClick={() => updateFilters({ q: searchTerm || undefined })}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Apply</span>
        </Button>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-10 px-3 text-muted-foreground hover:text-foreground gap-1"
            aria-label="Clear filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </Button>
        )}
      </div>
    </div>
  );
}
