import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  List,
  Plus,
  Trash2,
  Download,
  Building2,
  X,
  FileJson,
  FileSpreadsheet,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockCompanies } from "@/lib/mock-data";
import { listsStorage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import type { CompanyList } from "@shared/schema";

export default function ListsPage() {
  const { toast } = useToast();
  const [lists, setLists] = useState<CompanyList[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    setLists(listsStorage.getAll());
  }, []);

  function handleCreate() {
    if (!newName.trim()) return;
    listsStorage.create(newName.trim(), newDesc.trim());
    setLists(listsStorage.getAll());
    setNewName("");
    setNewDesc("");
    setCreateOpen(false);
    toast({ title: "List created", description: `"${newName}" has been created.` });
  }

  function handleDelete(id: string) {
    const list = lists.find((l) => l.id === id);
    listsStorage.delete(id);
    setLists(listsStorage.getAll());
    toast({ title: "List deleted", description: `"${list?.name}" has been deleted.` });
  }

  function handleRemoveCompany(listId: string, companyId: string) {
    listsStorage.removeCompany(listId, companyId);
    setLists(listsStorage.getAll());
  }

  function handleExportCSV(list: CompanyList) {
    const companies = mockCompanies.filter((c) => list.companyIds.includes(c.id));
    const headers = ["Name", "Domain", "Industry", "Stage", "Funding", "Location", "Employees"];
    const rows = companies.map((c) => [c.name, c.domain, c.industry, c.stage, c.fundingTotal, c.location, c.employeeCount]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
    downloadFile(csv, `${list.name}.csv`, "text/csv");
    toast({ title: "Exported as CSV" });
  }

  function handleExportJSON(list: CompanyList) {
    const companies = mockCompanies.filter((c) => list.companyIds.includes(c.id));
    const data = companies.map((c) => ({
      name: c.name,
      domain: c.domain,
      industry: c.industry,
      stage: c.stage,
      funding: c.fundingTotal,
      location: c.location,
      employees: c.employeeCount,
    }));
    downloadFile(JSON.stringify(data, null, 2), `${list.name}.json`, "application/json");
    toast({ title: "Exported as JSON" });
  }

  function downloadFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ScrollArea className="h-full">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">Lists</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Organize companies into lists and export them
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-create-list">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Create List
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New List</DialogTitle>
                <DialogDescription>Create a list to organize and track companies.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="list-name">Name</Label>
                  <Input
                    id="list-name"
                    placeholder="e.g. AI Infrastructure"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    data-testid="input-list-name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="list-desc">Description (optional)</Label>
                  <Textarea
                    id="list-desc"
                    placeholder="What's this list for?"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="resize-none min-h-[60px]"
                    data-testid="input-list-description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={!newName.trim()} data-testid="button-confirm-create-list">Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {lists.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <List className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="text-sm font-medium">No lists yet</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Create a list to start organizing companies
              </p>
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Create Your First List
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {lists.map((list) => {
              const companies = mockCompanies.filter((c) => list.companyIds.includes(c.id));
              return (
                <Card key={list.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-base" data-testid={`text-list-name-${list.id}`}>{list.name}</CardTitle>
                        {list.description && (
                          <p className="text-sm text-muted-foreground mt-0.5">{list.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {companies.length} {companies.length === 1 ? "company" : "companies"}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Updated {new Date(list.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {companies.length > 0 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon" data-testid={`button-export-${list.id}`}>
                                <Download className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleExportCSV(list)}>
                                <FileSpreadsheet className="w-3.5 h-3.5 mr-2" />
                                Export CSV
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleExportJSON(list)}>
                                <FileJson className="w-3.5 h-3.5 mr-2" />
                                Export JSON
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(list.id)}
                          data-testid={`button-delete-list-${list.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {companies.length > 0 && (
                    <CardContent className="pt-0">
                      <div className="space-y-1">
                        {companies.map((company) => (
                          <div
                            key={company.id}
                            className="flex items-center justify-between gap-3 p-2 rounded-md hover-elevate"
                          >
                            <Link href={`/companies/${company.id}`}>
                              <div className="flex items-center gap-3 cursor-pointer" data-testid={`link-list-company-${company.id}`}>
                                <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center">
                                  <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{company.name}</p>
                                  <p className="text-xs text-muted-foreground">{company.industry}</p>
                                </div>
                              </div>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveCompany(list.id, company.id)}
                              data-testid={`button-remove-company-${company.id}-${list.id}`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
