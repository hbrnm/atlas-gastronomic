# ATLAS GASTRONOMIC — TYPOGRAPHY & COMPONENT SPECIFICATION

**Authority:** Product Owner  
**Phase:** 008.2 — Implementation Readiness  
**Design Reference:** Approved Design Concept V1  
**Target Direction:** European Culinary Journal  
**Execution Mode:** Repository Inspection + Design System Integration Planning  
**Document Status:** Complete  

---

## 1. Typographic Architecture

The typographic voice of Atlas Gastronomic is built upon an intentional dichotomy:
1. **Playfair Display (Editorial & Literary Voice):** A high-contrast transitional serif with classical European editorial proportions, crisp serifs, and elegant italics. Used for mastheads, recipe titles, pull-quotes, and chapter headings.
2. **Inter (Functional & Culinary Precision Voice):** A hyper-legible neo-grotesque sans-serif designed for micro-clarity, numerical precision, and effortless readability at varying viewing distances. Used for ingredient measures, preparation instructions, metadata ribbons, timers, and interactive controls.

### Font Pairing Matrix
| Role | Family | Weights | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- |
| **Journal Masthead & Display** | `Playfair Display`, Georgia, serif | 700 (Bold) | `1.1` | `-0.02em` |
| **Recipe Titles (H1, H2)** | `Playfair Display`, Georgia, serif | 600 (Semi-bold) | `1.2` | `-0.01em` |
| **Literary Preamble & Quotes** | `Playfair Display`, Georgia, serif | 400 Italic | `1.5` | `0` |
| **Section Headings (H3, H4)** | `Playfair Display` or `Inter` | 600 | `1.3` | `0` |
| **Body & Step Instructions** | `Inter`, -apple-system, sans-serif | 400 (Regular) | `1.65` | `0` |
| **Ingredient Tables & Quantities** | `Inter`, -apple-system, sans-serif | 500 (Medium) | `1.5` | `0` |
| **Metadata & Subtitles** | `Inter`, -apple-system, sans-serif | 500 (Medium) | `1.4` | `0.01em` |
| **Small Caps & Edition Datelines** | `Inter`, -apple-system, sans-serif | 600 (Semi-bold) | `1.0` | `0.08em` (Uppercase) |
| **Timer Display (Cook Mode)** | `Inter`, monospace fallback | 700 (Bold) | `1.0` | `0.02em` |

---

## 2. Fluid Typographic Scale

To ensure editorial authority across all viewport sizes without manual breakpoint clutter, major headings use fluid CSS `clamp()` scales:

```css
/* --- TYPOGRAPHY SCALE TOKENS --- */
--text-display: clamp(2.5rem, 5vw, 4.25rem);  /* 40px - 68px */
--text-h1:      clamp(2.0rem, 4vw, 3.25rem);  /* 32px - 52px */
--text-h2:      clamp(1.5rem, 3vw, 2.25rem);  /* 24px - 36px */
--text-h3:      clamp(1.25rem, 2vw, 1.65rem); /* 20px - 26px */
--text-lead:    clamp(1.125rem, 1.5vw, 1.25rem); /* 18px - 20px */
--text-body:    1.0rem;                        /* 16px */
--text-sm:      0.875rem;                      /* 14px */
--text-xs:      0.75rem;                       /* 12px */
```

### Font Loading Strategy (`index.html`)
The current Google Fonts bundle in `src/client/index.html` loads legacy fonts (`Cinzel`, `Cormorant Garamond`, `Lora`, `Plus Jakarta Sans`). Upon Phase 008.2 implementation authorization, it will be updated to:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet">
```
*Fallback Protection:* If the network CDN is unavailable, the fallback stack (`Georgia, "Times New Roman", serif` for Playfair Display; `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` for Inter) guarantees layout stability.

---

## 3. Core Component Design Specifications

### A. Masthead & Navigation (`Header.tsx`)
* **Top Dateline Ribbon (`.masthead-edition-bar`):**
  - Background: `--color-canvas-subtle` (`#F0EEE6`).
  - Text: `Inter 600`, `11px`, uppercase, `0.08em` tracking.
  - Border Bottom: `1px solid --color-charcoal-200`.
  - Contents: Edition title, volume, and city datelines.
* **Main Header (`.header-inner`):**
  - Brand Title: `Playfair Display 700`, `24px`, `--color-charcoal-900`.
  - Brand Subtitle: `Inter 400`, `12px`, `--color-charcoal-600`.
  - Mode Switcher & Buttons: Clean text buttons with 15px Lucide icons, removing plastic borders.

### B. Lead Editorial Hero Spread (`RecipeList.tsx`)
* **Layout:** Asymmetric 2-column spread on desktop ($\ge 1024\text{px}$). Left column features the recipe image plate (60% width); right column features the editorial narrative and metadata (40% width).
* **Image Treatment (`.hero-spread-image`):**
  - Enforced `aspect-ratio: 16 / 10`.
  - Border: `1px solid --color-charcoal-200`.
  - Caption: `Inter 400`, `12px`, `--color-charcoal-600`.
* **Editorial Pull-Quote (`.hero-pullquote`):**
  - Typography: `Playfair Display 400 Italic`, `18px`, line-height `1.6`.
  - Decoration: Left border rule (`2px solid --color-gold-dark`), indented 16px.

### C. Recipe Discovery Grid & Cards (`RecipeList.tsx`)
* **Container:** Semantic `.recipe-grid` maintaining 12-column geometry on desktop, fluid 4-column on mobile.
* **Card Anatomy (`.recipe-card`):**
  - Background: `--color-canvas-surface` (`#FFFFFF`).
  - Border: `1px solid --color-charcoal-200` (`#D8D3C8`). Zero heavy shadows (`box-shadow: none`).
  - Image Box (`.card-image-box`): Strict `aspect-ratio: 4 / 3`, `object-fit: cover`.
  - Category & Tradition: Inline typographic kicker (`Inter 600`, `12px`, uppercase), separated by a subtle middot (`·`). **Plastic pill badges are eliminated.**
  - Title: `Playfair Display 600`, `1.35rem`, `--color-charcoal-900`.
  - Metadata Row: Users, Total Minutes, Difficulty separated by quiet vertical rules.

### D. Recipe Detail Cookbook Layout (`RecipeDetail.tsx`)
* **Article Header:**
  - Title: `.detail-title` in `Playfair Display 600`, `--text-h1`.
  - Subtitle: `Inter 400`, `1.15rem`, `--color-charcoal-600`.
* **Cookbook Photography Spread (`.cookbook-hero-image`):**
  - `aspect-ratio: 16 / 9` on desktop; `4 / 3` on mobile.
  - Border: `1px solid --color-charcoal-200`.
* **Dual-Column Body (`.cookbook-body-columns`):**
  - **Left Column (Mise-en-Place & Ingredients, 38% width):**
    - Serving Scaler: Clean horizontal stepper with `.btn-scaler-minus`, `.serving-scaler-value`, and `.btn-scaler-plus`.
    - Grouped Ingredients: Group titles in `Playfair Display 600`, `1.1rem`. Each ingredient row features an interactive checkbox (`.ingredient-checkbox`) with formatted bold quantities and units (`Inter 500`).
  - **Right Column (Procedural Steps & Technique, 62% width):**
    - Numbered Step Rows: Step number rendered as a classic typographic numeral badge in `Playfair Display 700`.
    - Instructions: `Inter 400`, `1.05rem`, line-height `1.7`.
    - Temperature & Thermal Badges: Clean inline tags highlighting temperature requirements.
    - Risk & Technique Alerts: Dedicated callout panels with left accent border (`--color-olive-primary` for culinary quality, `#9E2A2B` for food safety / HACCP).

### E. Cook Mode Environment (`CookMode.tsx`)
* **Visual Atmosphere:**
  - Background: `--color-dark-canvas` (`#1E1E1E`).
  - Card Surface: `--color-dark-surface` (`#282828`).
* **Active Step Instructional Block:**
  - Step Title: `Playfair Display 600`, `1.6rem`, `--color-dark-text-main`.
  - Step Body: `Inter 400`, `1.25rem`, line-height `1.7`, `--color-dark-text-main`.
* **Interactive Kitchen Timer:**
  - Numeric Display: `Inter 700`, `2.75rem`, monospace digits.
  - Color: `--color-gold-highlight` (`#D4AF37`) when running; `--color-dark-text-muted` when paused.
  - Controls: Start, Pause, and Reset buttons with high touch-target radius ($\ge 48\text{px}$).
* **Contextual Ingredients Drawer:**
  - Scaled quantities relevant exclusively to the active step, rendered in `--color-dark-text-main`.

### F. Buttons & Form Controls
* **Primary Button (`.btn-primary`):**
  - Background: `--color-olive-primary` (`#4A5A3A`). Text: `#F8F7F2`.
  - Border: `1px solid --color-olive-dark`. Radius: `2px`.
  - Hover: Background `--color-olive-dark` (`#37442B`).
* **Secondary Button (`.btn-secondary`):**
  - Background: `--color-canvas-default` (`#F8F7F2`). Text: `--color-charcoal-900`.
  - Border: `1px solid --color-charcoal-400`. Radius: `2px`.
  - Hover: Border `--color-olive-primary`, text `--color-olive-primary`.
* **Ghost Button (`.btn-ghost`):**
  - Background: `transparent`. Text: `--color-charcoal-800`.
  - Hover: Background `--color-canvas-inset`.
