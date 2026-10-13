# ATLAS GASTRONOMIC — MODULE CONTRACTS & INTERFACES

**Document:** Contractele Publice, Comenzile și Evenimentele Modulelor  
**Etapă:** PHASE 2.1 — Architecture Reconciliation  
**Guvernanță:** Atlas AOS  
**Data:** 2026-10-13  
**Statut:** Propunere Arhitecturală Formală  

---

## 1. Modulul 1: Gastronomic Knowledge Base

* **Entități Deținute:** `Dish`, `Ingredient`, `IngredientAlias`, `Cuisine`, `Region`, `Technique`, `Equipment`.
* **Comenzi Permise:**
  - `createDish(input: CreateDishInput)` $\rightarrow$ Rol: `Admin`, `Curator`.
  - `registerIngredient(input: RegisterIngredientInput)` $\rightarrow$ Rol: `Admin`, `Curator`.
  - `updateIngredientTaxonomy(input: UpdateTaxonomyInput)` $\rightarrow$ Rol: `Admin`.
* **Query-uri Permise:**
  - `getDishById(id: string)` / `getDishBySlug(slug: string)` $\rightarrow$ Public.
  - `listIngredients(filter: IngredientFilter)` $\rightarrow$ Public / Studio.
  - `resolveIngredientAliases(query: string)` $\rightarrow$ Studio.
* **Evenimente Emise:** `DishCreated`, `IngredientRegistered`, `TaxonomyUpdated`.
* **Operațiuni Interzise:** Nu poate modifica direct rețete, dosare de cercetare sau publicații.

---

## 2. Modulul 2: Research Studio

* **Entități Deținute:** `Source`, `Evidence`, `Claim`, `EvidenceClaim`, `ResearchDossier`, `ResearchDossierVersion`, `DossierClaim`.
* **Comenzi Permise:**
  - `createResearchDossier(dishId: string, title: string)` $\rightarrow$ Rol: `Researcher`, `AI_AGENT`.
  - `registerSource(input: SourceInput)` $\rightarrow$ Rol: `Researcher`, `AI_AGENT`.
  - `extractEvidence(sourceId: string, input: EvidenceInput)` $\rightarrow$ Rol: `Researcher`, `AI_AGENT`.
  - `formulateClaim(input: ClaimInput)` $\rightarrow$ Rol: `Researcher`, `AI_AGENT`.
  - `submitDossierToReview(dossierId: string)` $\rightarrow$ Rol: `Researcher`.
  - `approveResearchDossier(dossierId: string, evaluation: DossierApprovalInput)` $\rightarrow$ Rol: `Approver`, `SeniorResearcher` (**Uman Exclusiv**).
* **Query-uri Permise:**
  - `getDossierVersion(id: string)` $\rightarrow$ Studio.
  - `listClaimsByDish(dishId: string)` $\rightarrow$ Studio.
  - `getEvidenceChainForClaim(claimId: string)` $\rightarrow$ Studio.
* **Evenimente Emise:** `ResearchDossierCreated`, `DossierApproved`, `DossierVersionSuperseded`.
* **Dependențe:** Modulul 1 (Knowledge Base).

---

## 3. Modulul 3: Recipe Development Studio

* **Entități Deținute:** `Recipe`, `RecipeVersion`, `RecipeIngredient`, `RecipeStep`, `StepIngredientRef`.
* **Comenzi Permise:**
  - `createRecipeDraft(dishId: string, dossierVersionId: string, title: string)` $\rightarrow$ Rol: `RecipeAuthor`, `AI_AGENT`.
  - `addRecipeIngredient(versionId: string, input: RecipeIngredientInput)` $\rightarrow$ Rol: `RecipeAuthor`, `AI_AGENT`.
  - `addRecipeStep(versionId: string, input: RecipeStepInput)` $\rightarrow$ Rol: `RecipeAuthor`, `AI_AGENT`.
  - `linkStepIngredient(versionId: string, stepId: string, ingredientId: string)` $\rightarrow$ Rol: `RecipeAuthor`.
  - `submitToTechnicalReview(versionId: string)` $\rightarrow$ Rol: `RecipeAuthor`.
* **Query-uri Permise:**
  - `getRecipeVersion(versionId: string)` $\rightarrow$ Studio.
  - `validateRecipeSemanticIntegrity(versionId: string)` $\rightarrow$ Studio.
* **Evenimente Emise:** `RecipeDraftCreated`, `RecipeSubmittedToReview`, `RecipeVersionContentLocked`.
* **Garanție Relațională:** Nu permite adăugarea sau modificarea ingredientelor și pașilor dacă versiunea este marcată `human_approved` sau `published`.

---

## 4. Modulul 4: Editorial & QA Studio

* **Entități Deținute:** `ReviewRecord`, `QualityGateResult`, `ReviewRubric`.
* **Comenzi Permise:**
  - `executeTechnicalReview(versionId: string, scores: TechnicalReviewInput)` $\rightarrow$ Rol: `CulinaryReviewer` (**Uman Exclusiv**).
  - `executeEditorialReview(versionId: string, scores: EditorialReviewInput)` $\rightarrow$ Rol: `EditorialReviewer` (**Uman Exclusiv**).
  - `rejectWithRevisionNotes(versionId: string, notes: string)` $\rightarrow$ Rol: `Reviewer`.
* **Query-uri Permise:**
  - `getReviewHistoryByVersion(versionId: string)` $\rightarrow$ Studio.
  - `getQualityGateStatus(versionId: string)` $\rightarrow$ Studio.
* **Evenimente Emise:** `TechnicalReviewPassed`, `TechnicalReviewFailed`, `EditorialReviewPassed`, `RevisionRequested`.
* **Dependențe:** Modulul 3 (Recipe Development Studio).

---

## 5. Modulul 5: Publication Management

* **Entități Deținute:** `ApprovalRecord`, `Publication`, `PublicationSnapshot`.
* **Comenzi Permise:**
  - `approveRecipeVersion(versionId: string)` $\rightarrow$ Rol: `Approver` (**Uman Exclusiv**; AI primește 403).
  - `publishToChannel(versionId: string, channel: string)` $\rightarrow$ Rol: `Approver` (**Uman Exclusiv**).
  - `withdrawFromChannel(publicationId: string, reason: string)` $\rightarrow$ Rol: `Approver`, `Admin` (Takedown tehnic).
  - `archiveRecipeVersion(versionId: string)` $\rightarrow$ Rol: `Approver` (**Uman Exclusiv**).
* **Query-uri Permise:**
  - `getActivePublicationSnapshot(channel: string, slug: string)` $\rightarrow$ Public / Consumer Experience.
  - `getApprovalRecordByVersion(versionId: string)` $\rightarrow$ Studio.
* **Evenimente Emise:** `RecipeApproved`, `RecipePublished`, `PublicationWithdrawn`, `RecipeArchived`.
* **Evenimente Consumate:** `EditorialReviewPassed`.

---

## 6. Modulul 6: Consumer Experience

* **Entități Deținute:** `SearchIndexCache`, `StaticPageMetadata`.
* **Comenzi Permise:**
  - `warmPublicPageCache(slug: string)` $\rightarrow$ Sistem / Outbox Worker.
  - `reindexPublicSearch()` $\rightarrow$ Admin / Worker.
* **Query-uri Permise:**
  - `getPublishedRecipePage(slug: string)` $\rightarrow$ Public Reader.
  - `searchPublishedRecipes(query: SearchQueryInput)` $\rightarrow$ Public Reader.
* **Interdicție Absolută:** Nu interoghează direct tabelele din `recipe_versions` sau `research_dossiers`. Toate datele provin din `PublicationSnapshot`.

---

## 7. Modulul 7: Governance & Audit Trail

* **Entități Deținute:** `AuditEvent`, `OutboxEvent`.
* **Comenzi Permise:**
  - `logAuditEvent(event: AuditEventInput)` $\rightarrow$ Sistem (Internal).
  - `enqueueOutbox(event: OutboxInput)` $\rightarrow$ Sistem (Internal).
  - `claimPendingOutbox(workerId: string, batchSize: number)` $\rightarrow$ Outbox Worker.
  - `markOutboxSuccess(eventId: string)` $\rightarrow$ Outbox Worker.
  - `markOutboxFailure(eventId: string, error: string)` $\rightarrow$ Outbox Worker.
* **Query-uri Permise:**
  - `queryAuditLog(filter: AuditFilterInput)` $\rightarrow$ Admin, Compliance.
* **Garanție de Sistem:** Tabela `audit_events` este append-only prin permisiuni PostgreSQL (`REVOKE UPDATE, DELETE ON audit_events`).
