# ATLAS GASTRONOMIC — PHASE 008.2 IMPLEMENTATION PLAN

**Authority:** Product Owner  
**Phase:** 008.2 — Implementation Readiness  
**Design Reference:** Approved Design Concept V1  
**Official Art Direction:** European Culinary Journal  
**Execution Mode:** Repository Inspection + Design System Integration Planning  
**Implementation Authorization:** PENDING (Documentation & Planning ONLY)  
**Document Status:** Complete  

---

## 1. Executive Summary & Readiness Baseline

This document defines the atomic, zero-regression implementation plan for transforming Atlas Gastronomic into the **European Culinary Journal** design direction using **Design System V1**.

### Current Repository Baseline
* **TypeScript Compilation:** `npm run typecheck` $\rightarrow$ **0 errors (Exit 0)**.
* **Automated Test Suite:** `npm test` $\rightarrow$ **54 passed, 0 failed across 16 test files (Exit 0)**.
* **Git Working Tree:** Clean on branch `chore/integrate-agent-skills` (HEAD `ac03b69`).
* **Live Staging Health:** Fully operational on Railway (`https://atlas-gastronomic-production.up.railway.app`) with private token gating and SQLite volume persistence verified.

---

## 2. File Impact & Component Scope

| File Path | Role | Nature of Modification | Invariant Constraints |
| :--- | :--- | :--- | :--- |
| **`src/client/index.html`** | Font preconnects, stylesheet links, theme color metadata. | **Font Upgrade** | Replace legacy font links with `Playfair Display` and `Inter`. Update theme-color to `#1E1E1E`. Preserve root element `<div id="root"></div>` and `<script type="module" src="/main.tsx"></script>`. |
| **`src/client/styles.css`** | Global tokens, reset, typography, component rules, responsive breakpoints. | **Foundation Restructure** | Inject Design System V1 `:root` tokens. Implement fluid typography clamp rules, 8px spatial scales, and layout utilities. Remove deprecated color rules. |
| **`src/client/components/Header.tsx`** | Global masthead, dateline ribbon, navigation. | **Structural & Visual** | Refactor masthead to European journal layout. Retain navigation buttons (`Bibliotecă`, `Redacție`, `Adaugă Rețetă Nouă`) and brand click handlers. |
| **`src/client/components/RecipeList.tsx`** | Discovery catalog, featured hero spread, recipe grid. | **Structural & Visual** | Refactor featured hero spread into 60/40 asymmetric layout. Remove plastic badge pills from `.recipe-card`. Eliminate inline styles in JSX. **Strictly preserve DOM selectors `.recipe-grid`, `.recipe-card`, and `h1` `"Catalog Editorial de Rețete"`.** |
| **`src/client/components/RecipeDetail.tsx`** | Master cookbook recipe view, serving scaler, ingredients, steps. | **Structural & Visual** | Implement dual-column desktop layout (38% ingredients / 62% steps). Style drop-cap step numbers, culinary notes, and technique alerts. **Strictly preserve `.recipe-detail-container`, `.detail-title`, `.btn-start-cook`, `.serving-scaler-value`, `.btn-scaler-plus`, `.btn-scaler-minus`, `.ingredient-checkbox`.** |
| **`src/client/components/CookMode.tsx`** | Full-screen cooking environment, countdown timer, step navigation. | **Visual-Only Refinement** | Style dedicated dark workspace (`#1E1E1E`), high-contrast typography, and gold timer dials. **Strictly preserve `localStorage` keys `atlas_active_session`, `atlas_cook_progress_<id>`, and URL hash `#/cook/:id`.** |
| **`src/client/App.tsx`** | View routing, session hydration, private access gate. | **Shell Integrity Check** | Ensure semantic container wrapping. No modification of authentication or state machine logic. |

---

## 3. Phased 6-Stage Implementation Sequence

Upon receiving explicit Product Owner authorization to begin implementation, work will proceed strictly through the following six atomic stages:

```
[Stage 1: Tokens & Typography Foundation]
                  │
                  ▼
[Stage 2: Journal Masthead & Navigation]
                  │
                  ▼
[Stage 3: Lead Hero & Editorial Catalog]
                  │
                  ▼
[Stage 4: Master Cookbook Recipe Detail]
                  │
                  ▼
[Stage 5: Dark Kitchen Cook Mode]
                  │
                  ▼
[Stage 6: Automated Test & Screenshot Verification]
```

### Stage 1: Tokens & Typography Foundation
* **Files:** `src/client/index.html`, `src/client/styles.css`.
* **Actions:**
  - Update `index.html` to load `Playfair Display` (400, 600, 700) and `Inter` (400, 500, 600, 700) via Google Fonts.
  - Inject Design System V1 tokens into `:root` in `styles.css`.
  - Declare fluid type scales (`--text-display`, `--text-h1`, `--text-h2`, `--text-body`).
  - Establish base body styling: `background-color: var(--color-canvas-default)`, `color: var(--color-charcoal-800)`.
* **Validation Gate:** `npm run typecheck` passes; no layout shift in existing components.

### Stage 2: Editorial Masthead & Navigation
* **Files:** `src/client/components/Header.tsx`, `src/client/styles.css`.
* **Actions:**
  - Implement top dateline ribbon (`.masthead-edition-bar`) with volume and city datelines.
  - Style centered journal brandmark (`Playfair Display 700`) with refined AG monogram.
  - Restructure navigation buttons to clean text links with minimal Lucide icons.
* **Validation Gate:** Catalog navigation tests pass; button click routes to catalog without errors.

### Stage 3: Lead Hero & Editorial Catalog
* **Files:** `src/client/components/RecipeList.tsx`, `src/client/styles.css`.
* **Actions:**
  - Refactor featured hero into an asymmetric 60/40 spread on desktop.
  - Eliminate plastic badge pills in recipe cards; replace with inline typographic markers (`Inter 600`, separated by middots `·`).
  - Eliminate all hardcoded inline styles in JSX (`style={{ ... }}`) in favor of CSS utility classes.
* **Validation Gate:** `browser-acceptance.test.ts` and `canonical-product-acceptance.test.ts` pass with 100% green.

### Stage 4: Master Cookbook Recipe Detail
* **Files:** `src/client/components/RecipeDetail.tsx`, `src/client/styles.css`.
* **Actions:**
  - Build balanced dual-column layout on desktop (38% ingredients aside, 62% procedural main).
  - Style serving scaler stepper with quiet hairline borders and accessible buttons.
  - Format ingredient checklists by component with subtle strike-through and count feedback.
  - Style numbered steps with Playfair Display numeral badges and refined risk callout boxes.
* **Validation Gate:** Ingredient scaling tests, checklist toggles, and step verification tests pass.

### Stage 5: Dark Kitchen Cook Mode
* **Files:** `src/client/components/CookMode.tsx`, `src/client/styles.css`.
* **Actions:**
  - Apply `--color-dark-canvas` (`#1E1E1E`) and `--color-dark-text-main` (`#F8F7F2`).
  - Render active instructional text in oversized high-contrast typography.
  - Style digital timer with gold highlight (`#D4AF37`) and large touch controls ($\ge 48\text{px}$).
  - Implement bottom sticky navigation controls on mobile with safe-area insets.
* **Validation Gate:** `user-cook-mode-acceptance.test.ts` passes; reload persistence verified.

### Stage 6: Cross-Browser & Visual Acceptance Verification
* **Actions:**
  - Run `npm run typecheck`.
  - Run full test suite: `npm test` (all 54 tests must pass).
  - Generate high-resolution desktop (1440px) and mobile (390px) screenshots using Puppeteer.
  - Audit contrast ratios against WCAG 2.1 AA/AAA.
  - Deliver final visual acceptance report to Product Owner.

---

## 4. Technical Risk Mitigation Matrix

| Risk | Probability | Severity | Mitigation Protocol |
| :--- | :--- | :--- | :--- |
| **Breaking Automated Tests** | Low | High | Pre-commit check of all test selectors (`.recipe-card`, `.recipe-grid`, `h1`, `.detail-title`, `.btn-start-cook`, `.serving-scaler-value`, etc.). Test execution after every stage. |
| **Cumulative Layout Shift (CLS)** | Medium | Medium | CSS `aspect-ratio` defined on all image containers. Font fallback size adjustment. Zero unstabilized dynamic injection. |
| **Cook Mode Session Data Loss** | Low | Critical | Visual changes isolated strictly to CSS classnames. Zero edits to React state logic or `localStorage` serialization. |
| **Mobile Breakage at 390px** | Medium | High | Mobile-first CSS architecture. Continuous automated verification at `390px × 844px`. Touch targets enforced $\ge 44\text{px}$. |

---

## 5. Implementation Authorization Status

* **Status:** **PENDING PRODUCT OWNER AUTHORIZATION**
* **Strict Guardrail:** No code, CSS, tokens, or assets will be modified until explicit approval is granted.
