import type { CompanyList, SavedSearch, CompanyNote, EnrichmentResult } from "@shared/schema";

const LISTS_KEY = "vc-intel-lists";
const SAVED_SEARCHES_KEY = "vc-intel-saved-searches";
const NOTES_KEY = "vc-intel-notes";
const ENRICHMENT_KEY = "vc-intel-enrichment";

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const listsStorage = {
  getAll(): CompanyList[] {
    return getItem<CompanyList[]>(LISTS_KEY, []);
  },
  save(lists: CompanyList[]): void {
    setItem(LISTS_KEY, lists);
  },
  create(name: string, description: string): CompanyList {
    const lists = listsStorage.getAll();
    const newList: CompanyList = {
      id: crypto.randomUUID(),
      name,
      description,
      companyIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    lists.push(newList);
    listsStorage.save(lists);
    return newList;
  },
  update(id: string, updates: Partial<CompanyList>): CompanyList | null {
    const lists = listsStorage.getAll();
    const idx = lists.findIndex((l) => l.id === id);
    if (idx === -1) return null;
    lists[idx] = { ...lists[idx], ...updates, updatedAt: new Date().toISOString() };
    listsStorage.save(lists);
    return lists[idx];
  },
  delete(id: string): void {
    const lists = listsStorage.getAll().filter((l) => l.id !== id);
    listsStorage.save(lists);
  },
  addCompany(listId: string, companyId: string): void {
    const lists = listsStorage.getAll();
    const list = lists.find((l) => l.id === listId);
    if (list && !list.companyIds.includes(companyId)) {
      list.companyIds.push(companyId);
      list.updatedAt = new Date().toISOString();
      listsStorage.save(lists);
    }
  },
  removeCompany(listId: string, companyId: string): void {
    const lists = listsStorage.getAll();
    const list = lists.find((l) => l.id === listId);
    if (list) {
      list.companyIds = list.companyIds.filter((id) => id !== companyId);
      list.updatedAt = new Date().toISOString();
      listsStorage.save(lists);
    }
  },
};

export const savedSearchesStorage = {
  getAll(): SavedSearch[] {
    return getItem<SavedSearch[]>(SAVED_SEARCHES_KEY, []);
  },
  save(searches: SavedSearch[]): void {
    setItem(SAVED_SEARCHES_KEY, searches);
  },
  create(name: string, query: string, filters: SavedSearch["filters"]): SavedSearch {
    const searches = savedSearchesStorage.getAll();
    const newSearch: SavedSearch = {
      id: crypto.randomUUID(),
      name,
      query,
      filters,
      createdAt: new Date().toISOString(),
    };
    searches.push(newSearch);
    savedSearchesStorage.save(searches);
    return newSearch;
  },
  delete(id: string): void {
    const searches = savedSearchesStorage.getAll().filter((s) => s.id !== id);
    savedSearchesStorage.save(searches);
  },
};

export const notesStorage = {
  getAll(companyId: string): CompanyNote[] {
    const all = getItem<CompanyNote[]>(NOTES_KEY, []);
    return all.filter((n) => n.companyId === companyId);
  },
  create(companyId: string, content: string): CompanyNote {
    const all = getItem<CompanyNote[]>(NOTES_KEY, []);
    const note: CompanyNote = {
      id: crypto.randomUUID(),
      companyId,
      content,
      createdAt: new Date().toISOString(),
    };
    all.push(note);
    setItem(NOTES_KEY, all);
    return note;
  },
  delete(noteId: string): void {
    const all = getItem<CompanyNote[]>(NOTES_KEY, []).filter((n) => n.id !== noteId);
    setItem(NOTES_KEY, all);
  },
};

export const enrichmentStorage = {
  get(companyId: string): EnrichmentResult | null {
    const all = getItem<Record<string, EnrichmentResult>>(ENRICHMENT_KEY, {});
    return all[companyId] || null;
  },
  set(companyId: string, result: EnrichmentResult): void {
    const all = getItem<Record<string, EnrichmentResult>>(ENRICHMENT_KEY, {});
    all[companyId] = result;
    setItem(ENRICHMENT_KEY, all);
  },
};
