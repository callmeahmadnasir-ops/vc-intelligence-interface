import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Building2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ArrowRight,
  Bookmark,
  SlidersHorizontal,
} from "lucide-react";
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
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { mockCompanies, industries, stages, locations, employeeRanges } from "@/lib/mock-data";
import { savedSearchesStorage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import type { Company, SearchFilters } from "@shared/schema";

type SortField = "name" | "industry" | "stage" | "fundingTotal" | "employeeCount" | "location";
type SortDir = "asc" | "desc";

const ITEMS_PER_PAGE = 8;

export default function CompaniesPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("vc-intel-active-search");
    if (raw) {
      try {
        const { query, filters: savedFilters } = JSON.parse(raw);
        if (query) setSearch(query);
        if (savedFilters) {
          setFilters(savedFilters);
          const hasActiveFilter = Object.values(savedFilters).some((v: any) => v && !String(v).startsWith("All"));
          if (hasActiveFilter) setShowFilters(true);
        }
      } catch {}
      localStorage.removeItem("vc-intel-active-search");
    }
  }, []);

  const filtered = useMemo(() => {
    let result = [...mockCompanies];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filters.industry && filters.industry !== "All Industries") {
      result = result.filter((c) => c.industry === filters.industry);
    }
    if (filters.stage && filters.stage !== "All Stages") {
      result = result.filter((c) => c.stage === filters.stage);
    }
    if (filters.location && filters.location !== "All Locations") {
      result = result.filter((c) => c.location === filters.location);
    }
    if (filters.employeeRange && filters.employeeRange !== "All Sizes") {
      result = result.filter((c) => c.employeeCount === filters.employeeRange);
    }

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [search, filters, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronsUpDown className="w-3 h-3 ml-1 opacity-40" />;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 ml-1" />
    );
  }

  function handleSaveSearch() {
    if (!saveSearchName.trim()) return;
    savedSearchesStorage.create(saveSearchName.trim(), search, filters);
    toast({ title: "Search saved", description: `"${saveSearchName}" saved successfully.` });
    setSaveSearchName("");
    setSaveDialogOpen(false);
  }

  const activeFilterCount = Object.values(filters).filter((v) => v && !v.startsWith("All")).length;

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 pb-0 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">Companies</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} companies found</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" data-testid="button-save-search">
                  <Bookmark className="w-3.5 h-3.5 mr-1.5" />
                  Save Search
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Search</DialogTitle>
                  <DialogDescription>
                    Save this search query and filters to quickly re-run later.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="search-name">Name</Label>
                    <Input
                      id="search-name"
                      placeholder="e.g. AI Series B companies"
                      value={saveSearchName}
                      onChange={(e) => setSaveSearchName(e.target.value)}
                      data-testid="input-save-search-name"
                    />
                  </div>
                  {search && (
                    <p className="text-xs text-muted-foreground">Query: "{search}"</p>
                  )}
                  {activeFilterCount > 0 && (
                    <p className="text-xs text-muted-foreground">{activeFilterCount} filter(s) applied</p>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveSearch} data-testid="button-confirm-save-search">Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Input
              type="search"
              placeholder="Search by name, industry, or tag..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              data-testid="input-company-search"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            data-testid="button-toggle-filters"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5">{activeFilterCount}</Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="flex items-center gap-3 flex-wrap p-3 bg-muted/50 rounded-md">
            <Select value={filters.industry || ""} onValueChange={(v) => { setFilters({ ...filters, industry: v }); setPage(1); }}>
              <SelectTrigger className="w-[160px]" data-testid="select-industry">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((i) => (
                  <SelectItem key={i} value={i}>{i}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.stage || ""} onValueChange={(v) => { setFilters({ ...filters, stage: v }); setPage(1); }}>
              <SelectTrigger className="w-[140px]" data-testid="select-stage">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.location || ""} onValueChange={(v) => { setFilters({ ...filters, location: v }); setPage(1); }}>
              <SelectTrigger className="w-[170px]" data-testid="select-location">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.employeeRange || ""} onValueChange={(v) => { setFilters({ ...filters, employeeRange: v }); setPage(1); }}>
              <SelectTrigger className="w-[140px]" data-testid="select-employee-range">
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                {employeeRanges.map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setFilters({}); setPage(1); }}
                data-testid="button-clear-filters"
              >
                Clear all
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-6 pt-4">
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort("name")}>
                  <div className="flex items-center">Company <SortIcon field="name" /></div>
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort("industry")}>
                  <div className="flex items-center">Industry <SortIcon field="industry" /></div>
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort("stage")}>
                  <div className="flex items-center">Stage <SortIcon field="stage" /></div>
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort("fundingTotal")}>
                  <div className="flex items-center">Funding <SortIcon field="fundingTotal" /></div>
                </TableHead>
                <TableHead className="cursor-pointer select-none hidden md:table-cell" onClick={() => handleSort("location")}>
                  <div className="flex items-center">Location <SortIcon field="location" /></div>
                </TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Building2 className="w-8 h-8 opacity-40" />
                      <p className="text-sm">No companies match your search</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((company) => (
                  <TableRow
                    key={company.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/companies/${company.id}`)}
                    data-testid={`row-company-${company.id}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{company.name}</p>
                          <p className="text-xs text-muted-foreground">{company.domain}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{company.industry}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{company.stage}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{company.fundingTotal}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">{company.location}</span>
                    </TableCell>
                    <TableCell>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                data-testid="button-prev-page"
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(p)}
                  data-testid={`button-page-${p}`}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                data-testid="button-next-page"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
