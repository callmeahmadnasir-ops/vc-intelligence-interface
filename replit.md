# VC Intelligence Interface

## Overview
A VC discovery and enrichment platform (Harmonic-style) built with React + Express + TypeScript. Features company discovery, profile viewing, live AI-powered enrichment, list management, and saved searches.

## Architecture
- **Frontend**: React 18 + Wouter routing + TanStack Query + Shadcn UI + Tailwind CSS
- **Backend**: Express 5 on Node.js, serves both API and frontend
- **AI**: OpenAI via Replit AI Integrations (gpt-5-nano for enrichment)
- **Data Persistence**: localStorage for lists, saved searches, notes, and enrichment cache. No database.
- **Mock Data**: 12 companies seeded in `client/src/lib/mock-data.ts`

## Key Routes
- `/` - Companies list with search, filters, sorting, pagination
- `/companies/:id` - Company profile with signals, enrichment, notes
- `/lists` - Create/manage company lists, export CSV/JSON
- `/saved` - Saved search queries

## API Endpoints
- `POST /api/enrich` - Server-side enrichment endpoint (keeps API keys safe)
  - Body: `{ companyId, domain, companyName }`
  - Returns: `{ summary, whatTheyDo, keywords, derivedSignals, sources, enrichedAt }`

## File Structure
- `shared/schema.ts` - TypeScript interfaces and Zod schemas
- `client/src/lib/mock-data.ts` - Mock company dataset
- `client/src/lib/storage.ts` - localStorage persistence layer
- `client/src/components/` - Sidebar, theme, global search
- `client/src/pages/` - Route pages
- `server/routes.ts` - Express API routes with OpenAI enrichment

## Running
- `npm run dev` starts both Express backend and Vite frontend on port 5000
