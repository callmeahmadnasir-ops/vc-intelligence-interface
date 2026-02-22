import { useState, useEffect, useCallback } from "react";
import { useRoute, Link } from "wouter";
import {
  Building2,
  ArrowLeft,
  Globe,
  MapPin,
  Users,
  Calendar,
  DollarSign,
  Sparkles,
  Loader2,
  ExternalLink,
  Trash2,
  Plus,
  Check,
  Clock,
  TrendingUp,
  Briefcase,
  Megaphone,
  Handshake,
  Newspaper,
  BarChart3,
  AlertCircle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockCompanies } from "@/lib/mock-data";
import { notesStorage, enrichmentStorage, listsStorage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { CompanyNote, EnrichmentResult, CompanyList, Signal } from "@shared/schema";

const signalIcons: Record<Signal["type"], typeof TrendingUp> = {
  hiring: Users,
  funding: DollarSign,
  product: Sparkles,
  partnership: Handshake,
  press: Newspaper,
  growth: BarChart3,
};

const signalColors: Record<Signal["type"], string> = {
  hiring: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  funding: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  product: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  partnership: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  press: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  growth: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export default function CompanyProfilePage() {
  const [, params] = useRoute("/companies/:id");
  const { toast } = useToast();
  const companyId = params?.id || "";
  const company = mockCompanies.find((c) => c.id === companyId);

  const [notes, setNotes] = useState<CompanyNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [enrichment, setEnrichment] = useState<EnrichmentResult | null>(null);
  const [enriching, setEnriching] = useState(false);
  const [enrichError, setEnrichError] = useState("");
  const [lists, setLists] = useState<CompanyList[]>([]);

  const loadData = useCallback(() => {
    if (!companyId) return;
    setNotes(notesStorage.getAll(companyId));
    setEnrichment(enrichmentStorage.get(companyId));
    setLists(listsStorage.getAll());
  }, [companyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground opacity-40" />
        <p className="text-muted-foreground">Company not found</p>
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back to Companies
          </Button>
        </Link>
      </div>
    );
  }

  function handleAddNote() {
    if (!newNote.trim()) return;
    notesStorage.create(companyId, newNote.trim());
    setNewNote("");
    setNotes(notesStorage.getAll(companyId));
    toast({ title: "Note added" });
  }

  function handleDeleteNote(noteId: string) {
    notesStorage.delete(noteId);
    setNotes(notesStorage.getAll(companyId));
    toast({ title: "Note deleted" });
  }

  async function handleEnrich() {
    setEnriching(true);
    setEnrichError("");
    try {
      const res = await apiRequest("POST", "/api/enrich", {
        companyId: company!.id,
        domain: company!.domain,
        companyName: company!.name,
      });
      const data: EnrichmentResult = await res.json();
      enrichmentStorage.set(companyId, data);
      setEnrichment(data);
      toast({ title: "Enrichment complete", description: `${company!.name} has been enriched with live data.` });
    } catch (err: any) {
      setEnrichError(err.message || "Enrichment failed");
      toast({ title: "Enrichment failed", description: err.message, variant: "destructive" });
    } finally {
      setEnriching(false);
    }
  }

  function handleAddToList(listId: string) {
    listsStorage.addCompany(listId, companyId);
    setLists(listsStorage.getAll());
    const list = lists.find((l) => l.id === listId);
    toast({ title: "Added to list", description: `${company!.name} added to "${list?.name}".` });
  }

  const companyLists = lists.filter((l) => l.companyIds.includes(companyId));
  const availableLists = lists.filter((l) => !l.companyIds.includes(companyId));

  return (
    <ScrollArea className="h-full">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-companies">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Companies
            </Button>
          </Link>
        </div>

        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Building2 className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-company-name">{company.name}</h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <Badge variant="secondary">{company.industry}</Badge>
                <Badge variant="outline">{company.stage}</Badge>
                {company.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">{company.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" data-testid="button-add-to-list">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add to List
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {availableLists.length === 0 && companyLists.length === 0 && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No lists yet. Create one in the Lists page.
                  </div>
                )}
                {availableLists.map((list) => (
                  <DropdownMenuItem key={list.id} onClick={() => handleAddToList(list.id)}>
                    <Plus className="w-3.5 h-3.5 mr-2" />
                    {list.name}
                  </DropdownMenuItem>
                ))}
                {companyLists.length > 0 && (
                  <>
                    <Separator className="my-1" />
                    {companyLists.map((list) => (
                      <DropdownMenuItem key={list.id} disabled>
                        <Check className="w-3.5 h-3.5 mr-2" />
                        {list.name}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" onClick={handleEnrich} disabled={enriching} data-testid="button-enrich">
              {enriching ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              )}
              {enriching ? "Enriching..." : enrichment ? "Re-Enrich" : "Enrich"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Domain</p>
                <a
                  href={`https://${company.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary flex items-center gap-1"
                  data-testid="link-domain"
                >
                  {company.domain}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-medium">{company.location}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Employees</p>
                <p className="text-sm font-medium">{company.employeeCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Total Funding</p>
                <p className="text-sm font-medium">{company.fundingTotal}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="signals" className="w-full">
          <TabsList data-testid="tabs-company-profile">
            <TabsTrigger value="signals">Signals</TabsTrigger>
            <TabsTrigger value="enrichment">Enrichment</TabsTrigger>
            <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="signals" className="mt-4 space-y-3">
            {company.signals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No signals recorded yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {company.signals.map((signal) => {
                  const Icon = signalIcons[signal.type];
                  return (
                    <Card key={signal.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${signalColors[signal.type]}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <p className="text-sm font-medium">{signal.title}</p>
                              <div className="flex items-center gap-2">
                                {signal.source && (
                                  <Badge variant="outline" className="text-[10px]">{signal.source}</Badge>
                                )}
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(signal.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{signal.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="enrichment" className="mt-4">
            {enrichError && (
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-destructive opacity-60" />
                  <p className="text-sm text-destructive">{enrichError}</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={handleEnrich}>
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}
            {enriching && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
                  <p className="text-sm font-medium">Enriching {company.name}...</p>
                  <p className="text-xs text-muted-foreground mt-1">Fetching and analyzing public website data</p>
                </CardContent>
              </Card>
            )}
            {!enriching && !enrichment && !enrichError && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Sparkles className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-40" />
                  <p className="text-sm font-medium">No enrichment data yet</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    Click "Enrich" to fetch live data from {company.domain}
                  </p>
                  <Button size="sm" onClick={handleEnrich} data-testid="button-enrich-empty">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Enrich Now
                  </Button>
                </CardContent>
              </Card>
            )}
            {enrichment && !enriching && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed" data-testid="text-enrichment-summary">{enrichment.summary}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">What They Do</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {enrichment.whatTheyDo.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Keywords</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {enrichment.keywords.map((kw, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{kw}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Derived Signals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {enrichment.derivedSignals.map((ds, i) => (
                        <div key={i} className="flex items-center justify-between gap-2">
                          <span className="text-sm">{ds.signal}</span>
                          <Badge
                            variant={ds.confidence === "high" ? "default" : ds.confidence === "medium" ? "secondary" : "outline"}
                            className="text-[10px]"
                          >
                            {ds.confidence}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {enrichment.sources.map((src, i) => (
                        <div key={i} className="flex items-center justify-between gap-2">
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary flex items-center gap-1 truncate"
                          >
                            {src.title || src.url}
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {new Date(src.scrapedAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <p className="text-xs text-muted-foreground text-right">
                  Last enriched: {new Date(enrichment.enrichedAt).toLocaleString()}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-4 space-y-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a note about this company..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[80px] resize-none"
                data-testid="input-note"
              />
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()} data-testid="button-add-note">
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Add Note
              </Button>
            </div>

            {notes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No notes yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...notes].reverse().map((note) => (
                  <Card key={note.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{note.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(note.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteNote(note.id)}
                          data-testid={`button-delete-note-${note.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
