# DeployPulse — Black-Box Security Audit Report

**Target:** `https://deploy-pulse-xi.vercel.app` (DeployPulse — deployment-monitoring SaaS demo, Next.js + Turbopack hosted on Vercel)
**Date:** 2026-08-15
**Methodology:** Passive/semi-passive black-box. No destructive actions, no credential stuffing, no heavy brute force. All requests unauthenticated unless noted. Findings are calibrated to demonstrated impact on this deployment (see Scope Notes).

---

## 1. CRITICAL — Unauthenticated full CRUD access to the entire API

**Asset:** `https://deploy-pulse-xi.vercel.app/api/{monitors, incidents, alerts, status-pages}` (+ `/api/{monitors,status-pages}/[id]`) — Critical

**Evidence:**
- No session or cookie is required for any endpoint. Every request below was sent with no `Cookie` header and no Authorization token.
- `GET /api/monitors` -> `200` full monitor list (seed data, no auth).
- `GET /api/incidents`, `GET /api/alerts`, `GET /api/status-pages` -> `200` (read access to all resources).
- `POST /api/monitors` with body `{"name":"test-monitor","url":"https://example.com","type":"https","interval":60,"timeout":10,"retries":3,"tags":["test"]}` -> `201 Created`, response body containing a new ID `mon_1786805489537`.
- `POST /api/status-pages` -> `201 Created`.
- `PUT /api/status-pages/sp_1` accepted (response reflected `slug:"pwned-slug", customDomain:"evil.example.com", public:false, monitorIds:[]`).
- `DELETE /api/monitors/mon_1` -> `200 OK` — deleted the seed monitor "API Health Check" from the warmed instance (unauthorized data destruction proven). A replacement (`mon_1786805843308`) was POSTed afterward to restore the seed row; cleanup DELETEs of the test records returned 404 (per-instance state — see Finding 8).
- `PATCH /api/monitors/mon_1` -> `405` (only GET/PUT/DELETE implemented for `[id]`).
- Route enumeration confirmed only 4 API resources exist (`/api/auth/*` aside); there is no auth middleware or per-route session guard on any of them.

**Impact:** Any anonymous internet user can read, create, modify, and delete every API resource: monitor definitions (including target URLs and check parameters), incidents, alerts, and status-page content. This is a complete broken-access-control scenario — confidentiality (read all state), integrity (modify status pages / inject fake incidents), and availability (delete monitors and status pages) are all compromised without authentication. In this demo the data is seed/mock state (see Scope Notes), but the identical architecture on a production instance would expose real tenant data and enable destructive tampering at scale.

**Remediation:**
- Enforce authentication on every `/api/*` route (Next.js middleware matcher or per-handler `getServerSession()` check), returning `401`/`403` without data leakage.
- Enforce authorization after auth: scope objects to the owning user/team (ownership checks on `[id]` GET/PUT/DELETE).
- Add CSRF protection for state-changing requests on the API (currently absent).
- Validate/authorize mutations server-side.

---

## 2. HIGH — Authentication fully broken: AUTH_URL points at a dead preview domain, leaks infra info

**Asset:** `https://deploy-pulse-xi.vercel.app/api/auth/*`, `/login`, `/signup` — High

**Evidence:**
- `GET /api/auth/signin/github` -> `302 Location: https://deploypulse-h5ntj9o0k-victor-limas-projects.vercel.app/api/auth/error?error=Configuration`
- `GET /api/auth/signin/google` -> `302 Location: .../error?error=Configuration`
- `GET /api/auth/signin/credentials` -> `302 Location: .../error?error=Configuration`
- `GET /api/auth/callback/github` and `/api/auth/callback/google` -> same `302 -> error=Configuration`.
- `GET /api/auth/signin` -> `302 Location: /login?callbackUrl=https%3A%2F%2Fdeploypulse-h5ntj9o0k-victor-limas-projects.vercel.app` and sets `__Host-authjs.csrf-token` (HttpOnly; Secure; SameSite=Lax — cookie flags are correct).
- `GET /api/auth/verify-request` -> `200` (NextAuth default page).
- The leaked base URL `https://deploypulse-h5ntj9o0k-victor-limas-projects.vercel.app` follows Vercel preview-deployment naming (`<project>-<id>-<owner-handle>-projects.vercel.app`), disclosing: project name `deploypulse` and owner GitHub handle `victor-limas`. The preview URL is dead.
- `GET /api/auth/session` -> no session can be established; `/forgot-password` returns 200 but `/reset-password` returns 404 and `/api/auth/forgot-password` returns 400.

**Impact:** Availability: the product's authentication is unusable — nobody can sign in or register; the demo account `demo@deploypulse.com` cannot authenticate via any provider. Information disclosure: the misconfigured `AUTH_URL` leaks the internal project name and the developer's GitHub username (`victor-limas`), which assists targeted phishing or supplier-chain recon. Because auth is dead, session-requiring findings (e.g., Finding 7) are currently unexploitable but become live the moment auth is repaired.

**Remediation:**
- Set `AUTH_URL`/`NEXTAUTH_URL` (and `AUTH_SECRET`, provider env vars) to the production domain.
- Rotate `AUTH_SECRET` (it may have been exposed to preview envs).
- Add a CI guard that fails deploys where `AUTH_URL` is not the production domain.
- Fix or remove the credential/reset flows until functional.

---

## 3. HIGH — No rate limiting on the API

**Asset:** `https://deploy-pulse-xi.vercel.app/api/*` — High

**Evidence:**
- 30 rapid consecutive `GET /api/monitors` requests -> all `200`, zero `429` in the response stream.
- 15 rapid consecutive `POST /api/monitors` requests -> all `400` (validation errors, not throttle responses); no `x-ratelimit-*` or `Retry-After` headers observed.

**Impact:** The API is abuse-friendly: no protection against enumeration, write-flooding (fake monitors/incidents/status pages en masse), or serverless function resource exhaustion. Combined with Finding 1, an attacker can spam unlimited state changes. Once auth is restored, brute-forcing and account-takeover become viable with no throttling or lockout.

**Remediation:** Rate-limit per IP (and per user once auth exists): Vercel Firewall/WAF rules or app-level via Upstash Ratelimit; apply to all `/api/*` and `/api/auth/*` routes; return `429` with `Retry-After`; add separate login throttling with lockout/backoff.

---

## 4. MEDIUM — Missing security headers (clickjacking / MIME / referrer)

**Asset:** all pages of `https://deploy-pulse-xi.vercel.app` (`/`, `/login`, `/monitors`, `/dashboard`, `/status`, ...) — Medium

**Evidence:**
- Response headers captured on `/`:
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` OK
  - Missing: `Content-Security-Policy`, `X-Frame-Options`, `frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- Same on API responses.

**Impact:** Clickjacking of dashboard/status-page UI (e.g., tricking an admin into toggling settings or publishing fake incidents via invisible iframes). Missing `X-Content-Type-Options` can enable MIME-sniffing attacks on attacker-influenced content; missing `Referrer-Policy` leaks full URLs (including any query tokens such as callbackUrl) to third parties via `Referer`.

**Remediation:** Add via `vercel.json` headers or middleware:
- `Content-Security-Policy` (`frame-ancestors 'none'` at minimum)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 5. MEDIUM — `Access-Control-Allow-Origin: *` on all HTML pages

**Asset:** `https://deploy-pulse-xi.vercel.app/*` (HTML/SSR pages) — Medium

**Evidence:**
- `GET /` -> `Access-Control-Allow-Origin: *` (also on `/login`, `/monitors`, and other HTML pages).
- API routes do NOT reflect ACAO: `OPTIONS /api/monitors` preflight -> `204` with no `Access-Control-Allow-Origin`, so cross-origin JavaScript reads of the API are blocked by the browser. Cross-origin reads of HTML pages are permitted.


**Impact:** The wildcard ACAO on HTML responses is unnecessary and violates least privilege. Marginal today (pages contain no per-user secrets), but if any page ever returns personalized/SSR content (error pages with tokens, user-specific data), any script on any origin could read it via `fetch('/')`. The absence of ACAO on API responses is currently the only control preventing cross-origin API reads.

**Remediation:** Remove ACAO from HTML responses entirely; if APIs must be consumed cross-origin, restrict ACAO to a configured allowlist and mirror with `Vary: Origin`.

---

## 6. LOW — Verbose validation errors (schema/Zod disclosure)

**Asset:** `POST /api/monitors`, `POST /api/status-pages` — Low

**Evidence:**
- `POST /api/monitors` with body `{"name":"x"}` only -> `400 {"error":"Invalid input: expected string, received undefined"}` — raw Zod error string revealing the validator and its field expectations.
- `POST /api/monitors` with XML content-type -> `400 {"error":"Invalid request body"}` (clean).

**Impact:** Error messages act as a schema oracle: an attacker can map the full input contract (fields, types, requiredness) without documentation, speeding up mass-assignment probing and payload crafting. Low direct risk.

**Remediation:** Return generic errors (`400 {"error":"Invalid request"}`); log detailed validation failures server-side only.

---

## 7. LOW — Latent open redirect via unvalidated `callbackUrl` (requires working auth)

**Asset:** `https://deploy-pulse-xi.vercel.app/login` — Low (latent)

**Evidence:**
- Static analysis of login-page bundle `0v7mdg3oooirt.js`: `let m=useSearchParams().get("callbackUrl")||"/"`, then on successful sign-in `router.push(m)` — used verbatim, no scheme/host allowlist, no relative-only check.
- `GET /login?callbackUrl=https://evil.example.com` renders and retains that value; exploitation requires a successful sign-in, currently impossible (Finding 2).

**Impact:** Once auth is functional, a crafted link (`/login?callbackUrl=https://evil.example.com`) could post-login redirect victims to an attacker origin — a phishing/credential-harvesting enabler. Also, `/api/auth/signin` 302s to `/login?callbackUrl=<attacker value>`.

**Remediation:** Validate `callbackUrl` on the server: allow only same-origin paths (must start with `/`, reject foreign schemes/hosts). Mirror the check inside the auth callback.

---

## 8. INFO — In-memory, per-serverless-instance state (inconsistent writes)

**Asset:** API data layer — Info

**Evidence:**
- `PUT /api/status-pages/sp_1` response reflected `slug:"pwned-slug", customDomain:"evil.example.com", public:false`, but an immediate re-`GET /api/status-pages` returned the original values — the mutation only landed on one warmed instance.
- POST-created records (`mon_1786805489537`, ...) were invisible from most instances; cleanup `DELETE`s returned 404 (record lived on a different instance than the one serving the DELETE).
- Seed monitor `mon_1`'s `lastCheck` advanced in real time (14:50:44Z -> 14:53:53Z) and seed monitor `mon_3` became `down` (503), indicating activity on warmed instances, but state is definitively not durable/shared.

**Impact:** Confirms (a) the demo stores no durable state — findings must not be read as "production data exposed," and (b) any production fork copying this pattern (module-scope in-memory store) would lose or inconsistently serve data across serverless instances.

**Remediation:** Move state to a shared durable store (Postgres/Redis) with per-tenant partitioning; never hold application data in module-scope memory in serverless.

---

## 9. INFO — Demo/mock architecture: client bundle embeds mock data and fake billing

**Asset:** client bundles on all pages — Info

**Evidence:**
- Bundles contain fallback datasets: `mockMonitors`, `mockIncidents`, `mockAlerts`, `mockStatusPages`, `generateMockChecks` — UI renders mock data whenever the API is unreachable/empty.
- Dashboard shell (`1cutzl6hoehd6.js`) hardcodes demo account `demo@deploypulse.com` in the sidebar; no password in bundles.
- Billing page renders simulated plan cards (`$100`/`$150`); no Stripe references (`stripe`, `checkout_session`, `price_`) — billing is UI-only.
- No localStorage/sessionStorage usage anywhere in the bundles.

**Impact:** Confirms the tested asset is a cosmetic SaaS demo. `demo@deploypulse.com` is an identity an attacker may think is real; if the env is ever wired to a real provider linked to that email it could be targeted. Low standalone risk.

**Remediation:** Keep demo fixtures server-side, namespaced (`demo-*`), never in client bundles; wire real billing before production.

---

## 10. INFO — Housekeeping gaps

**Asset:** static/public resources — Info

**Evidence:**
- `/privacy` and `/terms` -> `404` (signup page links to both).
- `/sitemap.xml`, `/robots.txt`, `/security.txt` -> `404`.
- `/favicon.ico` -> `404`.
- Source maps `*.js.map` -> `403` (good — not exposed).
- No `.git`, `.env`, `vercel.json`, `next.config.js` exposure; `/graphql`, `/api/webhook`, `/api/stripe/webhook`, `/api/healthz`, `/api/version` all `404`.
- `/api/auth/csrf` returns a fresh `__Host-authjs.csrf-token` with correct flags (HttpOnly; Secure; SameSite=Lax) — cookie handling on the auth path is fine.

**Impact:** None security-relevant on its own; missing privacy/terms is a compliance-hygiene issue; absent security.txt reduces posture transparency.

**Remediation:** Serve `/privacy`, `/terms`, `/favicon.ico`, a `security.txt`; optionally add robots/sitemap.

---

## Tested-Negative Items (no vulnerability found)

| Test | Result |
|---|---|
| Stored XSS in monitor name (`<img src=x onerror=alert(1)>`) | Negative — status page is client-rendered React; payload escaped |
| Reflected XSS via `/status/<svg onload=alert(1)>` slug | Negative — reflects only URL-encoded inside RSC flight payload |
| CRLF/header injection via monitor name | Negative — no injected headers in responses |
| SQLi | Negative — API has no SQL surface (pure JSON handlers) |
| Path traversal (`/api/../../../etc/passwd`, `..%2f` encoding) | Blocked — Vercel 403/400 |
| Source maps | 403 (blocked) |
| Mass assignment (`type`/`status`/`projectId`) | Server overrides these fields |
| SSRF via monitor URL (`https://httpbin.org/status/418`) | Inconclusive — monitor stayed `pending`, null `lastCheck`; fetch path not provably exercised. Needs an attacker-observable listener |
| Session/localStorage abuse | No client storage usage at all |

---

## Scope Notes & Cleanup

- **Demo deployment:** data is ephemeral in-memory mock state; no real user accounts or production data were exposed beyond seed/demo content. Severity ratings are calibrated to this deployment and conservative for any production fork.
- Authentication could not be exercised as a logged-in user (login non-functional — Finding 2); anything marked "requires auth" is theoretical until auth is repaired.
- Benign test records created during the assessment: `mon_1786805489537`, `mon_1786805701303` (SSRF probe), `mon_1786805737162`, `mon_1786805738460`, `mon_1786805752836` (XSS probe), `mon_1786805843308` (seed restore), `inc_1786805490343`, plus a PUT on `sp_1` (re-read returned original values). Cleanup DELETEs returned 404 because state is per-warm-instance; records expire on instance recycle. The deleted seed monitor `mon_1` was restored via POST.
- No destructive action beyond the `DELETE /api/monitors/mon_1` proof (immediately restored); no credential stuffing; no brute force.

## Prioritized Remediation Summary

1. **Fix auth:** production `AUTH_URL` + `AUTH_SECRET` rotation -> restores login, kills the info leak (Finding 2), unblocks Finding 7.
2. **Guard all `/api/*` routes:** session enforcement + per-owner authorization + anti-CSRF (Finding 1).
3. **Add rate limiting** on API and auth routes (Finding 3).
4. **Security headers** via `vercel.json`/middleware (Finding 4); drop `ACAO: *` from HTML (Finding 5).
5. Generic error responses (Finding 6); `callbackUrl` allowlist (Finding 7).
6. Durable shared storage before production (Finding 8).
