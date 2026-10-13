# Atlas Gastronomic — Architecture Decision Records (ADRs)

**Document:** `ATLAS_ARCHITECTURE_DECISIONS.md`  
**Protocol:** Atlas AOS (BOOT → RECONCILE → PLAN → EXECUTE → VERIFY → MEMORY SYNC → HANDOFF)  
**Boundary:** Boundary A Authorized (Documentation Only)  
**Repository:** `https://github.com/hbrnm/atlas-gastronomic`  
**Branch:** `chore/integrate-agent-skills`  
**Baseline Commit:** `1a2f6a3`  
**Standards Pack:** `standards/v1.0.0/` — FROZEN / IMMUTABLE  
**Decision Governance Note:** All ADRs formulated below are **PROPOSED**. Per owner mandate, architectural recommendations are not automatically ratified; they require explicit human approval before being marked `APPROVED`.

---

## 1. Overview of Architecture Decisions

This document captures the key architectural decisions reconciling the five core architectural specifications (System Context, Module Architecture, Domain Model, Workflow State Machine, Research-to-Publication Sequence) for Atlas Gastronomic.

| ID | Title | Status | Category | Scope |
|:---|:---|:---|:---|:---|
| **ADR-0001** | Modular Monolith Architecture over Microservices | `PROPOSED` | System Architecture | All Modules |
| **ADR-0002** | Decoupled Lifecycle State Machines (Dossier vs RecipeVersion) | `PROPOSED` | Domain & Workflow | Research, Editorial |
| **ADR-0003** | RecipeVersion Complete Immutability & DB Parent Locking Protocol | `PROPOSED` | Data Integrity | Editorial, Core DB |
| **ADR-0004** | Transactional Outbox Pattern with Exact 6-State Lifecycle for Distribution | `PROPOSED` | Integration | Publishing, Distribution |
| **ADR-0005** | Research Dossier as Mandatory Precondition for Recipe Modeling | `PROPOSED` | Domain Modeling | Research, Editorial |
| **ADR-0006** | In-Process Event Bus with Synchronous Local Transactions and Async Outbox | `PROPOSED` | Inter-Module Comm | All Modules |
| **ADR-0007** | Proposed Quality Gates (80/90) as Operational Calibration Thresholds | `PROPOSED` | Quality Governance | Review, Editorial |
| **ADR-0008** | Channel-Specific Publication Records with Distinct Withdrawal vs Archival | `PROPOSED` | Publishing | Publishing, Channels |
| **ADR-0009** | Relational Integrity & Composite Foreign Keys for Hierarchical Child Scoping | `PROPOSED` | Database Schema | Ingredients, Steps |
| **ADR-0010** | Comprehensive Audit Trail, Cryptographic Content Hashing & GDPR Pseudonymization | `PROPOSED` | Security & Compliance | Identity, Audit |

---

## 2. Relation to Existing Project Decisions (DEC-0001 to DEC-0005)

The proposed ADRs operationalize and maintain strict consistency with the decisions already recorded in project memory:
- **DEC-0001 (Direction C Selected):** Atlas Gastronomic is a Complete Gastronomic Editorial System, not merely a recipe CMS. Reflected in ADR-0001, ADR-0002, ADR-0005.
- **DEC-0002 (Standards Pack v1.0.0 Frozen):** Standards pack is immutable. All enum values and 9 canonical statuses in ADR-0002, ADR-0003, ADR-0007 derive directly from `standards/v1.0.0/`.
- **DEC-0003 (PostgreSQL with Rich Data Types):** Relational database with strict triggers and JSONB audit diffs. Formalized in ADR-0003, ADR-0009, ADR-0010.
- **DEC-0004 (Human-in-the-Loop Governance):** AI agents suggest; humans approve. Approval transactions are strictly human-governed. Formalized in ADR-0002, ADR-0003, ADR-0007.
- **DEC-0005 (Boundary A Strict Documentation Mode):** All ADRs remain `PROPOSED` until explicit owner sign-off.

---

## 3. Detailed Architecture Decision Records

### ADR-0001: Modular Monolith Architecture over Microservices

- **Status:** `PROPOSED`
- **Context:** Atlas Gastronomic requires deep domain consistency across 7 business modules (Identity, Research, Editorial, Publishing, Taxonomy, Quality, Audit). Microservices introduce distributed transaction overhead, network latency, and eventual consistency dilemmas that undermine strict immutability checks and cryptographic audit trails during initial operational scaling.
- **Decision:** Implement Atlas Gastronomic as a **Modular Monolith** using TypeScript/Node.js, sharing a single PostgreSQL relational database with strictly isolated database schemas or clear table ownership prefixes. Direct cross-boundary database mutations are forbidden; modules communicate strictly via documented module contracts (Commands, Queries, In-Process Events).
- **Consequences:**
  - *Positive:* ACID transactions across module boundaries when needed (e.g., publishing + outbox write); zero network serialization overhead for local queries; simplified deployment and debugging.
  - *Negative:* Requires strict linting and module boundary enforcement (e.g., via TypeScript project references or package boundaries) to prevent accidental domain leakage.
  - *Neutral:* Can be decomposed into microservices later without schema redesign if traffic warrants.
- **Alternatives Considered:** Distributed Microservices (rejected due to distributed transaction complexity for approvals and audit logs).

---

### ADR-0002: Decoupled Lifecycle State Machines (Dossier vs RecipeVersion)

- **Status:** `PROPOSED`
- **Context:** The editorial process relies heavily on culinary field research. Initial naive drafts coupled Research Dossier status directly to Recipe status, causing deadlocks when multiple recipes cited a single dossier or when a dossier was revised after a recipe was published.
- **Decision:** Decouple the research lifecycle from the recipe editorial lifecycle into two distinct state machines:
  1. `ResearchDossier`: 5 states (`draft`, `in_progress`, `review`, `completed`, `archived`).
  2. `RecipeVersion`: Exactly 9 canonical statuses per `standards/v1.0.0/` (`idea`, `researching`, `draft`, `technical_review`, `editorial_review`, `needs_revision`, `human_approved`, `published`, `archived`).
  A `RecipeVersion` may transition from `researching` to `draft` only when referencing a `ResearchDossier` in `completed` state. Subsequent revisions to the dossier do not invalidate historical recipe versions.
- **Consequences:**
  - *Positive:* Clean separation of concerns; multiple recipes can reference one completed dossier; research can evolve without breaking approved recipes.
  - *Negative:* Requires foreign key references to immutable `research_dossier_version_id` snapshots.
- **Alternatives Considered:** Monolithic combined state machine (rejected because research progress cannot be mapped 1:1 to recipe drafting).

---

### ADR-0003: RecipeVersion Complete Immutability & DB Parent Locking Protocol

- **Status:** `PROPOSED`
- **Context:** Once approved, gastronomic content (ingredients, quantities, processing steps, scientific/historical notes) must never change without invalidating culinary review and public safety guarantees. Race conditions could occur if child records (steps/ingredients) are updated concurrently with parent approval.
- **Decision:** Enforce absolute database-level immutability for `RecipeVersion` and its child tables (`RecipeIngredient`, `RecipeStep`, `StepIngredientRef`, `CulturalContext`) using PostgreSQL row-level locks and triggers:
  1. *Locking Protocol:* Any child mutation acquires a row-share lock on the parent (`SELECT id FROM recipe_versions WHERE id = $1 FOR SHARE`). Approval transactions acquire an exclusive row lock (`SELECT id FROM recipe_versions WHERE id = $1 FOR UPDATE`).
  2. *Canonical Content Hashing:* Prior to approval, a deterministic canonical SHA-256 hash is computed over all parent content fields and sorted child entities.
  3. *Hash Verification:* The approval transaction compares the review hash with the live calculated hash, persisting the verified hash in `approval_records.content_hash`.
  4. *Trigger Enforcement:* PostgreSQL `BEFORE UPDATE OR DELETE` triggers unconditionally reject mutations on parent or child records if status $\in$ (`human_approved`, `published`, `archived`).
- **Consequences:**
  - *Positive:* Zero possibility of post-approval content tampering or race conditions; mathematically verifiable authenticity.
  - *Negative:* Editorial corrections require branching a new `RecipeVersion` (`revision_number + 1`), increasing storage requirements.
- **Alternatives Considered:** Application-only checks (rejected as vulnerable to direct database access or background worker bugs).

---

### ADR-0004: Transactional Outbox Pattern with Exact 6-State Lifecycle for Distribution

- **Status:** `PROPOSED`
- **Context:** Disseminating recipes to external channels (Web, Mobile, Newsletter, Export) must not cause dual-write failure modes where a publication status changes locally but external systems fail, or vice versa.
- **Decision:** Implement a Transactional Outbox pattern with an **exact 6-state lifecycle**:
  `CREATED` $\rightarrow$ `CLAIMED` $\rightarrow$ `SUCCEEDED` / `FAILED_RETRYABLE` $\rightarrow$ `RETRY_SCHEDULED` $\rightarrow$ `DEAD_LETTER`.
  - Publication state and outbox events are written in the same PostgreSQL ACID transaction.
  - Background workers poll outbox entries using `FOR UPDATE SKIP LOCKED`, generating a unique `lease_token` (UUID) upon each successful claim.
  - *Lease Duration Policy (Open Decision):* The exact worker lease duration remains an **open Owner decision** under evaluation between **120 seconds** (faster recovery of orphaned jobs, higher sensitivity to latency) and **300 seconds** (greater tolerance for slow network operations, slower recovery), to be finalized during the Phase 2.2 technical spike.
  - *Lease Fencing:* Completion transitions (`SUCCEEDED`) must verify `id`, `status = 'CLAIMED'`, `lease_token`, and lease expiration to prevent stale workers from completing expired jobs.
  - Max retry count is 5 with exponential backoff and jitter; failure transitions to `DEAD_LETTER`.
  - External consumers use durable idempotency keys: `hash(event_type + ":" + publication_id + ":" + publication_revision)` stored in `consumer_idempotency_records`.
- **Consequences:**
  - *Positive:* Guaranteed at-least-once delivery; no distributed dual-write inconsistency; resilience to channel outages; fencing protects against stale worker races.
  - *Negative:* Eventual consistency on external distribution channels; requires dedicated outbox polling worker pool.
- **Alternatives Considered:** Direct synchronous HTTP calls in publishing transaction (rejected due to timeout and failure cascading risks).

---

### ADR-0005: Research Dossier as Mandatory Precondition for Recipe Modeling

- **Status:** `PROPOSED`
- **Context:** Generic recipe platforms allow arbitrary text entry without ethnographic, historical, or scientific grounding. Atlas Gastronomic Strategic Direction C mandates that culinary knowledge must be rigorously sourced.
- **Decision:** The domain model requires every recipe to cite a primary `ResearchDossier` version before transitioning past the `researching` status. The recipe draft must link to verified historical sources, ethnographic informants, or culinary field recordings captured in the research module.
- **Consequences:**
  - *Positive:* High editorial authority and scientific rigor; eliminates unverified recipe submissions.
  - *Negative:* Increases authoring friction; rapid prototyping of quick recipes requires stub dossiers.
- **Alternatives Considered:** Optional research dossier linkage (rejected because it compromises strategic direction C).

---

### ADR-0006: In-Process Event Bus with Synchronous Local Transactions and Async Outbox

- **Status:** `PROPOSED`
- **Context:** Modules within the modular monolith need to react to state changes (e.g., Audit module recording reviews, Quality module running automated rule validation) without tight compile-time coupling.
- **Decision:** Implement an in-memory `DomainEventBus` for local decoupled listeners.
  - Synchronous listeners run within the caller's transaction for strict invariants (e.g., writing to Audit log).
  - Asynchronous integration events are published via the Transactional Outbox (`outbox_events` table) to decouple external side effects.
- **Consequences:**
  - *Positive:* High performance; zero external messaging infrastructure (Kafka/RabbitMQ) needed for initial phases; audit trails guaranteed via ACID.
  - *Negative:* Heavy background processing must not block local transactions; long-running tasks must be pushed to outbox.
- **Alternatives Considered:** External message broker (rejected as premature operational complexity for Phase 2).

---

### ADR-0007: Proposed Quality Gates (80/90) as Operational Calibration Thresholds

- **Status:** `PROPOSED`
- **Context:** To maintain editorial excellence, composite quality score thresholds of 80 (Technical Review) and 90 (Editorial Review) were proposed. However, hardcoding these thresholds into canonical standards without operational empirical data could block valid cultural recipes with non-standard attributes.
- **Decision:** Clarify that quality score thresholds (80 for Technical, 90 for Editorial) are **PROPOSED operational calibration thresholds**, not immutable canonical requirements of `standards/v1.0.0/`.
  - The Quality Engine evaluates 5 dimensions (Gastronomic Integrity, Historical-Cultural Grounding, Precision & Reproducibility, Sensory Quality, Safety).
  - Human Approvers retain ultimate authority and can record an explicit justification override if a score falls below the operational threshold due to unique cultural context.
- **Consequences:**
  - *Positive:* Prevents automated gatekeeper deadlocks while establishing clear quantitative editorial benchmarks.
  - *Negative:* Requires human reviewers to actively evaluate and occasionally document threshold overrides.
  - *Neutral:* Non-canonical calibration threshold.
- **Alternatives Considered:** Mandatory automated blocking thresholds with zero override capability (rejected as overly rigid for diverse folkloric recipes).

---

### ADR-0008: Channel-Specific Publication Records with Distinct Withdrawal vs Archival

- **Status:** `PROPOSED`
- **Context:** A recipe may be withdrawn from a specific channel (e.g., social media or public website due to seasonal rotation or localized recall) without revoking its gastronomic approval or deleting it from archives.
- **Decision:** Decouple publication channel status from recipe editorial status:
  - `RecipeVersion.status` manages editorial lifecycle (`human_approved`, `published`, `archived`).
  - `Publication` manages distribution per channel (`scheduled`, `published`, `withdrawn`, `failed`).
  - *Withdrawal:* Setting `Publication.status = 'withdrawn'` removes content from that specific channel. If all publications for a recipe version are withdrawn, `RecipeVersion.status` reverts from `published` to `human_approved` (approved culinary content remains intact).
  - *Archival:* Setting `RecipeVersion.status = 'archived'` is a permanent editorial decision executed only by an authorized Human Approver (Admin strictly forbidden). It triggers automatic withdrawal of all active channel publications.
- **Consequences:**
  - *Positive:* Fine-grained channel control; clean distinction between content approval and channel distribution.
  - *Negative:* Requires state synchronization handlers between `Publication` changes and parent `RecipeVersion`.
- **Alternatives Considered:** Single boolean `is_published` on RecipeVersion (rejected as unable to support multi-channel distribution).

---

### ADR-0009: Relational Integrity & Composite Foreign Keys for Hierarchical Child Scoping

- **Status:** `PROPOSED`
- **Context:** Naive database modeling allows cross-version leakage: a step in RecipeVersion 2 referencing an ingredient declared only in RecipeVersion 1.
- **Decision:** Enforce composite primary and foreign keys for all child entities:
  - `RecipeIngredient`: PK `(recipe_version_id, ingredient_id)` or `id` with unique `(recipe_version_id, sequence_order)`.
  - `RecipeStep`: PK `(recipe_version_id, step_number)`.
  - `StepIngredientRef`: Composite FK `(recipe_version_id, step_id)` REFERENCES `recipe_steps(recipe_version_id, id)` AND composite FK `(recipe_version_id, recipe_ingredient_id)` REFERENCES `recipe_ingredients(recipe_version_id, id)`.
  All historical references use `ON DELETE RESTRICT`.
- **Consequences:**
  - *Positive:* Database mathematically prevents cross-version entity corruption; absolute referential integrity.
  - *Negative:* Slightly more complex SQL joins requiring composite keys.
- **Alternatives Considered:** Simple surrogate keys without composite compound foreign keys (rejected due to risk of version-mixing integrity bugs).

---

### ADR-0010: Comprehensive Audit Trail, Cryptographic Content Hashing & GDPR Protocol (Proposals)

- **Status:** `PROPOSED`
- **Context:** Legal compliance, academic citation integrity, and GDPR "Right to be Forgotten" must coexist without breaking cryptographic audit trails of approved publications.
- **Decision (Technical Proposals Requiring Legal & Owner Approval):**
  1. *Audit Storage Proposal:* Scoped retention policy — PostgreSQL hot audit table retained for 3 years (operational proposal); cold partitioned storage archived in immutable object storage.
  2. *Cryptographic Hashing:* Immutable snapshots of approved recipes are signed with SHA-256 hashes (`v1:sha256:...`) stored in `approval_records`.
  3. *GDPR & User Tombstoning Proposal:* Propose pseudonymization of personally identifiable information (`users.name = 'Redacted'`, `users.email = 'hash@tombstone.internal'`), preserving internal UUIDs to maintain referential integrity of historical approvals.
  *Explicit Legal Notice:* Pseudonymization is not anonymization; retaining linkable UUIDs maintains personal data status under GDPR Art. 4(5) and does not automatically establish compliance with GDPR erasure requirements (Art. 17). These mechanisms, along with the 3-year audit retention and WORM storage, are **technical proposals that require formal legal review and explicit Owner sign-off before implementation**.
- **Consequences:**
  - *Positive:* Preserves mathematical immutability and provenance of historical publications while establishing a clear technical baseline for legal counsel review.
  - *Negative:* Requires legal validation; pseudonymization alone cannot be treated as an absolute legal shield.
- **Alternatives Considered:** Hard cascade deletion of user records (rejected because it destroys referential integrity and legal/editorial audit trails).

---

## 4. Architectural Decision Summary & Approval Status

| ADR | Title | Proposed Date | Target Reviewer | Implementation Phase |
|:---|:---|:---|:---|:---|
| ADR-0001 | Modular Monolith Architecture | 2026-10-13 | System Architect / Owner | Phase 2.2 / Phase 3 |
| ADR-0002 | Decoupled Lifecycle State Machines | 2026-10-13 | Domain Architect / Owner | Phase 2.2 / Phase 3 |
| ADR-0003 | RecipeVersion Immutability & DB Locking | 2026-10-13 | Database Engineer / Owner | Phase 2.2 / Phase 3 |
| ADR-0004 | Transactional Outbox Pattern | 2026-10-13 | Backend Lead / Owner | Phase 2.2 / Phase 3 |
| ADR-0005 | Research Dossier as Mandatory Precondition | 2026-10-13 | Editorial Lead / Owner | Phase 2.2 / Phase 3 |
| ADR-0006 | In-Process Event Bus Architecture | 2026-10-13 | Backend Lead / Owner | Phase 2.2 / Phase 3 |
| ADR-0007 | Quality Gates Operational Calibration | 2026-10-13 | Quality Lead / Owner | Phase 2.2 / Phase 3 |
| ADR-0008 | Publication & Channel Architecture | 2026-10-13 | Publishing Lead / Owner | Phase 2.2 / Phase 3 |
| ADR-0009 | Relational Integrity & Composite FKs | 2026-10-13 | Database Engineer / Owner | Phase 2.2 / Phase 3 |
| ADR-0010 | Audit Trail, Hashing & GDPR Protocol | 2026-10-13 | Security / Legal / Owner | Phase 2.2 / Phase 3 |

*All decisions remain in PROPOSED state awaiting formal Owner sign-off before implementation in Phase 2.2/3.*
