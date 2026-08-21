# Migration Plan — localStorage → Postgres (Supabase)

Date: 2026-08-21 · Source of truth today: `src/lib/monitor-store.ts` (localStorage, key `deploypulse_monitors`).

## Current state
- Monitors live in browser localStorage via `getLocal/saveLocal/addLocal/updateLocal/deleteLocalMonitor`.
- `Monitor` fields: `id, projectId, name, url, type, interval, timeout, retries, status, lastCheck, lastStatusCode, lastLatency, uptime, tags[], createdAt, updatedAt`.
- Supabase project `wljgmmxpawumcunqirfl` exists but is **PAUSED** — Prisma routes fail until unpaused.
- Prisma schema already has User/Account/Session models (NextAuth adapter). Monitor model status: verify against `prisma/schema.prisma` before migrating.

## Phase 0 — Unblock (prereq)
1. Unpause Supabase project in dashboard (free tier auto-pauses after inactivity).
2. Set `DATABASE_URL` in Vercel env vars (pooled connection string).
3. `npx prisma migrate dev` locally → confirm schema syncs.

## Phase 1 — Schema
Add to `prisma/schema.prisma`:
```prisma
model Monitor {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  projectId       String?
  name            String
  url             String
  type            String   @default("http")
  interval        Int      @default(60)
  timeout         Int      @default(30)
  retries         Int      @default(3)
  status          String   @default("active")
  lastCheck       DateTime?
  lastStatusCode  Int?
  lastLatency     Int?
  uptime          Float    @default(100)
  tags            String[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
}
```
Migration name: `add_monitor_model`.

## Phase 2 — API layer (already half-built)
`/api/monitors` GET/POST and `/api/monitors/[id]` GET/PATCH/DELETE exist with auth guards. Wire them to Prisma instead of mock data:
- GET → `prisma.monitor.findMany({ where: { userId } })`
- POST → create with `userId: session.user.id`
- PATCH/DELETE → `where: { id, userId }` (ownership scoping — see SECURITY-AUDIT H1)

## Phase 3 — Client switch with fallback
In `monitor-store.ts`, swap implementations behind the same function signatures:
- Try API first; on network failure fall back to localStorage (offline tolerance).
- On first successful load, offer one-time import: push existing localStorage monitors via POST, then clear the local key.

## Phase 4 — Cleanup
- Remove localStorage code path after 2 weeks of stable API usage.
- Add `@@index([userId, status])` if dashboard filters by status.

## Risks
- **Data loss on import**: dedupe by `url + name` when importing local monitors.
- **Prisma on serverless**: use pooled connection (`?pgbouncer=true`) to avoid connection exhaustion.
- **Multi-device sync**: localStorage import must be idempotent (upsert by URL).
