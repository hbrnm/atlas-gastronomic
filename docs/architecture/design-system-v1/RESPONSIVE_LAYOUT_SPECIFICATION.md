# ATLAS GASTRONOMIC — RESPONSIVE LAYOUT SPECIFICATION

**Authority:** Product Owner  
**Phase:** 008.2 — Implementation Readiness  
**Design Reference:** Approved Design Concept V1  
**Target Direction:** European Culinary Journal  
**Execution Mode:** Repository Inspection + Design System Integration Planning  
**Document Status:** Complete  

---

## 1. Grid Geometry & Breakpoint Architecture

Atlas Gastronomic employs a mobile-first, fluid column-grid architecture with a hard maximum boundary to preserve editorial line length and photographic fidelity.

### Breakpoint Matrix
| Breakpoint | Viewport Range | Grid Columns | Gutters | Content Max Width | Primary Target Devices |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Mobile (`sm`)** | `320px – 767px` | **4 columns** | `16px` | Fluid 100% | Smartphones (390px baseline) |
| **Tablet (`md`)** | `768px – 1023px` | **8 columns** | `20px` | Fluid ($< 1024\text{px}$) | Tablets, portrait readers |
| **Desktop (`lg`)** | `1024px – 1439px` | **12 columns** | `24px` | Fluid ($< 1440\text{px}$) | Laptops, desktop monitors |
| **Wide Desktop (`xl`)** | $\ge 1440\text{px}$ | **12 columns** | `32px` | **1440px (Centered)** | Large monitors, 4K displays |

---

## 2. Global Layout Shell

```css
/* Container Wrapper for Editorial Content */
.main-content {
  width: 100%;
  max-width: 1440px;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--layout-padding-x);
  padding-right: var(--layout-padding-x);
}

:root {
  --layout-padding-x: 16px;
}

@media (min-width: 768px) {
  :root {
    --layout-padding-x: 24px;
  }
}

@media (min-width: 1024px) {
  :root {
    --layout-padding-x: 48px;
  }
}

@media (min-width: 1440px) {
  :root {
    --layout-padding-x: 64px;
  }
}
```

---

## 3. Responsive Transformation of Core Experiences

### A. Experience 1: Homepage & Catalog

#### Desktop ($\ge 1024\text{px}$)
* **Masthead:** Centered brand block with dual symmetric dateline strips.
* **Lead Feature Spread (`.hero-editorial-spread`):**
  - Asymmetric 2-column layout: Left column (60% width) displays large photographic plate; Right column (40% width) hosts editorial preamble, heritage badge, and pull-quote.
  - Image enforced at `aspect-ratio: 16 / 10`.
* **Catalog Grid (`.recipe-grid`):**
  - 3-column grid (`grid-template-columns: repeat(3, 1fr)`) with `24px` gap.
  - Recipe card image box enforced at `aspect-ratio: 4 / 3`.

#### Tablet (`768px – 1023px`)
* **Lead Feature Spread:** Stacks vertically—large image on top (`aspect-ratio: 16 / 9`), narrative and actions below.
* **Catalog Grid:** 2-column grid (`grid-template-columns: repeat(2, 1fr)`) with `20px` gap.

#### Mobile (`< 768px`, tested at 390px baseline)
* **Masthead:** Compact single-row masthead with collapsed edition text.
* **Lead Feature Spread:** Full-width image plate (`aspect-ratio: 4 / 3`), single-column typographic stack, full-width CTA buttons.
* **Catalog Grid:** Single-column layout (`grid-template-columns: 1fr`).
* **Touch Optimization:** All interactive controls (buttons, filters, card links) have touch targets $\ge 44\text{px} \times 44\text{px}$.

---

### B. Experience 2: Recipe Detail (The Cookbook Spread)

#### Desktop ($\ge 1024\text{px}$)
* **Article Header:** Centered editorial title (`Playfair Display`, `clamp(2.0rem, 4vw, 3.25rem)`), subtitle, and archival quote.
* **Hero Photography:** Centered plate (`max-width: 1100px`, `aspect-ratio: 16 / 9`), high-contrast caption below.
* **Cookbook Body Columns (`.cookbook-body-columns`):**
  - **Left Column (38% width):** Sticky mise-en-place aside holding serving scaler stepper and grouped ingredient checklists.
  - **Right Column (62% width):** Procedural step sequence, culinary risk alerts, technique tips, and historical bibliography.

#### Mobile (`< 768px`, tested at 390px baseline)
* **Single Sequential Flow:**
  1. Back navigation button (`Catalog Canonic`).
  2. Recipe Title and Subtitle.
  3. Hero Photograph (`aspect-ratio: 4 / 3`).
  4. Quick Metadata Strip (servings, active time, total time, difficulty).
  5. **Mise-en-Place & Ingredients Section:** Full-width serving scaler with oversized touch buttons (`+` and `−`), followed by grouped ingredient checklists.
  6. **Procedural Steps Section:** Sequenced step blocks with prominent step numbers and inline risk alerts.
  7. **Cook Mode CTA:** Sticky action bar or prominent top CTA button.

---

### C. Experience 3: Cook Mode (Dark Kitchen Environment)

#### Desktop ($\ge 1024\text{px}$)
* Centered focus card (`max-width: 900px`) on `--color-dark-canvas` (`#1E1E1E`).
* Dual-pane active step view:
  - Left sub-pane: Step instructions and timer dial.
  - Right sub-pane: Step-specific ingredient list with dynamically scaled quantities.
* Top bar with persistent recipe title, step counter, and safe exit button.

#### Mobile (`< 768px`, tested at 390px baseline)
* Edge-to-edge full-screen dark environment.
* Large instructional typography (`1.2rem`) optimized for legibility when phone/tablet is resting on a kitchen counter stand.
* Timer displayed prominently above step instructions.
* Slide-out or collapsible accordion drawer for step ingredients.
* **Bottom Sticky Control Bar:** Previous Step (`←`), Complete / Next Step (`→`), and Exit button anchored at bottom edge with safe area padding (`env(safe-area-inset-bottom)`).

---

## 4. Zero Layout Shift (CLS = 0) Technical Standards

To maintain visual stability and prevent sudden jumps during image and font loading:
1. **Explicit Aspect Ratios:**
   - Every `<img>` tag is wrapped in a container with a defined CSS `aspect-ratio` and `overflow: hidden`.
   - `object-fit: cover` and `width: 100%; height: 100%` ensure exact containment.
2. **Font Metrics Matching:**
   - Fallback fonts (`Georgia` for Playfair Display; `Arial` / system sans for Inter) are configured with compatible size adjustments to prevent text reflow upon Google Font hydration.
3. **Skeleton / Container Sizing:**
   - Skeleton placeholders or background parchment boxes are rendered before dynamic data arrives, preserving exact pixel height.
