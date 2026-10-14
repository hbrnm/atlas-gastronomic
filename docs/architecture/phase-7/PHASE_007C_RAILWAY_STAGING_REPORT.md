# ATLAS GASTRONOMIC — PHASE 007-C FINAL REPORT
## Railway Private Staging Deployment & Acceptance Verification

**Authority:** Product Owner  
**Protocol:** Atlas AOS  
**Status:** COMPLETED & LIVE  
**Scope:** Private Staging Deployment, Infrastructure Provisioning, Online Acceptance Testing  
**Date:** 2026-10-14  

---

### 1. Executive Summary

Phase 007-C has been successfully executed in strict compliance with Product Owner directives:
- **No SaaS redesign, no multi-tenancy:** Preserved the modular monolith (React frontend + Express backend + Recipe Core engine + SQLite WAL persistence).
- **No external cloud databases:** Zero dependency on Supabase, PostgreSQL, Vercel, or Redis.
- **Dedicated Persistent Storage:** Railway Persistent Volume mounted at `/app/data` (500 MB) backing the SQLite database.
- **Private Access Control:** Fail-closed access gate enforced via timing-safe comparison; credentials isolated in environment variables.
- **Online Verification:** All 6 acceptance testing sections executed and passed against the live Railway staging URL.

---

### 2. Infrastructure & Provisioning Details

| Resource | Value / Identifier | Notes |
| :--- | :--- | :--- |
| **Hosting Platform** | Railway | Single container, single replica (`numReplicas: 1`) |
| **Workspace** | `hbrnm's Projects` | User: `laudat.alexandru@gmail.com` |
| **Railway Project** | `atlas-gastronomic-staging` | ID: `0db1a587-a0ae-4325-a0da-59ed83026f9b` |
| **Railway Service** | `atlas-gastronomic` | ID: `02c1ad09-8103-48f1-b93f-6b0f54f7ccf7` |
| **Deployment ID** | `873e1522-e32c-4390-bf8e-e2d6c4a48074` | Active Status: **SUCCESS / Online** |
| **Persistent Volume** | `atlas-gastronomic-volume` | ID: `4df5a47d-2595-443d-a242-54e4291975b2` |
| **Volume Mount** | `/app/data` | Size: 500 MB |
| **Staging HTTPS URL** | `https://atlas-gastronomic-production.up.railway.app` | Railway-generated wildcard SSL domain |
| **Port & Networking** | 3000 | Configured on Railway service port |

---

### 3. Environment Variable Configuration Matrix

All production secrets have been configured directly in Railway's encrypted environment store. In adherence to the strict security protocol, no raw secret strings are included in this report or tracked in git. Staging credentials for the Product Owner are maintained locally in `.env.production.local` (gitignored).

| Variable | Configuration | Purpose |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production security headers, rate limiting, and pre-built static client assets. |
| `ATLAS_REQUIRE_AUTH` | `true` | Enforces fail-closed private gating across all API routes. |
| `DATABASE_PATH` | `/app/data/atlas_gastronomic.db` | Points SQLite engine to the mounted persistent volume. |
| `PORT` | `3000` | Application HTTP listening port. |
| `RAILWAY_RUN_UID` | `0` | Ensures SQLite process has read/write permissions on the root-mounted host volume. |
| `ATLAS_ACCESS_KEY` | *[Configured on Railway / Secure]* | Reader passkey for unlocking the catalogue and Cook Mode. |
| `ATLAS_EDITORIAL_KEY` | *[Configured on Railway / Secure]* | Editorial passkey required for creating, modifying, and deleting recipes. |

---

### 4. Live Acceptance Test Suite Results

The comprehensive test suite [`tests/live-staging-acceptance.test.ts`](file:///c:/Users/pc1/Documents/antigravity/Atlas-gastronomic/tests/live-staging-acceptance.test.ts) was executed directly against `https://atlas-gastronomic-production.up.railway.app`.

**Execution Status:** `ALL 6 SECTIONS PASSED (0 failures)`

#### Section A: Availability & Health Check
- **Endpoint:** `GET /api/health` $\to$ `HTTP 200 OK`.
- **Payload:**
  ```json
  {
    "status": "ok",
    "service": "Atlas Gastronomic — Recipe Core V1",
    "timestamp": "2026-10-14T18:30:24.793Z"
  }
  ```

#### Section B: Private Access Enforcement & Security
- **Unauthenticated Read:** `GET /api/recipes` without credentials correctly returns `HTTP 401 Unauthorized` with `{"code": "APP_AUTH_REQUIRED"}`.
- **Invalid Key:** Rejected with `HTTP 401`.
- **Status Endpoint:** `GET /api/auth/status` reports `privateAccessRequired: true` without disclosing raw secrets or hashes.
- **Key Differentiation:** Verified that Reader Key grants read-only access, while Editorial Key grants both read and write access. Unprivileged write attempts return `HTTP 401`.

#### Section C: Recipe Core & Canonical Recipes
- **Online Catalogue:** All 5 canonical recipes present:
  1. `rec_tagliatelle_ragu_001` — Tagliatelle al Ragù alla Bolognese
  2. `rec_risotto_milanese_002` — Risotto alla Milanese
  3. `rec_boeuf_bourguignon_003` — Boeuf Bourguignon
  4. `rec_souffle_fromage_004` — Soufflé Chaud au Fromage
  5. `rec_sarmale_traditionale_012` — Sarmale Tradiționale în Foi de Varză Murată
- **Culinary Remediation Confirmed:** Sarmale recipe explicitly declares and allocates 550 ml cooking liquid (`lichid-fierbere-sarmale`) and 70 g total tomato paste (`pasta-tomate`: 30 g filling + 40 g liquid).

#### Section D: SQLite Persistence Across Container Restart
1. Created persistent test recipe `rec_staging_test_1792002626840` via `POST /api/recipes` with Editorial Key (`HTTP 201 Created`).
2. Triggered physical container restart via Railway GraphQL API (`deploymentRestart`).
3. Monitored restart lifecycle until health probe returned `HTTP 200 OK`.
4. Queried `GET /api/recipes/rec_staging_test_1792002626840` $\to$ data persisted completely across container recreation on `/app/data`.
5. Cleaned up disposable test record (`HTTP 200 OK`).

#### Section E: Security Headers & Rate Limiting
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` (HSTS active).
- `X-Content-Type-Options: nosniff`.
- `X-Frame-Options: DENY`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- Rate limiting configured to 5 attempts per 15-minute rolling window per client IP.

#### Section F: Mobile Viewport Browser Flow (Puppeteer)
- Viewport set to iPhone standard (390x844, touch-enabled).
- Lock screen rendered gatekeeper modal with password input and lock branding.
- Access key input submitted $\to$ catalogue rendered smoothly.
- Tagliatelle al Ragù selected from mobile card $\to$ Recipe Detail rendered.
- Confirmed responsive serving scaler and Cook Mode action buttons.

---

### 5. Cost & Resource Consumption

- **Provisioned Memory/CPU:** Standard shared burstable container on Railway.
- **Persistent Volume:** 500 MB mounted volume.
- **Estimated Operating Cost:** **\$1.50 – \$3.00 USD / month**, well within the \$5.00/month staging budget.
- **Resource Footprint:** SQLite WAL mode ensures negligible CPU and RAM overhead for private, editorial access.

---

### 6. Product Owner Acceptance Instructions

The staging instance is live and ready for final Product Owner inspection:

1. **Access URL:** [https://atlas-gastronomic-production.up.railway.app](https://atlas-gastronomic-production.up.railway.app)
2. **Access Passkey:** Located in `.env.production.local` on your local environment under `ATLAS_ACCESS_KEY`.
3. **Editorial Passkey:** Located under `ATLAS_EDITORIAL_KEY`.
4. **Validation Steps:**
   - Open the URL on desktop or mobile.
   - Enter your `ATLAS_ACCESS_KEY` to unlock the private catalogue.
   - Navigate to **Tagliatelle al Ragù alla Bolognese** and **Sarmale Tradiționale**.
   - Verify the serving scaler and enter **Mod de Gătit (Cook Mode)**.
   - Test step timers, active/passive guidance, and ingredient scaling.
