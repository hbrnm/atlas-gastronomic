# ATLAS GASTRONOMIC — PHASE 008.1
## Editorial Design Audit: European Culinary Journal

**Authority:** Product Owner  
**Phase:** 008.1 — Editorial Art Direction Preparation & Design Audit  
**Official Art Direction:** European Culinary Journal  
**Execution Mode:** Audit + Preparation Only (*Implementation Authorization: NOT GRANTED*)  
**Repository Working Tree:** `chore/integrate-agent-skills` (`ac03b69`)  
**Date:** 2026-10-14  

---

### 1. Executive Summary & Context

Phase 008.1 is an audit and preparation phase authorized by the Product Owner following the establishment of the official art direction: **European Culinary Journal**.

#### Core Visual Philosophy
Atlas Gastronomic is conceived as a **premium European gastronomic publication translated into a sophisticated digital product**. It must embody the aesthetic, tactile dignity, and intellectual depth of an independent culinary journal (such as *Fool Magazine*, *The Gourmand*, or *Phaidon* monographs) or a master cookbook, distinctly avoiding:
- Generic AI SaaS application aesthetics.
- Administrative dashboard layouts, metric cards, and dense status tables.
- Repetitive rounded cards, heavy box-shadows, and glassmorphism.
- Excessive decorative badges, pills, and gratuitous icon sets.
- Artificial gradients and stock-photo visual clichés.
- Over-engineered multi-font pairings.

This audit evaluates the current visual architecture of Atlas Gastronomic, establishes technical invariants and constraints, identifies areas requiring architectural and visual restructuring, and prepares the codebase for a seamless, zero-regression implementation once the dedicated **Design Concept V1** mockups are approved.

---

### 2. Current Visual Architecture Inspection

The current interface (implemented across Phases 004–008) is comprised of the following key surfaces:

#### A. Header & Navigation (`src/client/components/Header.tsx`)
- **Current State:** Implements a publication masthead with a top edition bar (*„REVISTĂ & COMPENDIU CULINAR DE PRECIZIE • VOL. I • TOAMNĂ 2026”*), a gold-embossed monogram seal `AG`, and a mode toggle between *Catalog/Carte* and *Spațiu Editorial*.
- **Strengths:** Strong editorial tone in copywriting; responsive navigation links; clean separation of reader and editorial roles.
- **Shortcomings & Technical Debt:** Mode switcher button still uses generic pill styling (`.btn-secondary`, `.btn-primary`); typography in navigation is hardcoded in pixels; layout relies on simple flex wrapping rather than a formal editorial grid.

#### B. Recipe Catalog / Homepage (`src/client/components/RecipeList.tsx`)
- **Current State:** Divided into an asymmetric Hero Editorial Spread for the featured dish (*Tagliatelle al Ragù*) and a secondary 3-column card grid (`.recipe-grid`).
- **Strengths:** Hero spread successfully breaks SaaS grid monotony with a prominent culinary photograph, tradition kicker, and chef pullquote. Search bar provides real-time filtering without page reloads.
- **Shortcomings & Technical Debt:**
  - The secondary catalog grid (`.recipe-card`) still resembles a card collection with uniform image aspect boxes (`height: 210px`).
  - Contains excessive metadata badges (`.card-tradition-badge`, `.card-category`, status pills).
  - Search and filter bar uses standard form selects that feel somewhat utilitarian.
  - Image scaling in `.card-image-box` forces a 210px height crop on diverse image aspect ratios.

#### C. Recipe Detail View (`src/client/components/RecipeDetail.tsx`)
- **Current State:** Two-column open cookbook spread. Hero photograph with archival footer caption; 4-item horizontal metadata strip; sticky left column containing serving stepper and interactive ingredient checklist; right column containing numbered procedural steps, ingredient allocation tags, sensory completion cues, core thermal constraints, typed risks, and sommelier pairing notes.
- **Strengths:** Excellent functional density; interactive serving scaler with linear dynamic recalculation; rich culinary metadata (terroir, thermal targets, risk taxonomy); high legibility in step execution.
- **Shortcomings & Technical Debt:**
  - The component is 465 lines long with presentation, calculation, and state logic combined in a single file.
  - Heavy reliance on inline `style={{ ... }}` objects alongside CSS class names.
  - Metadata strip uses boxed counters (`.meta-block`) that resemble analytics widgets rather than editorial folio margins.
  - Risk taxonomy badges (`.badge-risk-*`) have bright alert styling that clashes with a restrained editorial publication palette.

#### D. Cook Mode Kitchen View (`src/client/components/CookMode.tsx`)
- **Current State:** Full-screen dark theme interface (`#161514`) styled as a cast-iron and slate kitchen counter instrument. Displays current step, active timer countdown with start/pause/reset, sensory completion cue, and step navigation.
- **Strengths:** Purpose-built for kitchen operating conditions (heat, steam, distance); state persisted to `localStorage` and hash routing across accidental reloads.
- **Shortcomings & Technical Debt:**
  - Visual styling is currently isolated from the broader editorial typography system.
  - Uses fixed pixel sizes for countdown numerals rather than fluid viewport-relative typography.
  - Transitions between steps are abrupt.

#### E. Editorial Workspace & Recipe Editor (`src/client/components/RecipeEditor.tsx` & subcomponents)
- **Current State:** Multi-tab editing desk (`Context & Metadate`, `Ingrediente`, `Pași de Preparare`, `Validare & Previzualizare`).
- **Strengths:** Real-time deterministic validation panel (`ValidationPanel.tsx`); complete access to all Recipe Core V2 attributes.
- **Shortcomings & Technical Debt:**
  - Input styling is utilitarian with form-control borders and gray backgrounds.
  - Needs clearer typographic alignment with the publication design system while preserving editing ergonomic efficiency.

#### F. Access Gatekeeper / Lock Screen (`src/client/App.tsx`)
- **Current State:** Centered card with gold double-border framing and passkey input.
- **Strengths:** Clear, fail-closed security posture.
- **Shortcomings & Technical Debt:** Still laid out as a centered modal box rather than an elegant book-cloth bookplate or archival title page.

---

### 3. Evaluation Against the European Culinary Journal Criteria

| Criterion | Current Implementation | Identified Limitation | Recommended Future Direction | Risk Level |
| :--- | :--- | :--- | :--- | :--- |
| **1. Publication Identity** | Masthead with edition bar and monogram seal. | Secondary views fall back to standard web app conventions (pills, cards, selects). | Unify the entire product under a singular publication hierarchy (folios, margins, section kickers, archival stamps). | Medium |
| **2. Typographic Hierarchy** | Cormorant Garamond, Lora, Cinzel, Plus Jakarta Sans. | Styles split between inline JSX and CSS; inconsistent font-size stepping; lack of baseline rhythm. | Centralize typographic scale in token system; establish clear rules for titles, pullquotes, running text, and numerals. | Low |
| **3. Asymmetric Composition** | Hero spread is asymmetric (60/40 text-to-image). | Catalog grid remains a symmetrical 3-column box grid. | Introduce varied catalog rhythms (featured spreads, list-based editorial indexes, side-by-side vignettes). | Medium |
| **4. Photography-Led Layouts** | Large hero images on Tagliatelle and Detail views. | Images are forced into fixed-height containers (`height: 210px` in cards, `480px` in hero), clipping non-4:3 assets. | Implement responsive aspect-ratio wrappers and focal-point alignment to support varied authentic photography. | Medium |
| **5. Generous Whitespace** | Margins are 2rem on desktop, 1rem on mobile. | Margins are occasionally cramped around cards; density is high in metadata blocks. | Increase breathing room around typography and photography; treat white space as an active editorial element. | Low |
| **6. Restrained Color System** | Parchment (`#faf7f2`), Charcoal (`#1a1815`), Olive (`#3f5135`), Gold (`#b38e44`). | Lingering status colors (green/yellow/red) in risk badges and validation pills disrupt palette restraint. | Reconcile alerts and status markers into muted, publication-appropriate tonal treatments (e.g. sepia, ochre, umber). | Low |
| **7. Reading Experience** | Two-column cookbook layout with sticky ingredients list. | Paragraph widths in steps sometimes stretch too wide on ultrawide viewports (>1400px). | Enforce optimal reading measure (65–75 characters per line) and comfortable line-height (1.65–1.75) for instructions. | Low |
| **8. Responsive Integrity** | Mobile layout stacks vertically at 375px/390px (0 overflow). | Mobile layout collapses into a standard single column, losing some editorial typographic distinction. | Preserve publication feel on mobile through distinctive running headers, refined borders, and touch-adapted steppers. | Low |

---

### 4. Technical Constraints & Invariants

Any future implementation of the European Culinary Journal redesign must adhere to the following strict technical constraints:

1. **Automated Test Selector Dependencies:**
   Automated browser acceptance suites (`tests/browser-acceptance.test.ts`, `tests/canonical-product-acceptance.test.ts`, `tests/user-cook-mode-acceptance.test.ts`) assert specific DOM elements and class hooks:
   - Catalog: `.recipe-card`, `.recipe-grid`, `h1` containing `Catalog Editorial de Rețete`.
   - Recipe Detail: `.detail-title`, `.btn-start-cook`, `.recipe-detail-container`.
   - Scaler: `.serving-scaler-value`, `.btn-scaler-plus`, `.btn-scaler-minus`.
   - Checklist: `.ingredient-checkbox`.
   - Navigation: Button with exact text `Bibliotecă`.
   - Cook Mode: `.cook-mode-container`, timer controls, exit button.
   - Editor: `.editor-tabs`, `.tab-btn`.
   *Rule:* All existing selectors, attributes, and input roles must be retained in the DOM structure, even if new styling classes are applied.

2. **Recipe Core Schema & Contract Immutability:**
   The domain models in `src/shared/types.ts`, `src/shared/validation.ts`, and the versioned baseline `standards/v1.0.0/` are strictly frozen. The frontend must only adapt its presentation layer and never attempt to alter database schemas or recipe data models.

3. **Authentication & Private Access Gate:**
   The timing-safe private authentication mechanism (`ATLAS_ACCESS_KEY` / `ATLAS_EDITORIAL_KEY`) must remain fully intact. The redesign may only style the gatekeeper surface.

4. **Cook Mode State & Session Persistence:**
   The active cooking session must continue to synchronize with `localStorage` (`atlas_active_session`) and URL hash routing (`#/cook/:id`), ensuring recovery across browser reloads.

---

### 5. Recommended Architecture Restructuring

To prepare for the Design Concept V1 implementation without unnecessary rewrites:

1. **Extract Inline Styles to Design Tokens:**
   Audit and eliminate the ~40 inline `style={{ ... }}` blocks in `RecipeDetail.tsx` and `RecipePreview.tsx`, replacing them with semantic CSS classes backed by design tokens.
2. **Decompose `RecipeDetail.tsx` into Deep Focused Subcomponents:**
   - `CookbookHero.tsx` (photography, archival captions, heritage tags, title, pullquote).
   - `CookbookMetadataStrip.tsx` (servings, active/total time, difficulty).
   - `CookbookPrepDesk.tsx` (serving stepper, scaled quantities, interactive checklist).
   - `CookbookMethod.tsx` (procedural steps, thermal constraints, sensory cues, risk taxonomy).
   - `CookbookSommelier.tsx` (terroir notes, wine pairing suggestions).
3. **Refactor Image Containers for Fluid Aspect Ratios:**
   Implement CSS `aspect-ratio` containers (`aspect-ratio: 4/3`, `aspect-ratio: 3/2`, `aspect-ratio: 1/1`) with `object-fit: cover` and focal-point controls to properly frame varied photography formats without distorting or awkwardly cropping authentic images.
4. **Isolate Cook Mode Design Tokens:**
   Formalize the dark kitchen instrument palette (`--kitchen-counter-bg`, `--kitchen-timer-ink`, `--kitchen-accent`) as a dedicated sub-theme within `styles.css`.
