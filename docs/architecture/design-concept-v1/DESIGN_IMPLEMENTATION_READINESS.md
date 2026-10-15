# ATLAS GASTRONOMIC — DESIGN IMPLEMENTATION READINESS

**Phase:** 008.1 — Editorial Art Direction Preparation & Design Audit  
**Authority:** Product Owner  
**Target Visual Direction:** European Culinary Journal  
**Execution Mode:** Audit & Preparation ONLY (Implementation Authorization: PENDING)  
**Document Status:** Complete  

---

## 1. Executive Summary

This document establishes the technical, architectural, and procedural readiness of Atlas Gastronomic for the upcoming **European Culinary Journal** design implementation. It defines:
1. The **Component Impact Map** (categorizing components into reusable, visual-only, and structurally refactored).
2. The **DOM Invariant & Selector Contract** that must be maintained to prevent regressions in automated test suites (`browser-acceptance.test.ts`, `canonical-product-acceptance.test.ts`, `user-cook-mode-acceptance.test.ts`).
3. The **Technical Architecture & Dependency Plan** (font delivery, CSS token architecture, responsive image handling, state integrity).
4. The **Proposed Phased Implementation Sequence** (6 discrete steps designed for zero-regression execution upon Product Owner authorization).
5. The **Risk Assessment and Mitigation Matrix**.

---

## 2. Component Impact Map

| Component / Layer | Current Role | Modification Category | Architectural Scope & Required Changes |
| :--- | :--- | :--- | :--- |
| **`client/src/App.tsx`** | Top-level routing, view switching (`catalog`, `detail`, `cook`, `editor`), authentication gate, global layout wrapper. | **Visual / Layout Shell** | Ensure editorial wrapper provides semantic landmarks (`<main id="main-content">`, `<header>`, `<footer>`). Preserve view state transitions, hash routing (`#/cook/:id`), and private staging modal integration. No business logic modification. |
| **`client/src/components/Header.tsx`** | Global masthead, title, subtitle, navigation buttons (`Catalog`, `Editor`), search bar. | **Structural & Visual** | Refactor from standard web app bar into an authoritative European journal masthead with centered serif brandmark, date/issue/edition metadata, refined minimal navigation, and debounced search input. Retain button text `Bibliotecă` / `Catalog` and editor tab triggers for test compatibility. |
| **`client/src/components/RecipeList.tsx`** | Catalog presentation, featured hero banner, curated recipe grid, category filters, search results. | **Structural & Visual** | Replace repetitive card grid with asymmetric editorial discovery layout (feature story hero, 2-column editorial vignettes, typographic listing). Eliminate all inline styles in JSX (`style={{ display: 'grid', ... }}`). Retain DOM selectors `.recipe-grid`, `.recipe-card`, and `h1` containing `Catalog Editorial de Rețete`. |
| **`client/src/components/RecipeDetail.tsx`** | Cookbook-style recipe presentation, hero image, metadata block, serving scaler, structured ingredient groups, instructional steps, culinary notes, provenance. | **Structural & Visual** | Transform into a magazine/cookbook feature layout with balanced dual-column or multi-section geometry: generous whitespace, elegant typographic hierarchy, drop-caps or subtle numeral markers, distinct culinary notes callouts. Retain DOM selectors `.recipe-detail-container`, `.detail-title`, `.btn-start-cook`, `.serving-scaler-value`, `.btn-scaler-plus`, `.btn-scaler-minus`, `.ingredient-checkbox`. |
| **`client/src/components/CookMode.tsx`** | Step-by-step full-screen cooking assistant, active timer, checklist, step navigation. | **Visual-Only Refinement** | Maintain current rock-solid focus UX and distraction-free workflow. Refine typography (serif headers, legible sans step instructions), soft parchment/dark-mode palette, and elegant timer dials. Retain `localStorage` state key `atlas_active_session` and URL hash `#/cook/:id`. |
| **`client/src/components/RecipeEditor.tsx`** | Administrative / recipe management and drafting workbench. | **Visual-Only Refinement** | Restyle container and tabs to align with editorial muted palette without altering form controls, JSON schema validation, or persistence endpoints. Preserve `.editor-tabs` and `.tab-btn`. |
| **`client/src/styles.css`** | Global styling, typography rules, color tokens, responsive media queries. | **Major Foundation Overhaul** | Centralize design tokens under `:root` with CSS custom properties. Replace hardcoded hex values and scattered inline rules. Implement fluid typography scale using `clamp()`, consistent spacing tokens, and normalized aspect-ratio utility classes. |

---

## 3. Mandatory DOM Invariant & Test Contract

Atlas Gastronomic has 40+ unit, integration, and browser acceptance tests verifying application functionality. During visual implementation, the following selectors and behavioral contracts **must remain strictly intact**:

### A. Catalog & Navigation Selectors
* `h1`: Must include the exact string `"Catalog Editorial de Rețete"` (or be matched by `getByRole('heading', { name: /Catalog Editorial de Rețete/i })`).
* `.recipe-grid`: Container wrapping all listed recipe elements.
* `.recipe-card`: Container element for individual recipe items.
* Navigation triggers: Button text `"Bibliotecă"` or `"Catalog"` must navigate back to the catalog view.

### B. Recipe Detail Selectors
* `.recipe-detail-container`: Top-level wrapper for recipe detail view.
* `.detail-title`: Heading element rendering the canonical recipe title.
* `.btn-start-cook`: Button initiating step-by-step Cook Mode.
* `.serving-scaler-value`: Element displaying current serving multiplier/count (e.g., `"4 porții"`).
* `.btn-scaler-plus` & `.btn-scaler-minus`: Buttons incrementing/decrementing serving counts.
* `.ingredient-checkbox`: Interactive checkboxes for mise en place tracking.

### C. Cook Mode Selectors & Storage Invariants
* URL Hash: Deep-linking must continue using `#/cook/:id` pattern.
* `localStorage`: Must persist in-progress cooking sessions under key `'atlas_active_session'` with valid JSON containing recipe ID, current step index, and checked ingredients.
* Step navigation buttons: Next, Previous, and Exit Cook Mode buttons must preserve their test IDs and role labels.

### D. Security & Session Auth
* Staging access gate (`atlas_staging_auth_token` in `sessionStorage`) and timing-safe header verification (`x-atlas-staging-token`) must remain untouched.

---

## 4. Technical Architecture & Constraints

### A. CSS Architecture & Token Consolidation
* **Current Issue:** Styles are fragmented between `client/src/styles.css` and dozens of inline `style={{ ... }}` blocks in React JSX.
* **Target Solution:** 
  - Complete elimination of inline visual styles.
  - All colors, fonts, shadows, borders, and margins parameterized in `:root` CSS variables.
  - Zero third-party heavyweight CSS frameworks (e.g. Tailwind or Bootstrap) introduced; keep vanilla modern CSS with nesting and custom properties to guarantee near-instant bundling and zero extra runtime payload.

### B. Typography & Font Loading Strategy
* **Editorial Requirements:**
  - Headings & Titles: High-contrast European editorial serif (e.g., Cormorant Garamond, Newsreader, or Playfair Display).
  - Body & Instructions: Warm, highly readable literary serif or clean grotesque sans-serif (e.g., Source Serif 4, Lora, or Inter / DM Sans).
  - Metadata & Small Caps: Refined geometric/grotesque sans (e.g., Inter, Outfit, or Cabin).
* **Delivery Method:**
  - Self-hosted WOFF2 fonts served from `/fonts/` with `font-display: swap` to prevent FOUT/FOIT and eliminate external dependencies on Google Fonts CDN for production resilience.

### C. Responsive Imagery & Layout Ratios
* **Aspect Ratio Preservation:** All recipe imagery containers must enforce strict CSS `aspect-ratio` (e.g. `16/10` for heroes, `4/3` or `1/1` for catalog vignettes) with `object-fit: cover` to eliminate Cumulative Layout Shift (CLS).
* **Asset Optimization:** Prior to production deployment, heavy assets (`souffle-fromage.jpg` at 2.94 MB) must be downscaled and converted to WebP (`< 150 KB` per hero).

---

## 5. Proposed Phased Implementation Sequence

When implementation authorization is granted by the Product Owner upon delivery of Design Concept V1, execution should proceed in the following 6 atomic stages:

```
[Stage 1: Token & Font Foundation]
              │
              ▼
[Stage 2: Masthead & Global Header]
              │
              ▼
[Stage 3: Catalog & Editorial Discovery]
              │
              ▼
[Stage 4: Recipe Detail & Cookbook Layout]
              │
              ▼
[Stage 5: Cook Mode Refinement]
              │
              ▼
[Stage 6: Test Suite & Cross-Browser Verification]
```

### Stage 1: Design Tokens & Font Foundation
* Establish `@font-face` rules for approved editorial serif and sans-serif pairings.
* Populate `:root` with approved European journal color palette (parchment, charcoal, sage, gold, warm borders).
* Define fluid typographic scale (`--font-display`, `--font-title-lg`, `--font-title-md`, `--font-body`, `--font-caption`).
* **Verification:** `npm run typecheck && npm test`.

### Stage 2: Masthead & Global Header
* Refactor `client/src/components/Header.tsx` to reflect journal masthead aesthetics.
* Implement editorial issue date, subtle volume numbering, and minimalist navigation links.
* Retain button labels and accessibility attributes.
* **Verification:** Catalog navigation test pass.

### Stage 3: Catalog & Editorial Discovery
* Refactor `client/src/components/RecipeList.tsx` from generic card grid to asymmetric layout.
* Style the lead featured recipe with prominent editorial vignette, teaser text, and metadata.
* Present secondary recipes in a refined 2-column or 3-column culinary journal grid with editorial borders.
* **Verification:** `browser-acceptance.test.ts` & `canonical-product-acceptance.test.ts`.

### Stage 4: Recipe Detail & Cookbook Layout
* Refactor `client/src/components/RecipeDetail.tsx` into a dual-column editorial layout:
  - Left column: Large photographic hero, recipe narrative, yield/time metadata, serving scaler, culinary notes callout.
  - Right column: Structured ingredient checklists by component, ordered procedural steps with clear typographic step numbers, safety alerts.
* **Verification:** Ingredient scaling and interactive checklist tests pass.

### Stage 5: Cook Mode Refinement
* Refine `client/src/components/CookMode.tsx` visuals to match journal typography and palette while preserving full-screen distraction-free utility.
* Verify timer controls, active step highlighting, and keyboard shortcuts.
* **Verification:** `user-cook-mode-acceptance.test.ts`.

### Stage 6: Regression & Cross-Device Verification
* Run full verification suite: `npm run typecheck`, `npm run build`, and all test suites.
* Take high-resolution screenshots at 1440px desktop and 390px mobile for visual confirmation.
* Deliver complete acceptance report.

---

## 6. Risk Assessment & Mitigation Matrix

| Risk Factor | Impact | Probability | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Breaking Automated Tests** | High | Medium | Strict preservation of historical DOM classnames (`.recipe-card`, `.recipe-grid`, `.detail-title`, etc.) and ARIA roles. Run automated test suite after every stage. |
| **Font Loading Latency & CLS** | Medium | Low | Self-host WOFF2 font files; apply `font-display: swap`; declare robust fallback system fonts (`Georgia, "Times New Roman", serif`). |
| **Layout Breakage on Mobile (390px)** | High | Medium | Mobile-first CSS media queries (`@media (min-width: 768px)` and `@media (min-width: 1024px)`); single-column fluid stacking on small screens. |
| **Accidental State Mutation in Cook Mode** | High | Low | Isolate all visual changes to CSS classes; avoid touching React component state logic or `localStorage` serialization. |
| **Image Licensing Exposure** | High | High | Explicitly document all image origins in `EDITORIAL_ASSET_INVENTORY.md`; withhold external distribution until replacement with licensed or public-domain assets. |

---

## 7. Approval & Sign-Off Gate

Implementation of the steps outlined above will **NOT** begin until:
1. Product Owner approves this Readiness Plan.
2. Product Owner provides the official **Design Concept V1** visual mockups and style guide.
3. Explicit authorization to begin Phase 008.2 implementation is logged.
