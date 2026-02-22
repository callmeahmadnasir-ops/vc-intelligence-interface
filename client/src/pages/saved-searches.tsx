import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Bookmark,
  Trash2,
  Play,
  Clock,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { savedSearchesStorage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import type { SavedSearch } from "@shared/schema";

export default function SavedSearchesPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [searches, setSearches] = useState<SavedSearch[]>([]);

  useEffect(() => {
    setSearches(savedSearchesStorage.getAll());
  }, []);

  function handleDelete(id: string) {
    const search = searches.find((s) => s.id === id);
    savedSearchesStorage.delete(id);
    setSearches(savedSearchesStorage.getAll());
    toast({ title: "Search deleted", description: `"${search?.name}" has been removed.` });
  }

  function handleRun(search: SavedSearch) {
    localStorage.setItem("vc-intel-active-search", JSON.stringify({
      query: search.query,
      filters: search.filters,
    }));
    navigate("/");
    toast({
      title: "Search applied",
      description: `Running "${search.name}"`,
    });
  }

  const activeFilters = (search: SavedSearch) => {
    const f = search.filters;
    const active: string[] = [];
    if (f.industry && f.industry !== "All Industries") active.push(f.industry);
    if (f.stage && f.stage !== "All Stages") active.push(f.stage);
    if (f.location && f.location !== "All Locations") active.push(f.location);
    if (f.employeeRange && f.employeeRange !== "All Sizes") active.push(f.employeeRange);
    return active;
  };

  return (
    <ScrollArea className="h-full">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">Saved Searches</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Quickly re-run your saved search queries and filters
          </p>
        </div>

        {searches.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bookmark className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="text-sm font-medium">No saved searches yet</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Save a search from the Companies page to quickly re-run it later
              </p>
              <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                <Search className="w-3.5 h-3.5 mr-1.5" />
                Go to Companies
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {searches.map((search) => {
              const filters = activeFilters(search);
              return (
                <Card key={search.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" data-testid={`text-search-name-${search.id}`}>{search.name}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {search.query && (
                            <Badge variant="secondary" className="text-xs">
                              <Search className="w-3 h-3 mr-1" />
                              "{search.query}"
                            </Badge>
                          )}
                          {filters.map((f) => (
                            <Badge key={f} variant="outline" className="text-xs">
                              <SlidersHorizontal className="w-3 h-3 mr-1" />
                              {f}
                            </Badge>
                          ))}
                          {!search.query && filters.length === 0 && (
                            <span className="text-xs text-muted-foreground">No filters</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Saved {new Date(search.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRun(search)}
                          data-testid={`button-run-search-${search.id}`}
                        >
                          <Play className="w-3.5 h-3.5 mr-1" />
                          Run
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(search.id)}
                          data-testid={`button-delete-search-${search.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
