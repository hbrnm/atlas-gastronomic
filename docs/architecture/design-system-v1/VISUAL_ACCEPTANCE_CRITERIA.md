# ATLAS GASTRONOMIC — VISUAL ACCEPTANCE CRITERIA

**Authority:** Product Owner  
**Phase:** 008.2 — Implementation Readiness  
**Design Reference:** Approved Design Concept V1  
**Target Direction:** European Culinary Journal  
**Execution Mode:** Repository Inspection + Design System Integration Planning  
**Document Status:** Complete  

---

## 1. Visual Acceptance Matrix by Experience

### Experience A: Homepage & Editorial Catalog

| Check ID | Verification Item | Acceptance Standard | Method | Viewport |
| :--- | :--- | :--- | :--- | :--- |
| **VAC-CAT-01** | **Masthead Brand Identity** | Header displays `ATLAS GASTRONOMIC` in **Playfair Display 700**, accompanied by the top edition dateline strip (Vol. I, seasonal issue, European capital cities). Strictly no SaaS logos or navbar shadows. | Visual Inspection / Screenshot | 1440px & 390px |
| **VAC-CAT-02** | **Color Palette Fidelity** | Page background is `#F8F7F2` (Warm Ivory). Typography is `#1E1E1E` (Charcoal). Primary buttons and active filters use `#4A5A3A` (Muted Olive). Gold accents use `#D4AF37`. Zero neon colors, gradients, or glassmorphic overlays. | CSS Inspection / Eye-dropper | 1440px & 390px |
| **VAC-CAT-03** | **Lead Hero Asymmetry** | The featured recipe spread displays a large photographic plate (enforced `aspect-ratio: 16 / 10`) balanced against an editorial text column (pullquote, tradition tag, summary, CTA buttons). | Visual Inspection | 1440px |
| **VAC-CAT-04** | **Pill / Badge Elimination** | Plastic rounded pill badges are replaced with clean typographic markers separated by middots (`·`) or subtle hairline rules. Zero high-radius (`> 6px`) tag containers. | DOM / Visual Inspection | 1440px & 390px |
| **VAC-CAT-05** | **Catalog Grid Layout** | Desktop renders a balanced 3-column editorial grid; mobile collapses smoothly to a single-column stack. Zero horizontal scrollbar at 390px. | Viewport Resize / Test | 1440px & 390px |
| **VAC-CAT-06** | **DOM Invariants Preserved** | `h1` contains `"Catalog Editorial de Rețete"`. Containers `.recipe-grid` and `.recipe-card` are present and accessible. | Automated Test (`browser-acceptance.test.ts`) | All |

---

### Experience B: Recipe Detail (Master Cookbook Feature)

| Check ID | Verification Item | Acceptance Standard | Method | Viewport |
| :--- | :--- | :--- | :--- | :--- |
| **VAC-DET-01** | **Cookbook Typographic Hierarchy** | Recipe title is rendered in **Playfair Display 600** (`.detail-title`), with subtitle in literary italic or refined Inter. Section titles clearly delineate Ingredients and Preparation. | Visual / DOM Inspection | 1440px & 390px |
| **VAC-DET-02** | **Hero Food Photography** | High-resolution food plate rendered with fixed `aspect-ratio: 16 / 9` (desktop) and `4 / 3` (mobile). Image caption credits culinary archive. | Visual Inspection | 1440px & 390px |
| **VAC-DET-03** | **Metadata Ribbon** | Serving count, active prep minutes, total time, and difficulty are rendered with quiet typographic dividers. | Visual Inspection | 1440px & 390px |
| **VAC-DET-04** | **Serving Scaler Interaction** | Stepper buttons (`.btn-scaler-minus` and `.btn-scaler-plus`) cleanly update `.serving-scaler-value` and scale ingredient amounts without page jitter. | Interactive Test / Script | 1440px & 390px |
| **VAC-DET-05** | **Dual-Column Desktop Geometry** | Desktop presents ingredients on left (38%) and numbered steps on right (62%). Mobile stacks ingredients above steps. | Layout Inspection | 1440px & 390px |
| **VAC-DET-06** | **Mise-en-Place Checklists** | Ingredients grouped by culinary component. Checkboxes (`.ingredient-checkbox`) toggle strikethrough or check state without layout shift. | Interactive Test | 1440px & 390px |
| **VAC-DET-07** | **Procedural Step Typography** | Step numbers styled with typographic drop-caps or subtle numeral badges. Critical control points and risk alerts styled with restrained left-border rules. | Visual Inspection | 1440px & 390px |

---

### Experience C: Cook Mode (Dark Kitchen Environment)

| Check ID | Verification Item | Acceptance Standard | Method | Viewport |
| :--- | :--- | :--- | :--- | :--- |
| **VAC-COK-01** | **Dedicated Dark Atmosphere** | Cook Mode renders an edge-to-edge `#1E1E1E` (Charcoal) background with `#F8F7F2` (Warm Ivory) instructional text. Contrast ratio $\ge 15.8:1$. | Contrast Checker / CSS | 1440px & 390px |
| **VAC-COK-02** | **Step Focus & Readability** | Active step displayed in large, readable typography (`clamp(1.2rem, 2vw, 1.6rem)`), legible from 1 meter distance on a kitchen stand. Past/future steps are discreetly minimized. | Visual Inspection | 1440px & 390px |
| **VAC-COK-03** | **Interactive Kitchen Timer** | Prominent countdown timer rendered in `#D4AF37` (Gold) when running. Touch targets for Start, Pause, and Reset $\ge 48\text{px}$. Audio chime fires upon completion. | Interactive / Audio Test | 1440px & 390px |
| **VAC-COK-04** | **Contextual Ingredients Drawer** | Ingredients required for the active step are displayed with scaled quantities matching active servings. | Interactive / Unit Test | 1440px & 390px |
| **VAC-COK-05** | **Reload Persistence & Deep Links** | Reloading the browser while in Cook Mode retains the active recipe ID and current step index via `localStorage` (`atlas_active_session`). URL hash `#/cook/:id` is preserved. | Automated Test (`user-cook-mode-acceptance.test.ts`) | All |
| **VAC-COK-06** | **Mobile Navigation Bar** | Previous, Next/Finish, and Exit controls anchored at bottom edge with safe area padding. | Mobile Inspection | 390px |

---

## 2. Automated & Visual Verification Methodology

### High-Resolution Screenshot Capture Protocol
Upon future implementation completion, automated screenshots must be generated using Puppeteer across two canonical viewports:
1. **Desktop Standard:** `1440px × 900px` (Device Scale Factor: 2x)
2. **Mobile Standard:** `390px × 844px` (iPhone 14 / modern smartphone baseline, Device Scale Factor: 3x)

**Required Screenshot Deliverables:**
* `catalog-desktop-1440.png` & `catalog-mobile-390.png`
* `detail-desktop-1440.png` & `detail-mobile-390.png`
* `cookmode-desktop-1440.png` & `cookmode-mobile-390.png`

### Accessibility & Performance Thresholds
* **WCAG 2.1 AA:** Zero automated violations reported by Lighthouse / Axe core.
* **Cumulative Layout Shift (CLS):** $\le 0.02$ during initial page load and font hydration.
* **First Contentful Paint (FCP):** $\le 1.2\text{s}$ on desktop staging.

---

## 3. Defect Classification & Remediation Thresholds

| Severity | Definition | Remediation Threshold |
| :--- | :--- | :--- |
| **Blocker** | Any broken test selector, test failure, contrast failure $< 4.5:1$ on text, broken layout at 390px/1440px, or lost session persistence in Cook Mode. | Immediate fix; blocks acceptance. |
| **Major** | Visual misalignment ($> 8\text{px}$ off design grid), incorrect font weight, or unstyled flash during font load. | Must be resolved before Phase 008 completion. |
| **Minor** | Subtle padding mismatch ($\le 4\text{px}$), typographic orphan, or slight caption styling nuance. | Addressed during editorial refinement. |
