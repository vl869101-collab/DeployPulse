# Security Audit — DeployPulse

Date: 2026-08-21 · Scope: NextAuth v5 config, middleware, API routes.

## Critical

### C1 — API routes without real authentication
`src/middleware.ts:35-44` only checks that a session-token **cookie exists** — it never validates it. Any request with `Cookie: authjs.session-token=fake` passes middleware.

Only these routes verify the session server-side via `auth()`:
- `src/app/api/monitors/route.ts` (GET, POST)
- `src/app/api/monitors/[id]/route.ts` (GET, PATCH, DELETE)

**Unprotected** (no `auth()` call, rely on bypassable middleware):
- `/api/incidents`, `/api/alerts`, `/api/status-pages`
- `/api/deployments`, `/api/logs`

**Fix**: add the standard guard to every route handler:
```ts
import { auth } from '@/auth';
const session = await auth();
if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
```
Or replace the middleware presence-check with real JWT verification (`getToken` from `next-auth/jwt` / Auth.js v5 equivalent).

## High

### H1 — No ownership scoping on monitors
`/api/monitors/[id]` authenticates but does not filter by `userId` on read/update/delete (verify Prisma `where` clauses include `userId: session.user.id`). Otherwise any authenticated user can access other users' monitors (IDOR/BOLA).

### H2 — AUTH_SECRET not enforced
No explicit check for `AUTH_SECRET`. NextAuth v5 fails closed in production without it, but add it to deployment checklist + Vercel env vars. Also confirm `AUTH_TRUST_HOST` is set correctly for Vercel.

## Medium

### M1 — Credentials provider has no rate limiting
`authorize()` in `src/auth.ts:25-42` allows unlimited brute-force attempts. Add rate limiting (e.g., Upstash Redis or Vercel WAF) before launch.

### M2 — bcrypt cost unspecified
`bcrypt.compare` uses hash-embedded cost (fine), but new password hashing elsewhere should pin `bcrypt.hash(pw, 12)` minimum.

### M3 — No CSP / security headers
No `Content-Security-Policy`, `X-Frame-Options`, `Referrer-Policy`, or `Permissions-Policy` headers found. Add via `next.config.ts` `headers()` or middleware.

## Low

### L1 — callbackUrl sanitization is good
Open-redirect protection at `middleware.ts:48-64` correctly rejects cross-origin callbacks. Keep.

### L2 — Session strategy JWT
JWT sessions mean no DB hit per request and revocation requires secret rotation. Acceptable for current stage; revisit if "log out everywhere" becomes a requirement.

## Priority order
1. C1 (add `auth()` guards to 5 unprotected route groups)
2. H1 (ownership scoping)
3. M3 (security headers)
4. M1 (rate limit login)
5. H2/M2 (checklist items)
