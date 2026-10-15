# ATLAS GASTRONOMIC — DESIGN DECISIONS PENDING

**Phase:** 008.1 — Editorial Art Direction Preparation & Design Audit  
**Authority:** Product Owner  
**Target Direction:** European Culinary Journal  
**Execution Mode:** Audit & Preparation ONLY  
**Document Status:** Complete (Awaiting Design Concept V1 Mockups)  

---

## 1. Principle of Visual Discipline

In accordance with `GEMINI.md`, `.agents/rules/00-core-governance.md`, and the explicit mandate of **Phase 008.1**:
> *"The approved visual reference will be supplied separately through a dedicated Design Concept V1. Until that approval, do not invent missing visual decisions."*

This document catalogs every pending visual and design decision required to execute the European Culinary Journal transformation. No arbitrary styling choices, fictional color codes, or speculative layouts have been coded into the repository. All decisions listed below await explicit definition in the forthcoming **Design Concept V1** specification and mockups.

---

## 2. Pending Decision Catalog

### A. Color Palette & Surface Tokens
* **Pending Decision 1.1 — Exact Background & Canvas Tones:**  
  *Context:* The design direction calls for "Warm ivory / parchment background" and "Warm neutral surfaces".  
  *Awaiting Definition:* Exact hex codes for `--color-bg-canvas`, `--color-bg-surface-primary`, and `--color-bg-surface-secondary`. (e.g., `#FAF8F5` vs `#F4F0E8` vs `#FFFDF9`).
* **Pending Decision 1.2 — Typography Color Contrast:**  
  *Context:* "Deep charcoal typography" is specified to avoid harsh `#000000`.  
  *Awaiting Definition:* Exact hex codes for primary body copy (`--color-text-primary`), headings (`--color-text-title`), and muted metadata (`--color-text-muted`).
* **Pending Decision 1.3 — Primary & Secondary Accents:**  
  *Context:* "Muted olive green as primary accent; subtle antique gold as secondary accent."  
  *Awaiting Definition:* Exact chromatic values for olive (`--color-accent-olive`) and antique gold (`--color-accent-gold`), including their interactive hover/focus states and accessible contrast ratios against parchment backgrounds.
* **Pending Decision 1.4 — Border & Separator Treatment:**  
  *Context:* Current implementation uses generic gray borders (`#E5E7EB` / `#D1D5DB`).  
  *Awaiting Definition:* Color, thickness, and style of editorial dividers (e.g., `1px solid #E8E2D8` vs hairline `0.5px` rules).

---

### B. Typography & Font Selection
* **Pending Decision 2.1 — Editorial Serif Selection (Headings & Titles):**  
  *Context:* Needs an authoritative European editorial serif for major headings, recipe titles, and section titles.  
  *Candidates for Evaluation:* Cormorant Garamond, Newsreader, Playfair Display, EB Garamond, or Libre Baskerville.  
  *Awaiting Definition:* Approved typeface, optical weight range (regular, medium, italic), and licensing/distribution mechanism (Google Fonts embed vs self-hosted WOFF2).
* **Pending Decision 2.2 — Body & Instructional Copy Typeface:**  
  *Context:* Requires high legibility at prolonged reading distances during cooking and narrative inspection.  
  *Candidates for Evaluation:* High-grade serif (e.g. Source Serif 4, Lora) vs refined modern sans (e.g. Inter, DM Sans).  
  *Awaiting Definition:* Approved body typeface, line-height ratio (e.g., 1.6 vs 1.75), and paragraph spacing.
* **Pending Decision 2.3 — Metadata, Small Caps, & UI Font:**  
  *Context:* Interface elements, timers, scale controls, and prep/cook tags.  
  *Awaiting Definition:* Approved clean sans-serif and letter-spacing specifications for small-caps tracking (e.g. `letter-spacing: 0.08em; text-transform: uppercase`).

---

### C. Homepage & Catalog Composition
* **Pending Decision 3.1 — Editorial Masthead Layout:**  
  *Context:* The masthead must communicate an independent culinary journal rather than a SaaS navigation bar.  
  *Awaiting Definition:* Layout geometry (centered logo with date/issue/volume banner vs left-aligned classic newspaper masthead).
* **Pending Decision 3.2 — Asymmetric Feature Story Grid:**  
  *Context:* The catalog must avoid repetitive rounded cards.  
  *Awaiting Definition:* Proportion between the lead featured recipe (e.g., 60% width hero with narrative excerpt) and secondary vignettes (e.g., 2-column or list view).
* **Pending Decision 3.3 — Recipe Card Anatomy & Badge Elimination:**  
  *Context:* Current recipe cards feature colorful rounded pills for category, difficulty, and cooking time.  
  *Awaiting Definition:* Approved editorial metadata presentation (e.g., discreet inline text separated by typographic middots `·` or subtle em-dashes `—` instead of plastic pills).

---

### D. Recipe Detail Page Geometry
* **Pending Decision 4.1 — Hero Photography Composition:**  
  *Context:* Large photographic hero placement.  
  *Awaiting Definition:* Full-width banner above fold vs editorial split-screen (image on left, title & narrative on right).
* **Pending Decision 4.2 — Column Layout for Ingredients & Steps:**  
  *Context:* Dual-column desktop layout vs sequential single-column cookbook flow.  
  *Awaiting Definition:* Exact breakpoint behavior and column proportion (e.g., 35% ingredients on left, 65% instructions on right).
* **Pending Decision 4.3 — Culinary Notes & Historical Provenance Placement:**  
  *Context:* Editorial context, technique warnings, and source citations.  
  *Awaiting Definition:* Visual container style (e.g., shaded parchment inset box vs left-border callout rule vs marginalia).

---

### E. Cook Mode Visual Direction
* **Pending Decision 5.1 — Active Step Palette:**  
  *Context:* Cook mode requires maximum legibility in kitchen environments.  
  *Awaiting Definition:* Maintain warm parchment background or offer high-contrast culinary dark-room mode; styling of active vs upcoming steps.
* **Pending Decision 5.2 — Timer & Progress Controls:**  
  *Context:* Digital countdown clock and progress meter.  
  *Awaiting Definition:* Minimalist typographic countdown vs circular dial gauge.

---

### F. Photography Asset Strategy
* **Pending Decision 6.1 — Resolution of Real Camera vs Synthetic Photography:**  
  *Context:* Asset audit confirmed 3 images are Google Imagen 3 synthetic media, while 2 images are real-world camera captures (iPhone, Canon DSLR) with uncertain licensing rights.  
  *Awaiting Definition:* Product Owner policy on synthetic vs authentic photography for the European Culinary Journal identity, and selection/procurement of licensed high-resolution photography.

---

## 3. Next Steps & Prerequisites

| Action Item | Responsible Party | Status |
| :--- | :--- | :--- |
| **Review Phase 008.1 Preparation Documents** | Product Owner | Ready for Review |
| **Deliver Design Concept V1 (Mockups & Specs)** | Product Owner / Art Director | Awaiting Delivery |
| **Resolve Pending Decisions A.1 – F.1** | Product Owner | Awaiting Decision |
| **Authorize Phase 008.2 Implementation** | Product Owner | Pending Gate Approval |
