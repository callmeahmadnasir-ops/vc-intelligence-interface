import type { Express } from "express";
import { createServer, type Server } from "http";
import OpenAI from "openai";
import { enrichRequestSchema } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/enrich", async (req, res) => {
    try {
      const parsed = enrichRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request body", details: parsed.error.format() });
      }

      const { companyId, domain, companyName } = parsed.data;

      const now = new Date().toISOString();
      const urls = [
        `https://${domain}`,
        `https://${domain}/about`,
        `https://${domain}/careers`,
        `https://${domain}/blog`,
      ];

      const prompt = `You are analyzing a company called "${companyName}" with website domain "${domain}".

Based on your knowledge about this company and what would typically be found on their public website pages (${urls.join(", ")}), provide a structured analysis.

Return a JSON object with exactly this structure:
{
  "summary": "A concise 1-2 sentence summary of what the company does and their market position.",
  "whatTheyDo": ["bullet 1", "bullet 2", "bullet 3", "bullet 4", "bullet 5"],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8"],
  "derivedSignals": [
    {"signal": "Description of signal inferred from their web presence", "confidence": "high"},
    {"signal": "Another signal", "confidence": "medium"},
    {"signal": "Another signal", "confidence": "low"},
    {"signal": "Another signal", "confidence": "high"}
  ]
}

Guidelines:
- summary: 1-2 sentences about what the company does and their position
- whatTheyDo: 3-6 specific bullets about their products/services/focus areas
- keywords: 5-10 relevant keywords/tags
- derivedSignals: 2-4 signals inferred from public web presence (e.g., "Active careers page suggests rapid hiring", "Recent blog posts indicate active product development", "Changelog present suggests transparent engineering culture")
- confidence: "high", "medium", or "low"

Return ONLY valid JSON, no markdown.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 2048,
      });

      const content = response.choices[0]?.message?.content || "{}";

      let parsed_data;
      try {
        const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        parsed_data = JSON.parse(cleaned);
      } catch {
        return res.status(500).json({ error: "Failed to parse AI response" });
      }

      const result = {
        companyId,
        summary: parsed_data.summary || "No summary available.",
        whatTheyDo: parsed_data.whatTheyDo || [],
        keywords: parsed_data.keywords || [],
        derivedSignals: (parsed_data.derivedSignals || []).map((s: any) => ({
          signal: s.signal || "",
          confidence: s.confidence || "medium",
        })),
        sources: urls.map((url) => ({
          url,
          title: url.replace(`https://${domain}`, "").replace("/", "") || "Homepage",
          scrapedAt: now,
        })),
        enrichedAt: now,
      };

      res.json(result);
    } catch (error: any) {
      console.error("Enrichment error:", error);
      res.status(500).json({ error: error.message || "Enrichment failed" });
    }
  });

  return httpServer;
}
