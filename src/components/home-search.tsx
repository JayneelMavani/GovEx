"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function HomeSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/elections/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative max-w-xl mx-auto w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Search promises, e.g. 'Highways', 'Health clinics', 'Tax reduction'..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-13 pl-12 pr-28 rounded-2xl border-2 border-border bg-card/90 backdrop-blur-sm text-foreground text-base shadow-md placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
          aria-label="Search manifesto promises"
        />
        <Button
          type="submit"
          size="sm"
          className="absolute right-2 h-9 px-4 rounded-xl font-semibold gap-1.5 shadow-sm"
        >
          <span>Search</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </form>
  );
}
