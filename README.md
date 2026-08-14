# RepoPilot

MCP-based open-source issue triage platform. AI-assisted categorization, duplicate detection, completeness checks, draft responses, RAG repo assistant, and weekly reports — with human approval on every write action.

## Stack
- Frontend: React + TypeScript + Tailwind
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + pgvector + Prisma
- Queue: Redis + BullMQ
- AI: Groq (Llama 3.1) + local embeddings (Xenova/transformers)
- MCP: 5 tools — search_issues, get_issue_context, suggest_labels, draft_comment, create_release_summary

## Local Setup
See `/backend/.env.example` for required environment variables.

```bash
# Backend
cd backend
npm install
npx prisma migrate dev
npx ts-node-dev src/index.ts

# Worker (separate terminal)
npx ts-node-dev src/worker.ts

# Frontend
cd frontend
npm install
npm run dev
```