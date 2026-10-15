# Project State

**Last verified:** 2026-10-15  
**State:** Phase 009 (Editorial Content Completion, Provenance Architecture, Audit Trails & Single Source of Truth) fully implemented, verified, and passing all automated test suites.

## Verified repository baseline
- Repository: `hbrnm/atlas-gastronomic`
- Current working branch: `chore/integrate-agent-skills`
- Application runtime: Node.js 22+ / Node 24 native SQLite `DatabaseSync`, Express REST API, React 19, TypeScript 5.7, Vite 6.
- Standards Pack v1.0.0 is intact and frozen under `standards/v1.0.0/`.
- Private access gatekeeper and rate limiter implemented.
- Full automated test suite: 73 tests (72 passing local unit, repository, validation, browser acceptance, and Phase 009 lifecycle/audit/API tests; 1 live staging test classified as environmental authentication per PO decision).

## Phase 009 Editorial Architecture & Single Source of Truth
- **Canonical Asset Completion (P0):** All 12 canonical European recipes have distinct, authentic, high-resolution photographic assets on disk in `src/client/public/images/`. The incorrect fallback reuse of `tagliatelle-ragu.jpg` is eliminated. Legal provenance, license identifiers, source URLs, authors, and initial rights status are recorded in `docs/provenance/canonical-assets-provenance.md`.
- **Editorial Metadata Persistence & Schema:** Relational table `recipe_editorial` and permanent `recipe_editorial_audit` implemented in SQLite (`DatabaseSync`), seeded idempotently with `ON CONFLICT(recipe_id) DO NOTHING`. All 12 recipes initialize in unapproved `draft` status with `unverified` rights, satisfying governance requirements.
- **Single Source of Truth:** SQLite database is authoritative for editorial profiles (`GET /api/editorial`, `GET /api/recipes/:id/editorial`, and nested in `Recipe` objects). Static dictionary `editorialData.ts` serves strictly as a transparent fallback.
- **Server-Resolved Identity & Anti-Impersonation:** Human approver identity is resolved server-side from `X-Atlas-Approver-Key` or `Authorization: Bearer <key>`. Client-submitted `approved_by` values are strictly discarded. Automated AI agents are explicitly blocked from setting `approved` status (fail-closed 403).
- **Audit Immutability & Lifecycle Invariant:** Engine-level SQLite triggers `prevent_editorial_audit_update` and `prevent_editorial_audit_delete` abort any mutation or deletion of audit rows. Audit history survives recipe deletion without cascading deletion. Any material modification to an approved profile automatically invalidates approval, drops status back to `in_review`, clears `approved_by` and `approved_at`, increments `profile_version`, and appends an audit record.
- **UI Integration:** `EditorialPanel.tsx` integrated into `RecipeEditor.tsx` as a dedicated tab with dual dirty-state tracking (`isCoreDirty`, `isEditorialDirty`). Consumer components (`RecipeList`, `RecipeDetail`, `CookMode`) render photography and metadata dynamically from SQLite.
