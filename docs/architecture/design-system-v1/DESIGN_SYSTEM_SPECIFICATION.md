# ATLAS GASTRONOMIC — DESIGN SYSTEM V1 SPECIFICATION

**Authority:** Product Owner  
**Phase:** 008.2 — Implementation Readiness  
**Design Reference:** Approved Design Concept V1  
**Official Art Direction:** European Culinary Journal  
**Execution Mode:** Repository Inspection + Design System Integration Planning  
**Implementation Authorization:** PENDING (Documentation & Planning ONLY)  
**Document Status:** Complete  

---

## 1. System Vision & Aesthetic Philosophy

Atlas Gastronomic is a digital gastronomic compendium combining the authority of a canonical European culinary journal with the practical elegance of a master cookbook.

### Core Philosophy
* **Literary & Culinary Gravitas:** The interface must evoke fine editorial print—warm paper stock, deep ink typography, deliberate margins, and authentic food art direction.
* **Functional Kitchen Precision:** Cooking is an exacting craft. The visual design must serve clarity, chronological step discipline, unit precision, thermal cues, and risk visibility without visual clutter.
* **Deliberate Rejection of SaaS Tropes:** 
  - Strictly **NO** generic dashboard metrics, neon badges, plastic pill tags, glassmorphism, or repetitive rectangular card grids.
  - Strictly **NO** generic AI-generated templates or distracting animations.
  - Restrained borders, quiet hairline rules, generous whitespace, and asymmetric balance.

---

## 2. Design System Architecture

Design System V1 adopts a strict three-tier token hierarchy to ensure clean decoupling, maintainability, and zero runtime performance overhead:

```
[Tier 1: Primitives] ──► [Tier 2: Semantic Editorial] ──► [Tier 3: Component Tokens]
  #F8F7F2 (Canvas)          --bg-canvas                      .hero-editorial-spread
  #1E1E1E (Charcoal)        --text-ink                       .cookbook-title
  #4A5A3A (Olive)           --color-accent-primary           .cook-mode-workspace
  #D4AF37 (Gold)            --color-accent-highlight
```

1. **Primitives:** Foundational raw hex values, font stacks, and scale units.
2. **Semantic Editorial Tokens:** Functional mappings defining roles in daylight reading and dark kitchen environments.
3. **Component Scoped Variables:** Exact contextual rules applied to the three core application experiences.

---

## 3. The Three Core Editorial Experiences

### A. Homepage / Editorial Catalog (Discovery & Provenance)
* **Authoritative Journal Masthead:**
  - Centered brandmark (`ATLAS GASTRONOMIC`) set in **Playfair Display**.
  - Edition ribbon: Volume number, seasonal issue, and culinary capital datelines (Bologna · Milano · Dijon · Paris · București).
  - Quiet secondary navigation with text-first labels (`Bibliotecă`, `Redacție`).
* **Lead Feature Story Spread:**
  - High-impact asymmetric hero vignette presenting the canonical dish of the edition.
  - Large photographic plate in natural daylight with editorial caption and archive attribution.
  - Literary pull-quote from regional gastronomy or canonical archives.
  - Clear dual calls to action: primary `"Gătește în Cook Mode"` and secondary `"Citește Rețeta"`.
* **Asymmetric Editorial Catalog Grid & Featured Collection:**
  - Move away from uniform e-commerce cards.
  - Secondary recipes presented in balanced 2-column or alternating editorial vignettes with typographic kickers, heritage traditions, and yield metadata separated by typography (middots `·`), not plastic pills.
  - Retain DOM invariant selectors: `.recipe-grid`, `.recipe-card`, and `h1` `"Catalog Editorial de Rețete"`.
* **Curated Culinary Collections:**
  - Thematic and regional editorial groupings:
    - *Tradiția Nord-Italiană:* Tagliatelle al Ragù alla Bolognese (Emilia-Romagna) & Risotto alla Milanese (Lombardia).
    - *Clasicii Bucătăriei Franceze:* Boeuf Bourguignon (Burgundia) & Soufflé Chaud au Fromage (Paris).
    - *Patrimoniu Gastronomic Est-European:* Sarmale Tradiționale cu Varză Murată (România).
  - Editorial collection dividers with quiet typographic provenance ribbons.

### B. Recipe Detail (The Master Cookbook Feature)
* **Editorial Article Masthead:**
  - Canonical recipe title in **Playfair Display** (DOM selector `.detail-title`).
  - Region & tradition compass tag (e.g. *Emilia-Romagna · Tradiție Canonică 1982*).
  - Literary preamble articulating the dish's culinary identity, technique rationale, and historical context.
* **Cookbook Photography Spread:**
  - High-resolution hero photograph with disciplined aspect ratio (`16:10` desktop, `4:3` mobile) to prevent Cumulative Layout Shift (CLS).
  - Editorial caption identifying culinary styling and archival provenance.
* **Technical Metadata Ribbon:**
  - Clean typographic presentation of yield, active prep minutes, total cooking time, and technical difficulty.
* **Interactive Mise-en-Place & Scaler (Left Column / Aside):**
  - Interactive serving scaler with stepper controls (preserving `.btn-scaler-minus`, `.btn-scaler-plus`, `.serving-scaler-value`).
  - Structured ingredient groups (e.g. *Compoziție Sarmale*, *Lichid de Fierbere*, *Servire*) with checkboxes for kitchen prep (`.ingredient-checkbox`).
* **Procedural Instructions & Critical Control Points (Right Column / Main):**
  - Numbered steps featuring elegant numeral drop-caps.
  - Sensory indicators (observable cues: sizzle, aroma, translucency) highlighted in body typography.
  - Dedicated callout boxes for **Atenție Culinară**, **Risc Ireversibil**, **Siguranță Alimentară**, and **Punct Critic HACCP**.
  - Provenance & historical bibliography block citing canonical sources.

### C. Cook Mode (The Kitchen Night Environment)
* **Dedicated Charcoal Workspace:**
  - Deep charcoal canvas (`#1E1E1E`) creating an immersive, low-glare visual environment optimized for kitchen counter stands, tablets, and smartphones.
  - Warm ivory typography (`#F8F7F2`) guaranteeing a contrast ratio of **15.8:1** (exceeding WCAG AAA).
* **Focused Single-Step Workflow:**
  - Distraction-free active step display with prominent instructional text.
  - Visual progress indicator showing completed vs remaining steps.
  - Integrated digital countdown timer with audio chime completion cue.
* **Contextual Ingredients Drawer:**
  - Dynamic display of ingredients strictly allocated to the active step, complete with scaled quantities matching active servings.
* **Safety & State Persistence:**
  - Strict preservation of `localStorage` session state (`atlas_active_session` and `atlas_cook_progress_<id>`).
  - Deep-link hash routing preservation (`#/cook/:id`).

---

## 4. Technical Constraints & Invariants

| Category | Invariant Constraint | Enforcement Method |
| :--- | :--- | :--- |
| **Recipe Core Logic** | No changes to domain models, scaling logic, or validation rules. | Automated test suite (`canonical-recipes-v2.test.ts`, `validation.test.ts`). |
| **Data Schemas** | Frozen `standards/v1.0.0/` schemas and SQLite database tables remain untouched. | Schema validation tests (`v2-validation.test.ts`, `v2-repository.test.ts`). |
| **DOM Contracts** | All historical classnames and roles must persist (`.recipe-card`, `.recipe-grid`, `.detail-title`, etc.). | Browser acceptance tests (`browser-acceptance.test.ts`). |
| **Cook Mode Session** | Persistence in `localStorage` under `atlas_active_session` and URL hash `#/cook/:id`. | User cook mode test (`user-cook-mode-acceptance.test.ts`). |
| **Private Access Gate** | Header `x-atlas-staging-token` and `sessionStorage` token validation untouched. | Staging access test (`api-auth.test.ts`, `live-staging-acceptance.test.ts`). |
| **Image Integrity** | No AI synthetic images presented as authentic; licensing metadata preserved. | Audit log (`EDITORIAL_ASSET_INVENTORY.md`). |

---

## 5. Visual Acceptance Gates

Before any implementation is submitted for Product Owner review:
1. **WCAG AA / AAA Accessibility:** All text combinations must meet minimum contrast thresholds (normal text $\ge 4.5:1$, large text $\ge 3.0:1$).
2. **Zero Layout Shift (CLS = 0):** All images and dynamic widgets must reserve dimensional boxes via CSS `aspect-ratio`.
3. **Cross-Viewport Editorial Integrity:** Pixel-perfect layout at **1440px** desktop and **390px** mobile without broken typography or overlapping containers.
