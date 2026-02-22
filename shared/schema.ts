import { z } from "zod";

export interface Company {
  id: string;
  name: string;
  domain: string;
  description: string;
  industry: string;
  stage: string;
  foundedYear: number;
  employeeCount: string;
  location: string;
  fundingTotal: string;
  lastFundingDate: string;
  tags: string[];
  logoUrl?: string;
  signals: Signal[];
}

export interface Signal {
  id: string;
  type: "hiring" | "funding" | "product" | "partnership" | "press" | "growth";
  title: string;
  description: string;
  date: string;
  source?: string;
}

export interface EnrichmentResult {
  companyId: string;
  summary: string;
  whatTheyDo: string[];
  keywords: string[];
  derivedSignals: DerivedSignal[];
  sources: EnrichmentSource[];
  enrichedAt: string;
}

export interface DerivedSignal {
  signal: string;
  confidence: "high" | "medium" | "low";
}

export interface EnrichmentSource {
  url: string;
  title: string;
  scrapedAt: string;
}

export interface CompanyNote {
  id: string;
  companyId: string;
  content: string;
  createdAt: string;
}

export interface CompanyList {
  id: string;
  name: string;
  description: string;
  companyIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  createdAt: string;
}

export interface SearchFilters {
  industry?: string;
  stage?: string;
  location?: string;
  employeeRange?: string;
}

export const enrichRequestSchema = z.object({
  companyId: z.string(),
  domain: z.string(),
  companyName: z.string(),
});

export type EnrichRequest = z.infer<typeof enrichRequestSchema>;
