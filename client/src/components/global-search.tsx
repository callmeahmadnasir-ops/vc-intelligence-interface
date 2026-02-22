import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Search, Building2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { mockCompanies } from "@/lib/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [, navigate] = useLocation();
  const ref = useRef<HTMLDivElement>(null);

  const results = query.length > 0
    ? mockCompanies.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.industry.toLowerCase().includes(query.toLowerCase()) ||
          c.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 6)
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search companies... (Ctrl+K)"
          className="pl-9 pr-9"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          data-testid="input-global-search"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            data-testid="button-clear-search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-popover-border rounded-md shadow-lg z-50">
          <ScrollArea className="max-h-[300px]">
            <div className="p-1">
              {results.map((company) => (
                <button
                  key={company.id}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left hover-elevate"
                  onClick={() => {
                    navigate(`/companies/${company.id}`);
                    setIsOpen(false);
                    setQuery("");
                  }}
                  data-testid={`search-result-${company.id}`}
                >
                  <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{company.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{company.industry} &middot; {company.stage}</p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
      {isOpen && query.length > 0 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-popover-border rounded-md shadow-lg z-50 p-6 text-center">
          <p className="text-sm text-muted-foreground">No companies found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
