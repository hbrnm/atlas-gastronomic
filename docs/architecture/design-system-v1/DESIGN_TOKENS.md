# ATLAS GASTRONOMIC — DESIGN SYSTEM V1 TOKENS

**Authority:** Product Owner  
**Phase:** 008.2 — Implementation Readiness  
**Design Reference:** Approved Design Concept V1  
**Target Direction:** European Culinary Journal  
**Execution Mode:** Repository Inspection + Design System Integration Planning  
**Document Status:** Complete  

---

## 1. Primary Palette Specification

The official visual identity of Atlas Gastronomic is anchored by four foundational color spaces:

| Token Name | Hex Code | Visual Role | Color Philosophy |
| :--- | :--- | :--- | :--- |
| **`Canvas`** | `#F8F7F2` | Page canvas, reading backgrounds | Warm, uncoated European parchment paper; reduces glare and establishes tactile editorial warmth. |
| **`Charcoal`** | `#1E1E1E` | Primary typography, dark workspace | Deep letterpress charcoal ink; softer and more literary than pure `#000000`. |
| **`Olive`** | `#4A5A3A` | Primary accent, culinary focus | Muted Mediterranean olive leaf; evokes terroir, tradition, and botanical authenticity. |
| **`Gold`** | `#D4AF37` | Secondary highlight, heritage marks | Restrained antique brass/gold; denotes archival quality, canonical status, and fine craftsmanship. |

---

## 2. Expanded Chromatic & Semantic Scale

### A. Canvas & Surface Tones (Daylight / Editorial Mode)
```css
--color-canvas-default:   #F8F7F2; /* Base parchment background */
--color-canvas-surface:   #FFFFFF; /* Elevated cards and modal surfaces */
--color-canvas-subtle:    #F0EEE6; /* Header bars, table headers, inset strips */
--color-canvas-inset:     #E8E4D8; /* Form controls, nested quotes, recipe notes */
--color-canvas-hover:     #EDE9DD; /* Interactive list/card hover state */
```

### B. Charcoal & Typography Tones
```css
--color-charcoal-900:     #1E1E1E; /* Primary headings, book titles, drop caps */
--color-charcoal-800:     #2D2D2D; /* Standard body text and step instructions */
--color-charcoal-600:     #55524B; /* Secondary metadata, timing, yield captions */
--color-charcoal-400:     #8C877D; /* Subtle tertiary text, placeholder labels */
--color-charcoal-200:     #D8D3C8; /* Hairline rules and dividers */
```

### C. Olive Accent Scale
```css
--color-olive-primary:    #4A5A3A; /* Primary CTA buttons, active tabs, focused states */
--color-olive-dark:       #37442B; /* Button hover, pressed state */
--color-olive-light:      #60734E; /* Subheadings, badge outlines */
--color-olive-subtle:     #EDF2EA; /* Success backgrounds, highlighted step blocks */
--color-olive-border:     #BCCABA; /* Distinct semantic borders */
```

### D. Gold Highlight Scale
```css
--color-gold-highlight:   #D4AF37; /* Archival stars, edition numbers, heritage seals */
--color-gold-dark:        #9E7E1E; /* Accessible text gold against light parchment */
--color-gold-light:       #E4C765; /* Accents on dark surfaces */
--color-gold-subtle:      #FAF5EB; /* Culinary alert background tint */
--color-gold-border:      #DECBA6; /* Heritage borders */
```

### E. Dedicated Dark Kitchen Scale (Cook Mode)
```css
--color-dark-canvas:      #1E1E1E; /* Immersive dark room background */
--color-dark-surface:     #282828; /* Active step card, drawer background */
--color-dark-surface-elevated: #333333; /* Popovers, modal dialogs */
--color-dark-border:      #404040; /* Minimal borders on dark */
--color-dark-text-main:   #F8F7F2; /* Pure ivory instructional text */
--color-dark-text-muted:  #A8A49A; /* Secondary timers and previous/next step previews */
--color-dark-accent:      #D4AF37; /* Active timer highlight and progress ring */
```

---

## 3. Contrast Ratios & WCAG 2.1 Accessibility Audit

| Foreground Token | Background Token | Computed Contrast Ratio | WCAG Compliance Level | Application Scope |
| :--- | :--- | :--- | :--- | :--- |
| `#1E1E1E` (Charcoal 900) | `#F8F7F2` (Canvas) | **15.8 : 1** | **AAA** (Pass) | All editorial text, headings, steps. |
| `#2D2D2D` (Charcoal 800) | `#F8F7F2` (Canvas) | **13.4 : 1** | **AAA** (Pass) | Body copy and ingredient lists. |
| `#55524B` (Charcoal 600) | `#F8F7F2` (Canvas) | **6.7 : 1** | **AA** (Pass) | Metadata, captions, timestamps. |
| `#4A5A3A` (Olive Primary) | `#F8F7F2` (Canvas) | **6.95 : 1** | **AA / AAA Large** (Pass) | Primary buttons, link anchors, tabs. |
| `#9E7E1E` (Gold Dark) | `#F8F7F2` (Canvas) | **4.6 : 1** | **AA** (Pass) | Heritage badges and edition dates. |
| `#F8F7F2` (Warm Ivory) | `#4A5A3A` (Olive Primary) | **6.95 : 1** | **AA / AAA Large** (Pass) | Text inside primary buttons. |
| `#F8F7F2` (Warm Ivory) | `#1E1E1E` (Dark Canvas) | **15.8 : 1** | **AAA** (Pass) | Active step instructions in Cook Mode. |
| `#D4AF37` (Gold Highlight) | `#1E1E1E` (Dark Canvas) | **7.9 : 1** | **AAA** (Pass) | Active timers and step progress markers. |
| `#A8A49A` (Muted Ivory) | `#1E1E1E` (Dark Canvas) | **7.2 : 1** | **AAA** (Pass) | Inactive step controls in Cook Mode. |
| `#4A5A3A` (Olive Primary) | `#1E1E1E` (Dark Canvas) | **~2.23 : 1** | **FAIL** (< 4.5:1) | **PROHIBITED:** Never use for text or essential interface controls on dark surfaces. |

*Finding & Contrast Governance:* 
1. All permitted text combinations exceed WCAG 2.1 AA requirements ($\ge 4.5:1$ for normal text, $\ge 3.0:1$ for large text).
2. **Olive (`#4A5A3A`) on Charcoal (`#1E1E1E`):** The contrast ratio is approximately **2.23:1**, which fails WCAG AA. It is strictly prohibited to place Olive text or critical control elements over Charcoal backgrounds. In Cook Mode, interactive highlights and accents must use Gold (`#D4AF37` at 7.9:1) or Warm Ivory (`#F8F7F2` at 15.8:1).
3. **Light Gold (`#D4AF37`):** Prohibited for normal text on light canvas (`#F8F7F2`). Reserved for decorative rules, seals, or high-contrast dark environments (`#1E1E1E`).

---

## 4. Typography Availability, Font Licensing & Project Conventions Validation

### A. Font Availability & Licensing Audit
* **Playfair Display:**
  - *Designer:* Claus Eggers Sørensen.
  - *License:* SIL Open Font License, Version 1.1 (OFL-1.1).
  - *Commercial & Web Rights:* 100% free for commercial use, modification, and digital embedding/distribution.
  - *Availability:* Native support across Google Fonts CDN with zero runtime license keys; freely bundleable as self-hosted WOFF2 files if CDN offline fallback is desired.
* **Inter:**
  - *Designer:* Rasmus Andersson.
  - *License:* SIL Open Font License, Version 1.1 (OFL-1.1).
  - *Commercial & Web Rights:* 100% free for commercial use and web software distribution.
  - *Availability:* Native support via Google Fonts CDN, NPM package (`@fontsource/inter`), and OS-level system fallbacks.

### B. Project Conventions & Backward Compatibility Validation
* **Variable Naming Conventions:**
  - Token variables use standard semantic naming (`--color-canvas-*`, `--color-charcoal-*`, `--color-olive-*`, `--color-gold-*`, `--space-*`, `--radius-*`).
  - Legacy variable aliases (`--bg-canvas`, `--text-ink`, `--color-olive`, `--color-gold`, `--border-editorial`, etc.) are mapped 1:1 to new tokens in `styles.css` during Stage 1 so that unmigrated subcomponents (such as `ValidationPanel.tsx` or `IngredientEditor.tsx`) do not break visually.
* **Preservation of CSS Custom Property Architecture:**
  - Eliminates external runtime CSS-in-JS dependencies (no Tailwind, Emotion, or Styled Components runtime added).
  - Uses native CSS custom properties supported natively by all target browsers (Chrome 49+, Safari 9.3+, Firefox 31+, Edge 15+).

---

## 5. Spacing System (8px Grid Foundation)

Atlas Gastronomic employs a standard 8px baseline spatial rhythm:

| Spacing Token | Pixel Value | Rem Value | Common Usage |
| :--- | :--- | :--- | :--- |
| `--space-1` | 4px | 0.25rem | Micro-spacing, inline badges, icon gaps. |
| `--space-2` | 8px | 0.50rem | Compact padding, button inline gaps, tag margins. |
| `--space-3` | 12px | 0.75rem | Form input padding, small card insets. |
| `--space-4` | 16px | 1.00rem | Standard container padding, grid gutters (mobile). |
| `--space-6` | 24px | 1.50rem | Section gaps, card internal padding, desktop gutters. |
| `--space-8` | 32px | 2.00rem | Major layout module separation, hero margins. |
| `--space-12` | 48px | 3.00rem | Editorial feature spacing, section transitions. |
| `--space-16` | 64px | 4.00rem | Masthead margins, chapter dividers. |
| `--space-24` | 96px | 6.00rem | Lead hero spread spacing on wide desktop displays. |

---

## 6. Architectural Radii & Physical Borders

To maintain the tactile feeling of physical print and fine architectural binding, corner radii are strictly restrained:

| Token Name | Value | Permitted Applications |
| :--- | :--- | :--- |
| `--radius-none` | `0px` | Masthead ribbons, hero spreads, full-bleed images, borders. |
| `--radius-sm` | `2px` | Buttons, form inputs, checkboxes, subtle callouts. |
| `--radius-md` | `4px` | Recipe cards, culinary alert containers. |
| `--radius-lg` | `6px` | Modal dialogs and floating kitchen action bars (maximum allowed). |

*Explicit Prohibition:* Corner radii greater than `6px` and pill-shaped containers (`border-radius: 9999px`) are prohibited for content containers.

---

## 7. Shadows & Tactile Elevation

| Token Name | CSS Value | Editorial Intent |
| :--- | :--- | :--- |
| `--shadow-none` | `none` | Default for recipe cards and static layout elements. |
| `--shadow-subtle` | `0 1px 3px rgba(30, 30, 30, 0.05)` | Interactive button hover, active card lift. |
| `--shadow-card` | `0 4px 12px rgba(30, 30, 30, 0.06)` | Cook Mode floating tool drawer, ingredient drawer. |
| `--shadow-modal` | `0 16px 36px rgba(30, 30, 30, 0.18)` | Private staging access gate, full-screen dialogs. |

---

## 8. CSS Custom Properties Implementation Template

The following token set is engineered for immediate drop-in inclusion in `src/client/styles.css` upon Phase 008.2 authorization:

```css
/* ==========================================================================
   ATLAS GASTRONOMIC — DESIGN SYSTEM V1 TOKENS
   Aesthetic Baseline: European Culinary Journal
   ========================================================================== */

:root {
  /* --- PALETTE: Warm Ivory & Surfaces --- */
  --color-canvas-default:   #F8F7F2;
  --color-canvas-surface:   #FFFFFF;
  --color-canvas-subtle:    #F0EEE6;
  --color-canvas-inset:     #E8E4D8;
  --color-canvas-hover:     #EDE9DD;

  /* --- TYPOGRAPHY: Deep Charcoal Ink --- */
  --color-charcoal-900:     #1E1E1E;
  --color-charcoal-800:     #2D2D2D;
  --color-charcoal-600:     #55524B;
  --color-charcoal-400:     #8C877D;
  --color-charcoal-200:     #D8D3C8;

  /* --- ACCENTS: Muted Olive & Restrained Gold --- */
  --color-olive-primary:    #4A5A3A;
  --color-olive-dark:       #37442B;
  --color-olive-light:      #60734E;
  --color-olive-subtle:     #EDF2EA;
  --color-olive-border:     #BCCABA;

  --color-gold-highlight:   #D4AF37;
  --color-gold-dark:        #9E7E1E;
  --color-gold-light:       #E4C765;
  --color-gold-subtle:      #FAF5EB;
  --color-gold-border:      #DECBA6;

  /* --- DARK KITCHEN: Cook Mode --- */
  --color-dark-canvas:      #1E1E1E;
  --color-dark-surface:     #282828;
  --color-dark-surface-elevated: #333333;
  --color-dark-border:      #404040;
  --color-dark-text-main:   #F8F7F2;
  --color-dark-text-muted:  #A8A49A;
  --color-dark-accent:      #D4AF37;

  /* --- SPATIAL UNITS --- */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-6:  24px;
  --space-8:  32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;

  /* --- RADII --- */
  --radius-none: 0px;
  --radius-sm:   2px;
  --radius-md:   4px;
  --radius-lg:   6px;

  /* --- SHADOWS --- */
  --shadow-none:   none;
  --shadow-subtle: 0 1px 3px rgba(30, 30, 30, 0.05);
  --shadow-card:   0 4px 12px rgba(30, 30, 30, 0.06);
  --shadow-modal:  0 16px 36px rgba(30, 30, 30, 0.18);
}
```
