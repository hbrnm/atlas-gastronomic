# ATLAS GASTRONOMIC — PHASE 005-C
## FINDINGS REGISTER: SCALING, COOK MODE & CULINARY RISK

**Protocol:** Atlas AOS  
**Phase:** 005-C — Culinary Scaling & Cook Mode Execution Validation  
**Authority:** Product Owner  
**Repository:** `Atlas-gastronomic-repo`  
**Branch:** `chore/integrate-agent-skills`  
**Date:** 2026-10-14  

---

## 1. Overview of Findings

| Finding ID | Scope | Target Component / Recipe | Severity | Authorization Status |
| :--- | :--- | :--- | :---: | :---: |
| **FIND-005C-01** | Cook Mode UX | `App.tsx` & `CookMode.tsx` | **MAJOR** | Authorized (Small justified Cook Mode fix) |
| **FIND-005C-02** | Cook Mode UX | `CookMode.tsx:534-536` | **MINOR** | Authorized (Small justified Cook Mode fix) |
| **FIND-005C-03** | Scaling | `rec_tagliatelle_ragu_001` & `rec_souffle_fromage_004` | **MINOR** | Contextual Advisory (No schema change) |
| **FIND-005C-04** | Scaling | `rec_boeuf_bourguignon_003` & `rec_sarmale_traditionale_012` | **MINOR** | Contextual Advisory (No schema change) |
| **FIND-005C-05** | Editorial UX | Step instructions across canonical recipes | **OBSERVATION** | Editorial note clarification |
| **FIND-005C-06** | Equipment | `rec_risotto_milanese_002` ($2\times$) | **OBSERVATION** | Contextual Advisory (No schema change) |

---

## 2. Detailed Finding Records

### Finding FIND-005C-01: Cook Mode Disconnect from RecipeDetail Serving Scaler
- **Target Component:** `src/client/App.tsx:372-383` and `src/client/components/CookMode.tsx:44-60`
- **Recipe ID:** Global (Affects all 12 recipes in product catalog)
- **Severity:** **MAJOR**
- **Evidence in Current Implementation:**
  In `RecipeDetail.tsx`, the user can adjust servings via the `+`/`−` stepper (e.g. from 8 down to 4 for Sarmale). However, `servings` is managed purely within `RecipeDetail`'s local state. When clicking `Începe Gătitul (Cook Mode)`, `App.tsx` triggers `setCurrentView('cook')` without passing the selected `servings` or `scaleFactor` to `CookMode`. Consequently, `CookMode` displays the base unscaled recipe quantities in all step ingredient badges.
- **Culinary / UX Impact:**
  A cook who scaled the recipe down to 4 portions in `RecipeDetail` enters Cook Mode and sees badges asking for 800 g meat, 70 g paste, and 550 ml liquid. If the cook follows Cook Mode without remembering the $0.5\times$ adjustment, the dish will be ruined by adding double the necessary ingredients.
- **Recommended Action:**
  Lift `servings` state into `App.tsx` (or pass `scaledServings` from `RecipeDetail` to `CookMode`), and scale the displayed quantity in `CookMode.tsx`:
  `scaledQuantity = (alloc?.quantity_used_in_step ?? ing?.quantity ?? 0) * scaleFactor`.
- **Authorization Status:** **Authorized** under Section 7 of the Phase 005-C mandate (*"You may implement small, clearly justified Cook Mode or recipe-data corrections only if: the issue is objectively demonstrated, the existing Recipe Core V2 model supports the correction, no frozen standard is changed, no unrelated refactor is required"*).

---

### Finding FIND-005C-02: Countdown Timer Lacks Active vs. Passive Operational Context
- **Target Component:** `src/client/components/CookMode.tsx:534-536`
- **Recipe ID:** Global (Affects all recipes with long simmering/braising steps)
- **Severity:** **MINOR**
- **Evidence in Current Implementation:**
  The countdown timer header currently reads `Cronometru Pas ({currentStep.duration_minutes} min)`. It does not inform the user whether the timer requires hands-on stove presence or is autonomous passive oven time.
- **Culinary / UX Impact:**
  In Step 4 of Boeuf Bourguignon (150 min oven braisage) or Step 6 of Sarmale (180 min oven braisage), the cook sees a multi-hour timer without an explicit culinary cue that this is passive wait time, creating hesitation as to whether they must remain vigilant at the stove.
- **Recommended Action:**
  Enhance the timer label to render active and passive breakdowns:
  `Cronometru Pas (${currentStep.duration_minutes} min — ${currentStep.active_minutes ? `${currentStep.active_minutes}m activ` : ''}${currentStep.active_minutes && currentStep.passive_minutes ? ' • ' : ''}${currentStep.passive_minutes ? `${currentStep.passive_minutes}m pasiv / la cuptor` : ''})`.
- **Authorization Status:** **Authorized** under Section 7.

---

### Finding FIND-005C-03: Indivisible Egg Fractioning at Small Yields
- **Target Component:** `RecipeDetail.tsx` (Serving Scaler)
- **Recipe ID:** `rec_tagliatelle_ragu_001` and `rec_souffle_fromage_004`
- **Severity:** **MINOR**
- **Evidence in Current Implementation:**
  Scaling Tagliatelle to 2 servings yields 1.33 eggs ($4 \times 2/6$). Scaling Soufflé to 2 servings yields 2.5 egg whites ($5 \times 2/4$).
- **Culinary / UX Impact:**
  Cooks cannot crack 0.33 eggs or 0.5 egg whites without liquid egg measurement. In soufflés, using 2 egg whites instead of 3 violates the classical $N+1$ albumin expansion rule, resulting in poor rise.
- **Recommended Action:**
  Do **not** alter the mathematical scaling engine. Add explicit scaling advisories in the recipe's `editorial_notes` explaining the practical whole-egg equivalents (e.g. 1 whole egg + 1 yolk for 2 portions of pasta; 3 whole whites for 2 ramekins of soufflé).
- **Authorization Status:** **Authorized** as contextual editorial guidance (requires no schema change).

---

### Finding FIND-005C-04: Vessel Surface Area and Evaporative Liquid Depth at $0.5\times$
- **Target Component:** `rec_boeuf_bourguignon_003` and `rec_sarmale_traditionale_012`
- **Recipe ID:** `rec_boeuf_bourguignon_003` & `rec_sarmale_traditionale_012`
- **Severity:** **MINOR**
- **Evidence in Current Implementation:**
  Linear scaling cuts braising liquid in half (625 ml total liquid for Boeuf Bourguignon, 275 ml for Sarmale). In standard 26 cm Dutch ovens, liquid depth drops below the critical 2 cm mark.
- **Culinary / UX Impact:**
  During 2.5–3 hours of braising, surface evaporation rate remains constant, leading to premature liquid dry-out, scorched pan bottom, and un-submerged meat.
- **Recommended Action:**
  Document equipment sizing advisories in `editorial_notes` instructing cooks to use a smaller diameter pot (18–20 cm) or maintain a minimum liquid reservoir of 400–500 ml when preparing half-batches.
- **Authorization Status:** **Authorized** as contextual editorial guidance.

---

### Finding FIND-005C-05: Hardcoded Base Quantities in Static Step Instructions
- **Target Component:** Step instruction texts
- **Recipe ID:** Global
- **Severity:** **OBSERVATION**
- **Evidence in Current Implementation:**
  Instructions contain literal quantities (e.g. *"Dizolvați 40 g pastă de tomate în 550 ml apă călduță"* or *"rumeniți bastonașele de lardon în 20 ml ulei"*).
- **Culinary / UX Impact:**
  If the cook scales the recipe to $2\times$, the ingredient badge shows 80 g / 1100 ml, but the paragraph text still reads "40 g" / "550 ml".
- **Recommended Action:**
  Highlight the ingredient badge prominently in Cook Mode as the primary source of truth for scaled quantities, and maintain an advisory in `editorial_notes`.
- **Authorization Status:** **Requires PO Approval** if rewrites of canonical instructions are contemplated; currently addressed via UI guidance without modifying canonical texts.

---

### Finding FIND-005C-06: Pan Overcrowding and Wave-Mantecatura Latency at $2\times$
- **Target Component:** `rec_risotto_milanese_002` ($2\times$, 8 portions)
- **Recipe ID:** `rec_risotto_milanese_002`
- **Severity:** **OBSERVATION**
- **Evidence in Current Implementation:**
  640 g Carnaroli rice + 2400 ml stock creates over 2.5 kg of hot risotto.
- **Culinary / UX Impact:**
  In a standard home skillet (28 cm), the rice layer is too thick for uniform *tostatura*. Tossing 2.5 kg of risotto *all'onda* exceeds domestic physical capability and pan height, risking spillage and broken emulsion.
- **Recommended Action:**
  Add a contextual note recommending two parallel pans or a 36–40 cm wide rondeau for double-batch risotto.
- **Authorization Status:** **Authorized** as contextual editorial guidance.
