"use client";

import { useRouter } from "next/navigation";
import { Search, Filter, RotateCcw } from "lucide-react";
import { useState, useCallback } from "react";
import { ALL_STATUSES, STATUS_CONFIG } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
        <div className="w-full md:w-[170px]">
          <Select
            value={currentCategory || "ALL"}
            onValueChange={(val) =>
              updateFilters({ category: val === "ALL" ? undefined : val })
            }
          >
            <SelectTrigger className="h-10 text-sm">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status filter */}
        <div className="w-full md:w-[170px]">
          <Select
            value={currentStatus || "ALL"}
            onValueChange={(val) =>
              updateFilters({ status: val === "ALL" ? undefined : val })
            }
          >
            <SelectTrigger className="h-10 text-sm">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {ALL_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_CONFIG[status].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Party filter */}
        {parties.length > 0 && (
          <div className="w-full md:w-[170px]">
            <Select
              value={currentParty || "ALL"}
              onValueChange={(val) =>
                updateFilters({ party: val === "ALL" ? undefined : val })
              }
            >
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder="All Parties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Parties</SelectItem>
                {parties.map((party) => (
                  <SelectItem key={party.id} value={party.id}>
                    {party.name} ({party.abbreviation})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
