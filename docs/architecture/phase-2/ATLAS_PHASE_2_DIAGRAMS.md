# Atlas Gastronomic — Consolidated Architectural Diagrams & Specifications

**Document:** `ATLAS_PHASE_2_DIAGRAMS.md`  
**Protocol:** Atlas AOS (BOOT → RECONCILE → PLAN → EXECUTE → VERIFY → MEMORY SYNC → HANDOFF)  
**Boundary:** Boundary A Authorized (Documentation Only)  
**Repository:** `https://github.com/hbrnm/atlas-gastronomic`  
**Branch:** `chore/integrate-agent-skills`  
**Baseline Commit:** `1a2f6a3`  
**Standards Pack:** `standards/v1.0.0/` — FROZEN / IMMUTABLE  

---

## 1. Overview

This document serves as the master consolidation of all five core architectural models for **Atlas Gastronomic**:
1. **System Context**
2. **Container & Module Architecture**
3. **Domain Model / Entity-Relationship Model**
4. **Editorial Workflow State Machine**
5. **Research-to-Publication Sequence**

Each model is presented in two dual formats:
- **Mermaid Diagram Code Block** (validated for standard rendering in markdown viewers).
- **Structured Textual Specification** (canonical, unambiguous relational text ensuring complete accessibility and machine readability).

---

## 2. Specification 1: System Context

### 2.1 Mermaid Diagram Code

```mermaid
flowchart TD
    subgraph Actors["Human Actors & Autonomous Agents"]
        Researcher["Field Researcher / Ethnographer"]
        Author["Culinary Author / Chef"]
        Reviewer["Culinary & Technical Reviewer"]
        Approver["Human Approver (Head of Editorial)"]
        Admin["System Administrator (Platform Ops)"]
        AIAgent["AI Research & Quality Agent"]
    end

    subgraph AtlasCore["Atlas Gastronomic Platform (Core System Boundary)"]
        WebUI["Web Editorial Interface (SPA / Next.js)"]
        APIGW["Core API Gateway & App Server (Node.js/TypeScript)"]
        ModularMonolith["Modular Domain Engines (Monolith)"]
        PostgresDB[("PostgreSQL Relational DB (ACID, Triggers, Audit)")]
        OutboxQueue["Transactional Outbox Queue (PostgreSQL Table)"]
        
        WebUI -->|REST / GraphQL / SSE| APIGW
        APIGW --> ModularMonolith
        ModularMonolith -->|Read / Write with ACID Triggers| PostgresDB
        ModularMonolith -->|Transactional Insert| OutboxQueue
    end

    subgraph ExternalSystems["External Systems & Distribution Channels"]
        WebChannel["Public Web & Gastronomic Atlas Portal"]
        MobileApp["Mobile Culinary Guide App (API Consumer)"]
        Newsletter["Newsletter & Syndication Dispatcher"]
        ExportPipeline["Static Archive & Print Export Pipeline"]
        TaxonomyVocab["External Culinary Taxonomy Registries (Agrovoc/Wikidata)"]
        ObjectStore["Immutable Object Storage (Media / Cold Audit)"]
    end

    Researcher -->|Submits ethnographic field dossiers| WebUI
    Author -->|Drafts structured recipes citing dossiers| WebUI
    Reviewer -->|Performs technical & sensory evaluations| WebUI
    Approver -->|Authorizes publication & seals content hash| WebUI
    Admin -->|Manages RBAC, users & system health (NO approval rights)| WebUI
    AIAgent -->|Provides research suggestions & automated rule checks| APIGW

    OutboxQueue -->|Asynchronous Event Worker Dispatch| WebChannel
    OutboxQueue -->|Asynchronous Event Worker Dispatch| MobileApp
    OutboxQueue -->|Asynchronous Event Worker Dispatch| Newsletter
    OutboxQueue -->|Asynchronous Event Worker Dispatch| ExportPipeline
    ModularMonolith <-->|Harmonizes terms & canonical identifiers| TaxonomyVocab
    ModularMonolith -->|Stores raw media & cold audit archives| ObjectStore

    classDef human fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    classDef agent fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef core fill:#fff3e0,stroke:#f57c00,stroke-width:2px;
    classDef external fill:#e8f5e9,stroke:#388e3c,stroke-width:2px;

    class Researcher,Author,Reviewer,Approver,Admin human;
    class AIAgent agent;
    class WebUI,APIGW,ModularMonolith,PostgresDB,OutboxQueue core;
    class WebChannel,MobileApp,Newsletter,ExportPipeline,TaxonomyVocab,ObjectStore external;
```

### 2.2 Structured Textual Specification

- **Core System Boundary:** Atlas Gastronomic Platform provides authoritative gastronomic knowledge management, culinary ethnography tracking, structured recipe formulation, multi-stage human review, immutable content signing, and multi-channel publishing.
- **Human Actors:**
  - *Field Researcher / Ethnographer:* Compiles and submits field observations, cultural context, and oral culinary histories (`ResearchDossier`).
  - *Culinary Author / Chef:* Transcribes culinary knowledge into structured recipe formulations citing completed research dossiers.
  - *Culinary & Technical Reviewer:* Conducts quantitative and qualitative evaluations (technical reproducibility, sensory accuracy, cultural integrity).
  - *Human Approver (Head of Editorial):* Holds sole legal/editorial authority to approve recipes (`human_approved`) and permanently archive them (`archived`). Seals content with cryptographic SHA-256 hash.
  - *System Administrator:* Manages infrastructure, tenant identity, and RBAC permissions. Strictly forbidden from culinary approvals.
- **Autonomous Agents:**
  - *AI Research & Quality Agent:* Analyzes drafts against standard taxonomies, flags missing allergen warnings, computes proposed quality metrics. All agent actions are assistive and advisory (Human-in-the-Loop invariant).
- **External Dependencies & Distribution:**
  - *Taxonomy Registries:* External standards (Agrovoc, Wikidata) for canonical ingredient reconciliation.
  - *Object Storage:* S3/GCS compliant store for high-resolution photography, audio field recordings, and cold audit archives.
  - *Publishing Targets:* Public Website, Mobile App API, Newsletter Dispatcher, and Static Print Pipeline (all fed asynchronously via Transactional Outbox).

---

## 3. Specification 2: Container & Module Architecture

### 3.1 Mermaid Diagram Code

```mermaid
flowchart TD
    subgraph API_Layer["Presentation & API Layer"]
        HTTP["Express / Fastify HTTP REST & GraphQL Controllers"]
        AuthMiddleware["RBAC & Identity Middleware"]
        HTTP --> AuthMiddleware
    end

    subgraph Modular_Monolith["Modular Domain Engines (In-Process Monolith)"]
        subgraph Mod_Identity["Identity & Access Module"]
            UserMgmt["User & Role Management"]
            AuditAuth["Authentication & Session State"]
        end

        subgraph Mod_Research["Research & Fieldwork Module"]
            DossierEngine["Research Dossier Engine"]
            SourceMgmt["Source & Informant Registry"]
        end

        subgraph Mod_Editorial["Editorial & Recipe Engine"]
            RecipeLifecycle["Recipe Lifecycle State Machine"]
            ContentHasher["Canonical SHA-256 Content Hasher"]
            VersionManager["Recipe Version & Revision Manager"]
        end

        subgraph Mod_Taxonomy["Taxonomy & Ingredients Module"]
            IngredientMaster["Canonical Ingredient Registry"]
            TechniqueMaster["Culinary Technique Registry"]
            EquipmentMaster["Equipment & Vessel Registry"]
        end

        subgraph Mod_Quality["Quality & Review Module"]
            ScoringEngine["5-Dimension Quality Scorer"]
            ReviewOrchestrator["Review Cycle Orchestrator"]
        end

        subgraph Mod_Publishing["Publishing & Distribution Module"]
            PublicationOrchestrator["Channel Publication Orchestrator"]
            OutboxManager["Transactional Outbox Engine (6 States)"]
            RetryWorker["Worker Pool & Exponential Backoff"]
        end

        subgraph Mod_Audit["Audit & Governance Module"]
            AuditWriter["Append-Only Audit Log Writer"]
            TombstoneRedactor["GDPR Pseudonymizer & Tombstone Engine"]
        end
    end

    subgraph Data_Storage["Persistent Storage Layer (PostgreSQL)"]
        AppDB[("PostgreSQL Database
        - Isolation Schemas / Table Prefixes
        - BEFORE INSERT/UPDATE/DELETE Triggers
        - Row-Level Locks (FOR SHARE / FOR UPDATE)
        - Transactional Outbox Table")]
    end

    AuthMiddleware --> Mod_Identity
    AuthMiddleware --> Mod_Research
    AuthMiddleware --> Mod_Editorial
    AuthMiddleware --> Mod_Quality
    AuthMiddleware --> Mod_Publishing

    Mod_Editorial -->|Cites completed dossier| Mod_Research
    Mod_Editorial -->|Validates ingredients & techniques| Mod_Taxonomy
    Mod_Editorial -->|Requests evaluation prior to approval| Mod_Quality
    Mod_Editorial -->|Transfers approved recipe for distribution| Mod_Publishing
    Mod_Editorial -->|Records cryptographic approval seal| Mod_Audit
    Mod_Publishing -->|Writes outbox events in local transaction| AppDB
    Mod_Identity -->|Audits privilege changes| Mod_Audit

    Mod_Editorial --> AppDB
    Mod_Research --> AppDB
    Mod_Taxonomy --> AppDB
    Mod_Quality --> AppDB
    Mod_Audit --> AppDB
```

### 3.2 Structured Textual Specification

- **Architecture Style:** In-process **Modular Monolith** in TypeScript/Node.js, backed by a single PostgreSQL database with schema-isolated tables.
- **7 Core Modules & Contracts:**
  1. *Identity & Access Module:* Manages credentials, sessions, roles (`researcher`, `author`, `reviewer`, `approver`, `admin`), and permission checks. Admin cannot approve recipes.
  2. *Research & Fieldwork Module:* Manages `ResearchDossier` and field observations through a 5-state lifecycle (`draft`, `in_progress`, `review`, `completed`, `archived`).
  3. *Editorial & Recipe Engine:* Core domain managing `Recipe` and `RecipeVersion` across 9 canonical statuses. Enforces parent row-level locking during edits and approval, and triggers permanent immutability.
  4. *Taxonomy & Ingredients Module:* Authoritative master data for ingredients, botanical varieties, processing techniques, and regional vessels.
  5. *Quality & Review Module:* Orchestrates technical and editorial reviews across 5 dimensions, emitting evaluations against proposed calibration thresholds (80 technical, 90 editorial).
  6. *Publishing & Distribution Module:* Manages channel-specific `Publication` records and dispatches async events via an exact 6-state Transactional Outbox worker pool with durable consumer idempotency keys.
  7. *Audit & Governance Module:* Immutably captures all domain events and state transitions with JSONB diffs, maintains cryptographic content hashes, and handles GDPR pseudonymization without breaking historical hashes.

---

## 4. Specification 3: Domain Model / Entity-Relationship Model

### 4.1 Mermaid Diagram Code

```mermaid
erDiagram
    User ||--o{ ResearchDossier : "researches"
    User ||--o{ Recipe : "authors"
    User ||--o{ QualityEvaluation : "evaluates"
    User ||--o{ ApprovalRecord : "authorizes"
    User ||--o{ AuditLog : "triggers"

    ResearchDossier ||--o{ RecipeVersion : "grounds"

    Recipe ||--|{ RecipeVersion : "contains"
    
    RecipeVersion ||--|{ RecipeIngredient : "specifies"
    RecipeVersion ||--|{ RecipeStep : "prescribes"
    RecipeVersion ||--o| CulturalContext : "enriches"
    RecipeVersion ||--o{ QualityEvaluation : "receives"
    RecipeVersion ||--o| ApprovalRecord : "sealed_by"
    RecipeVersion ||--o{ Publication : "distributed_via"

    RecipeStep ||--o{ StepIngredientRef : "references"
    RecipeIngredient ||--o{ StepIngredientRef : "used_in"

    CanonicalIngredient ||--o{ RecipeIngredient : "standardizes"
    CulinaryTechnique ||--o{ RecipeStep : "governs"

    Publication ||--o{ OutboxEvent : "enqueues"

    User {
        uuid id PK
        string email UK
        string name
        string role "researcher | author | reviewer | approver | admin"
        boolean is_active
        timestamp created_at
    }

    ResearchDossier {
        uuid id PK
        string title
        string region
        string status "draft | in_progress | review | completed | archived"
        jsonb historical_sources
        uuid lead_researcher_id FK
        timestamp completed_at
    }

    Recipe {
        uuid id PK
        string slug UK
        string canonical_title
        uuid primary_dossier_id FK
        uuid author_id FK
        timestamp created_at
    }

    RecipeVersion {
        uuid id PK
        uuid recipe_id FK
        integer revision_number
        string status "idea | researching | draft | technical_review | editorial_review | needs_revision | human_approved | published | archived"
        uuid research_dossier_version_id FK
        integer prep_time_minutes
        integer cook_time_minutes
        integer servings
        string difficulty_level
        string language_code
        string canonical_content_hash
        timestamp approved_at
        timestamp created_at
    }

    RecipeIngredient {
        uuid id PK
        uuid recipe_version_id FK
        uuid canonical_ingredient_id FK
        decimal quantity
        string unit
        string preparation_notes
        boolean is_mandatory
        integer sequence_order
    }

    RecipeStep {
        uuid id PK
        uuid recipe_version_id FK
        integer step_number
        text instruction
        uuid culinary_technique_id FK
        integer duration_minutes
        string critical_control_point
    }

    StepIngredientRef {
        uuid id PK
        uuid recipe_version_id FK
        uuid step_id FK
        uuid recipe_ingredient_id FK
    }

    CulturalContext {
        uuid id PK
        uuid recipe_version_id FK
        text ethnographic_notes
        text oral_tradition_transcription
        text seasonal_significance
    }

    QualityEvaluation {
        uuid id PK
        uuid recipe_version_id FK
        uuid reviewer_id FK
        string review_type "technical | editorial"
        decimal gastronomic_integrity_score
        decimal historical_grounding_score
        decimal reproducibility_score
        decimal sensory_quality_score
        decimal safety_score
        decimal composite_score
        boolean passed
        text feedback_notes
        timestamp created_at
    }

    ApprovalRecord {
        uuid id PK
        uuid recipe_version_id FK
        uuid approver_id FK
        string content_hash "SHA-256"
        text approval_justification
        timestamp approved_at
    }

    Publication {
        uuid id PK
        uuid recipe_version_id FK
        string channel "web | mobile | newsletter | export"
        string status "scheduled | published | withdrawn | failed"
        integer channel_revision
        timestamp published_at
    }

    OutboxEvent {
        uuid id PK
        uuid publication_id FK
        string event_type
        string aggregate_type
        uuid aggregate_id
        jsonb payload
        string status "CREATED | CLAIMED | SUCCEEDED | FAILED_RETRYABLE | RETRY_SCHEDULED | DEAD_LETTER"
        integer retry_count
        timestamp retry_after
        string lease_token
        timestamp leased_at
        text last_error
        timestamp created_at
    }

    AuditLog {
        uuid id PK
        string entity_name
        uuid entity_id
        string action "INSERT | UPDATE | DELETE | TRANSITION"
        uuid actor_id FK
        string actor_role
        jsonb before_state
        jsonb after_state
        timestamp performed_at
    }
```

### 4.2 Structured Textual Specification

- **Relational Integrity Guarantees:**
  - `RecipeVersion` is identified by UUID PK `id` and constrained by unique `(recipe_id, revision_number)`.
  - `StepIngredientRef` enforces hierarchical integrity through composite foreign keys `(recipe_version_id, step_id)` pointing to `recipe_steps` and `(recipe_version_id, recipe_ingredient_id)` pointing to `recipe_ingredients`. This mathematically prevents a step from referencing an ingredient belonging to a different version.
- **Database Immutability Invariant:**
  - Modifying child entities (`RecipeIngredient`, `RecipeStep`, `CulturalContext`, `StepIngredientRef`) locks the parent via `SELECT ... FOR SHARE`.
  - Approving a version locks the parent via `SELECT ... FOR UPDATE`.
  - PostgreSQL `BEFORE INSERT OR UPDATE OR DELETE` triggers unconditionally reject content mutations on `RecipeVersion` and its child tables if parent status $\in$ (`human_approved`, `published`, `archived`).
  - Editorial revisions require creating a new row in `RecipeVersion` with `revision_number = revision_number + 1`.
- **Audit & Cryptographic Invariants:**
  - `ApprovalRecord` seals the exact canonical SHA-256 hash (`v1:sha256:...`) computed deterministically over the version and sorted child records.
  - Audit trail is append-only with proposed 3-year hot retention; user pseudonymization proposals preserve UUIDs and cryptographic hash integrity, subject to formal legal review and Owner approval.

---

## 5. Specification 4: Editorial Workflow State Machine

### 5.1 Mermaid Diagram Code

```mermaid
stateDiagram-v2
    [*] --> idea : Author / Researcher proposes concept

    state "Research Sub-Workflow (Independent Lifecycle)" as ResearchStage {
        [*] --> Res_Draft : Researcher creates dossier
        Res_Draft --> Res_InProgress : Field fieldwork commences
        Res_InProgress --> Res_Review : Peer review & source validation
        Res_Review --> Res_Completed : Lead Researcher certifies dossier
        Res_Review --> Res_InProgress : Additional evidence required
        Res_Completed --> Res_Archived : Superceded / deprecated
    }

    idea --> researching : Link active Research Dossier
    researching --> draft : Research Dossier certified as 'completed'
    
    draft --> technical_review : Author completes formulation & automated checks pass
    
    state "Evaluation & Review Stage (Proposed Gates: Tech>=80, Edit>=90)" as ReviewStage {
        technical_review --> needs_revision : Technical issues / safety violations flagged
        technical_review --> editorial_review : Tech Review passed (Score >= 80)
        editorial_review --> needs_revision : Style, language, or cultural nuance rejected
    }

    needs_revision --> draft : Author applies revisions
    
    editorial_review --> human_approved : Human Approver verifies reviews & seals SHA-256 hash
    
    human_approved --> published : Publishing transaction initiates & outbox events enqueued
    
    published --> human_approved : All active channels withdrawn (Content remains approved)
    published --> published : Channel updated or republished
    
    human_approved --> archived : Human Approver permanently retires version
    published --> archived : Human Approver permanently retires version (auto-withdraws channels)
    
    archived --> [*] : Read-only permanent historical retention
```

### 5.2 Structured Textual Specification

- **Canonical Statuses (Standards Pack v1.0.0 — Exactly 9):**
  1. `idea`: Conceptual formulation. Entry: Concept title defined. Exit: Linked to research dossier.
  2. `researching`: Culinary ethnography in progress. Entry: Dossier assigned. Exit: Dossier status is `completed`.
  3. `draft`: Authoring recipe structure, quantities, techniques. Entry: Completed dossier attached. Exit: Formulation complete, automated linting passes.
  4. `technical_review`: Culinary science & reproducibility verification. Entry: Formulation complete. Exit: Technical score $\ge$ 80 (or explicit justification override).
  5. `editorial_review`: Cultural grounding, sensory language, narrative check. Entry: Technical review passed. Exit: Editorial score $\ge$ 90 (or explicit justification override).
  6. `needs_revision`: Feedback remediation loop. Entry: Reviewer rejects formulation. Exit: Author amends content in draft.
  7. `human_approved`: Final culinary certification. Entry: Reviews passed, parent locked `FOR UPDATE`, content hash verified, `ApprovalRecord` signed. **Content FROZEN**.
  8. `published`: Live on one or more external channels. Entry: Publishing transaction commits, outbox event enqueued. **Content FROZEN**.
  9. `archived`: Permanent retirement from active distribution. Entry: Human Approver explicit decision. **Content FROZEN**.
- **Withdrawal vs Archival Semantics:**
  - *Withdrawal:* Operates on `Publication` records per channel. Setting `Publication.status = 'withdrawn'` unpublishes from that specific channel. If 0 channels remain active, `RecipeVersion.status` reverts to `human_approved`.
  - *Archival:* Operates on `RecipeVersion`. Setting `RecipeVersion.status = 'archived'` is a permanent editorial decision that automatically withdraws all active channel publications.
- **Quality Gates:**
  - Composite thresholds of 80 (Technical) and 90 (Editorial) are **PROPOSED operational calibration thresholds**. The Human Approver retains authority to override thresholds if cultural context justifies it, documenting rationale in `ApprovalRecord`.

---

## 6. Specification 5: Research-to-Publication Sequence

### 6.1 Mermaid Diagram Code

```mermaid
sequenceDiagram
    autonumber
    actor Res as Field Researcher
    actor Auth as Culinary Author
    actor Rev as Culinary Reviewer
    actor App as Human Approver
    participant Web as Web Interface / API
    participant EditMod as Editorial Module
    participant QualMod as Quality Engine
    participant DB as PostgreSQL (ACID & Triggers)
    participant PubMod as Publishing Module
    participant Worker as Outbox Worker Pool
    participant Ext as External Channels (Web/Mobile/API)

    %% Stage 1: Research Grounding
    Note over Res,DB: Stage 1: Research Dossier Grounding
    Res->>Web: Submit Field Research Dossier
    Web->>DB: INSERT research_dossier (status: 'completed')
    DB-->>Web: Dossier Created & Certified

    %% Stage 2: Recipe Formulation
    Note over Auth,DB: Stage 2: Recipe Formulation & Drafting
    Auth->>Web: Create Recipe Draft citing Dossier
    Web->>DB: INSERT recipe_versions (status: 'draft')
    Auth->>Web: Add Ingredients, Steps & Cultural Context
    Note right of DB: SELECT parent FOR SHARE<br/>INSERT child records
    Web->>DB: INSERT recipe_ingredients, recipe_steps, step_refs
    Auth->>Web: Submit for Review
    Web->>DB: UPDATE recipe_versions SET status = 'technical_review'

    %% Stage 3: Two-Phase Quality Evaluation
    Note over Rev,DB: Stage 3: Two-Phase Quality Evaluation
    Rev->>Web: Evaluate Technical Reproducibility
    Web->>QualMod: Calculate Technical Score (Dimensions 1-3)
    QualMod-->>Web: Score >= 80 (Pass)
    Web->>DB: INSERT quality_evaluations (technical: pass)
    Web->>DB: UPDATE recipe_versions SET status = 'editorial_review'
    Rev->>Web: Evaluate Cultural Integrity & Sensory Language
    Web->>QualMod: Calculate Editorial Score (Dimensions 4-5)
    QualMod-->>Web: Score >= 90 (Pass)
    Web->>DB: INSERT quality_evaluations (editorial: pass)

    %% Stage 4: Human Approval Transaction
    Note over App,DB: Stage 4: ACID Approval & Immutability Seal
    App->>Web: Authorize Publication (Sign Approval)
    Web->>EditMod: executeApprovalTransaction(version_id)
    critical PostgreSQL ACID Approval Transaction
        EditMod->>DB: SELECT id FROM recipe_versions WHERE id = $1 FOR UPDATE
        EditMod->>EditMod: Compute Canonical SHA-256 Hash(parent + sorted children)
        EditMod->>EditMod: Verify computed hash == review evaluated hash
        EditMod->>DB: INSERT INTO approval_records (content_hash, approver_id)
        EditMod->>DB: UPDATE recipe_versions SET status = 'human_approved'
        Note right of DB: BEFORE INSERT/UPDATE/DELETE triggers activate:<br/>All subsequent mutations on parent & children rejected!
    end
    DB-->>Web: Approval Sealed & Content Frozen

    %% Stage 5: Publishing Transaction & Transactional Outbox
    Note over App,Worker: Stage 5: Publication Initiation & Outbox Enqueue
    App->>Web: Dispatch to Channels (Web, Mobile, Newsletter)
    Web->>PubMod: publishToChannels(version_id, channels)
    critical PostgreSQL Publishing & Outbox Transaction
        PubMod->>DB: UPDATE recipe_versions SET status = 'published'
        PubMod->>DB: INSERT INTO publications (channel, status: 'scheduled')
        PubMod->>DB: INSERT INTO outbox_events (event: 'RecipePublished', status: 'CREATED')
    end
    DB-->>Web: Publication Scheduled

    %% Stage 6: Asynchronous Outbox Distribution Loop
    Note over Worker,Ext: Stage 6: Asynchronous Outbox Distribution & Idempotency
    loop Outbox Worker Polling Cycle (Every 5 seconds)
        Worker->>DB: SELECT * FROM outbox_events WHERE status = 'CREATED' FOR UPDATE SKIP LOCKED
        DB-->>Worker: Claim batch & UPDATE status = 'CLAIMED', leased_at = NOW()
        Worker->>Worker: Generate Durable Idempotency Key: hash(type:pub_id:pub_rev)
        Worker->>Ext: POST /v1/publications (Payload + Idempotency-Key)
        alt Channel Acknowledges (HTTP 200/201)
            Ext-->>Worker: OK (Received & Rendered)
            Worker->>DB: UPDATE outbox_events SET status = 'SUCCEEDED'
            Worker->>DB: UPDATE publications SET status = 'published'
        else Transient Failure / 5xx Network Error
            Ext-->>Worker: Error / Timeout
            Worker->>DB: UPDATE outbox_events SET status = 'FAILED_RETRYABLE', retry_count += 1
            Worker->>DB: Schedule exponential backoff -> 'RETRY_SCHEDULED'
            Note over Worker,DB: If retry_count >= 5 -> Transition to 'DEAD_LETTER'
        end
    end
```

### 6.2 Structured Textual Specification

- **Transaction 1: Review & Quality Recording (ACID):**
  - Reviewer inputs quality ratings across the 5 dimensions.
  - Quality Engine computes composite scores.
  - Results saved to `quality_evaluations`; status updated to `editorial_review`.
- **Transaction 2: Human Approval & Cryptographic Sealing (ACID):**
  - Acquires exclusive row lock `SELECT id FROM recipe_versions WHERE id = $1 FOR UPDATE`.
  - Computes deterministic canonical SHA-256 hash (`v1:sha256:...`) over parent fields and sorted child records.
  - Verifies computed hash against the evaluated review hash.
  - Inserts row into `approval_records` with verified `content_hash`.
  - Sets `RecipeVersion.status = 'human_approved'`.
  - Database `BEFORE INSERT OR UPDATE OR DELETE` triggers permanently block subsequent mutations on parent or children.
- **Transaction 3: Publishing Initiation (ACID):**
  - Inserts channel records into `publications`.
  - Sets `RecipeVersion.status = 'published'`.
  - Inserts dispatch records into `outbox_events` with status `CREATED`.
  - Local transaction commits before any external network communication occurs.
- **Asynchronous Distribution (Outbox Worker Pool):**
  - Workers poll `outbox_events` using `FOR UPDATE SKIP LOCKED`, generating a unique `lease_token` per claim and transitioning events to `CLAIMED`.
  - *Lease Duration Policy:* Remains an **open Owner decision** under evaluation between 120s and 300s.
  - *Lease Fencing:* Worker completion verifies `id`, `CLAIMED` status, and matching `lease_token` before updating to `SUCCEEDED`.
  - Dispatches payloads with durable idempotency key: `hash(event_type + ":" + publication_id + ":" + publication_revision)`.
  - Channels record key in `consumer_idempotency_records` to deduplicate incoming requests; downstream side-effects must be naturally idempotent.
  - Successful response sets status to `SUCCEEDED`; transient failures retry up to 5 times before transitioning to `DEAD_LETTER`.
