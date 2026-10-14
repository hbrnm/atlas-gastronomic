# ATLAS GASTRONOMIC — PHASE 005-B
## TARGETED RECIPE REMEDIATION REPORT

**Protocol:** Atlas AOS  
**Phase:** 005-B (Targeted Recipe Remediation)  
**Authority:** Product Owner  
**Mode:** Controlled Implementation  
**Status:** IMPLEMENTATION COMPLETE & VERIFIED (WITH ONE MATERIAL OBSERVATION ON BUTTER DATA)  
**Baseline Commit:** `dc8dd75395049a9599ecbde83fa5015a6f07190e` (branch `chore/integrate-agent-skills`)  
**Standards Integrity:** `standards/v1.0.0/` is strictly frozen and completely untouched.

---

## 1. Executive Summary

Phase 005-B targeted remediation was executed under the controlled authorization of the Product Owner, addressing the findings identified in Phase 005-A across the Recipe Core V2 dataset.

Key achievements:
1. **Sarmale Tradiționale (`rec_sarmale_traditionale_012`):**
   - **FIND-005A-01 (Missing Cooking Liquid):** Declared reference volume of 550 ml warm water or clear bone stock in `ingredients` (`ing_sm_10`), associated directly with Step 6 (cooking step) in `ingredient_refs` and step `allocations`.
   - **FIND-005A-02 (Tomato Paste Allocation):** Fully eliminated ambiguous references ("restul") by establishing traceable metric allocations: 30 g in meat filling (Step 3) + 40 g in simmering liquid (Step 6) = 70 g total declared.
   - **FIND-005A-03 (Sauerkraut Leaf Preparation):** Authored explicit Step 2 covering leaf separation, inspection, fibrous vein trimming, salinity/acidity testing, and warm water desalting/soaking (15–30 min) in accordance with classical Romanian culinary practice (Radu Anton Roman & Sanda Marin). Configured DAG dependencies where leaf prep (`depends_on: []`) runs concurrently at $T=0$, and Step 4 (rolling) converges on both Step 2 and Step 3.
   - **FIND-005A-04 (Accompaniment Semantics):** Rigorously reviewed. Confirmed that *mămăligă*, *smântână*, and *ardei iute* are external serving accompaniments, not constituent recipe ingredients. In accordance with PO mandate, they are **not** artificially stuffed into the ingredients array to satisfy naive validation; instead, domain boundaries are formally respected and documented in `editorial_notes`.
2. **Boeuf Bourguignon Butter Allocation (FIND-005A-06 & Protocol Stop):**
   - Forensic analysis of `BOEUF_RECIPE` (`rec_boeuf_bourguignon_003`), `DOSSIER_003_BOEUF_BOURGUIGNON.md`, and unit tests revealed a material discrepancy in the audit citation. In the actual production recipe, butter is already declared at **60 g** and fully allocated to the gram (20 g onions + 25 g mushrooms + 15 g *monter au beurre* = 60 g), verified by `tests/canonical-recipes-v2.test.ts`. Per PO instruction ("*Do not change the total quantity without evidence. If a material contradiction is discovered, stop that specific correction and request Product Owner approval*"), this was stopped and reconciled without breaking canonical tests.
3. **Automated Verification:**
   - Authored new dedicated test suite: `tests/sarmale-remediation.test.ts`.
   - All **51 automated tests passed** (0 failures).
   - Typecheck and production build pass with 0 errors.

---

## 2. Exact List of Modified Files

| File Path | Action | Description |
| :--- | :---: | :--- |
| `src/shared/additional-recipes.ts` | Modified | Updated `SARMALE_RECIPE` with 550 ml liquid, 30g/40g tomato paste allocations, leaf prep step, DAG convergence, and accompaniment notes. |
| `tests/sarmale-remediation.test.ts` | Created | Automated regression test verifying validation, liquid/paste allocations, leaf prep DAG, scaling calculations, and db persistence. |
| `docs/architecture/phase-5/PHASE_005B_REMEDIATION_REPORT.md` | Created | This handoff report. |

All changes are fully synchronized to the local git working tree (`c:\Users\pc1\Documents\antigravity\Atlas-gastronomic-repo`).

---

## 3. Before / After Comparison of Corrected Recipe Data

### Recipe: `rec_sarmale_traditionale_012` (Sarmale Tradiționale în Foi de Varză Murată)

#### A. Recipe Timing & Yield
```diff
  timing: {
-   active_minutes: 50,
+   active_minutes: 65,
    passive_minutes: 180,
-   total_minutes: 230,
+   total_minutes: 245,
    lead_time_hours: null,
  },
```

#### B. Ingredients Array
```diff
    {
      id: 'ing_sm_06',
      ingredient_id: 'pasta-tomate',
      name: 'Pastă densă de tomate sau suc de roșii',
      quantity: 70,
      unit: 'g',
-     preparation: null,
-     group: 'Sos & Lichid',
-     optional: false,
+     preparation: 'fracționat: 30 g în compoziția de umplutură, 40 g dizolvate în lichidul de fierbere',
+     group: 'Sos & Lichid',
+     optional: false,
+     notes: 'Aport de aciditate, umami și culoare',
      sequence_order: 6,
    },
    ...
+   {
+     id: 'ing_sm_10',
+     ingredient_id: 'lichid-fierbere-sarmale',
+     name: 'Apă călduță sau supă limpede de oase',
+     quantity: 550,
+     unit: 'ml',
+     preparation: 'călduță, pentru dizolvarea pastei de tomate și acoperirea sarmalelor',
+     group: 'Sos & Lichid',
+     optional: false,
+     notes: 'Volumul de referință (550 ml) asigură acoperirea optimă a sarmalelor clădite; supa de oase aduce savoare și colagen suplimentar',
+     sequence_order: 10,
+   },
```

#### C. Editorial Notes (Accompaniment Semantics)
```diff
  editorial_notes: [
-   'Desărarea foilor de varză în apă călduță este obligatorie dacă varza este prea acră sau sărată.',
+   'Desprinderea foilor, curățarea nervurilor groase și desărarea/desăcrirea lor în apă călduță timp de 15–30 de minute sunt esențiale pentru obținerea unor sarmale fine cu salinitate echilibrată.',
    'Fierberea lentă la foc foarte mic asigură gelatinizarea colagenului din afumătură și frăgezimea sarmalelor.',
+   'Semantică acompaniamente: Mămăliga caldă, smântâna grasă și ardeiul iute sunt acompaniamente tradiționale de servire (garnituri externe), nu ingrediente constituente ale sarmalelor propriu-zise; conform modelului de domeniu Recipe Core V2, acestea sunt documentate ca sugestii de servire și nu poluează lista ingredientelor obligatorii.',
  ],
```

#### D. Operational Steps & DAG Structure
```diff
  steps: [
    // Step 1: Călire ceapă și orez (unchanged, depends_on: [])
+   // Step 2 (NEW): Sauerkraut leaf prep & inspection (depends_on: [])
+   {
+     id: 'step_sm_02',
+     step_id: 'step_sm_pregatire_varza_02',
+     step_number: 2,
+     instruction: 'Desprindeți cu grijă foile de pe căpățâna de varză murată și inspectați-le. Îndepărtați sau subțiați cu un cuțit ascuțit nervurile groase și lemnoase. Gustați o bucățică de varză pentru a evalua nivelul de sare și aciditate: dacă varza este prea sărată sau excesiv de acră, lăsați foile la desărat în apă călduță timp de 15–30 de minute, apoi scurgeți-le bine...',
+     duration_minutes: 20,
+     active_minutes: 15,
+     passive_minutes: 5,
+     depends_on: [],
+     ingredient_refs: ['varza-murata'],
+     risks: [{ warning_type: 'culinary_quality', message: 'Neverificarea salinității verzei poate face sarmalele excesiv de sărate sau acre...' }],
+   },
    // Step 3 (Renumbered from 2): Omogenizare umplutură
-   instruction: '...2 linguri de pastă de tomate...',
+   instruction: '...30 g de pastă de tomate...',
+   allocations: [{ ingredient_id: 'pasta-tomate', quantity_used_in_step: 30, unit: 'g', component: 'omogenizare umplutură' }],
    // Step 4 (Renumbered from 3): Învelire sarmale
-   depends_on: ['step_sm_omogenizare_umplutura_02'],
+   depends_on: ['step_sm_pregatire_varza_02', 'step_sm_omogenizare_umplutura_03'],
    // Step 5 (Renumbered from 4): Clădire oală lut
-   depends_on: ['step_sm_invelire_sarmale_03'],
+   depends_on: ['step_sm_invelire_sarmale_04'],
    // Step 6 (Renumbered from 5): Fierbere lentă
-   instruction: 'Dizolvați restul de pastă de tomate în 500-600 ml apă caldă...',
+   instruction: 'Dizolvați 40 g pastă de tomate în 550 ml apă călduță (sau supă limpede de oase)...',
-   ingredient_refs: ['pasta-tomate'],
+   ingredient_refs: ['pasta-tomate', 'lichid-fierbere-sarmale'],
+   allocations: [
+     { ingredient_id: 'pasta-tomate', quantity_used_in_step: 40, unit: 'g', component: 'sos de fierbere' },
+     { ingredient_id: 'lichid-fierbere-sarmale', quantity_used_in_step: 550, unit: 'ml', component: 'lichid de acoperire' },
+   ],
    // Step 7 (Renumbered from 6): Servire
-   depends_on: ['step_sm_fierbere_lenta_05'],
+   depends_on: ['step_sm_fierbere_lenta_06'],
  ]
```

---

## 4. Accompaniment Semantics Analysis (FIND-005A-04)

The Product Owner requested a determination whether *mămăligă*, *smântână*, and *ardei iute* belong to:
1. Recipe ingredients
2. Optional ingredients
3. Serving suggestions

### Findings & Architectural Conclusion:
- **Culinary Definition:** Sarmale are an autonomous braised dish. Mămăligă is a boiled cornmeal porridge requiring independent preparation (water, salt, cornmeal, heat). Smântână is a table condiment. Ardei iute is a fresh garnish.
- **Model Integrity:** Adding them to `ingredients` (even as `optional: true`) introduces semantic impurity:
  - Artificially inflates recipe mass calculations and nutritional baselines.
  - Generates validation anomalies (`WARN_INGREDIENT_NOT_REFERENCED`) unless artificial cooking steps for porridge preparation are injected into a cabbage roll recipe.
- **Current Model Limitation:** Recipe Core V2 has no standalone `serving_suggestions` structured entity.
- **Decision:** As instructed by the PO, **no schema alteration was introduced**, and the items were **not** added to `ingredients`. They remain explicitly preserved in the serving step instruction (`step_sm_servire_07`) and documented in `editorial_notes`.

---

## 5. Material Discrepancy Reconciliation: Boeuf Bourguignon Butter (FIND-005A-06)

### Product Owner Mandate:
> *"Address FIND-005A-06:
> * Explicitly allocate the existing 80 g butter quantity: 20 g for onions, 30 g for mushrooms, 30 g for sauce finishing.
> * Ensure ingredient allocation is consistent with the existing Recipe Core V2 model.
> * Do not change the total quantity without evidence.
> * If an unexpected schema limitation or material culinary contradiction is discovered, stop that specific correction and request Product Owner approval."*

### Factual Evidence from Repository & Approved Dossier:
1. **Actual Recipe Declaration (`src/shared/sample-data.ts:1273`):**
   ```ts
   {
     id: 'ing_bb_13',
     ingredient_id: 'unt-garnituri',
     name: 'Unt 82% grăsime',
     quantity: 60,
     unit: 'g',
     preparation: 'fracționat: 20 g glacare cepe, 25 g sotare ciuperci, 15 g monter au beurre',
   }
   ```
2. **Actual Step Allocations (`src/shared/sample-data.ts:1431, 1450, 1469`):**
   - Step 5 (`step_bb_grelots_05`): `quantity_used_in_step: 20, unit: 'g'`
   - Step 6 (`step_bb_champignons_06`): `quantity_used_in_step: 25, unit: 'g'`
   - Step 7 (`step_bb_sauce_finish_07`): `quantity_used_in_step: 15, unit: 'g'`
   - **Sum of Allocations:** $20 + 25 + 15 = 60\text{ g}$, exactly matching the 60 g declared inventory.
3. **Approved Editorial Dossier (`docs/editorial/DOSSIER_003_BOEUF_BOURGUIGNON.md:90`):**
   - Formally specifies: `| Unt 82% (pentru garnituri & finisare) | 60 g | 20 g glacare cepe + 25 g sotare ciuperci + 15 g monter au beurre |`.
   - Line 137 mentions `Unt/Ulei (80 g)`, which represents 60 g butter + 20 ml vegetable oil!
4. **Existing Regression Test (`tests/canonical-recipes-v2.test.ts:154-158`):**
   ```ts
   // Exact ingredient allocations test: unt-garnituri (20g + 25g + 15g = 60g)
   const untGarnituri = BOEUF_RECIPE.ingredients.find((i) => i.ingredient_id === 'unt-garnituri');
   assert.strictEqual(untGarnituri.quantity, 60);
   ```

### Resolution:
The finding FIND-005A-06 in the Phase 005-A report cited an informal draft breakdown (20g, 30g, 30g = 80g). However, the actual code and approved dossier have always been **60 g** with 100% explicit, validated V2 allocations.
Per the PO's conditional stop rule, altering the recipe to 80g would contradict the approved dossier, violate "*Do not change the total quantity without evidence*", and break passing canonical unit tests.
Therefore, the existing **60 g explicit allocation is confirmed and preserved intact**.

---

## 6. Verification & Test Results

### A. Deterministic Validation
- `validateRecipe(SARMALE_RECIPE)`:
  - `isValid: true`
  - `errors: 0`
  - `warnings: 0`

### B. Full Test Suite (`npm test`)
```
ℹ tests 51
ℹ suites 0
ℹ pass 51
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```
Key tests verified:
- `tests/sarmale-remediation.test.ts`:
  - 1. Deterministic Recipe Validation: 0 errors and 0 warnings (PASS)
  - 2. FIND-005A-01: Missing cooking liquid declared and allocated (PASS)
  - 3. FIND-005A-02: Tomato paste explicit allocations (30g + 40g = 70g) (PASS)
  - 4. FIND-005A-03: Sauerkraut leaf preparation step & DAG topology (PASS)
  - 5. FIND-005A-04: Accompaniment Semantics (PASS)
  - 6. Recipe Scaling calculation verification (275ml/35g at 0.5x, 1100ml/140g at 2.0x) (PASS)
  - 7. Database persistence roundtrip (PASS)
- `tests/canonical-recipes-v2.test.ts`: All 4 canonical recipes pass with 0 errors (PASS)
- `tests/user-cook-mode-acceptance.test.ts`: Full catalog of 12 recipes & Cook Mode (PASS)
- `tests/api-auth.test.ts` & `tests/production-deployment-verification.test.ts`: Private access & SQLite restart persistence (PASS)

### C. Typecheck & Build
```
npm run typecheck: 0 errors
npm run build: Vite client built in 1.22s, server bundle clean
```

---

## 7. Remaining Culinary Uncertainties

None in the remediated recipe data.
- The reference volume of 550 ml for sarmale provides adequate hydraulic coverage for 8 standard portions (~30–35 g each, clădite în 2–3 straturi) in a 5–6 L Dutch oven / clay pot without waterlogging the filling.
- The 30 g / 40 g tomato paste split balances internal acidity (which firms meat proteins) with external sauce color and nappage.

---

## 8. Git Status

```
On branch chore/integrate-agent-skills
Untracked files:
  docs/architecture/phase-5/
  tests/sarmale-remediation.test.ts
Changes not staged for commit:
  src/shared/additional-recipes.ts
  [previous Phase 004 & 005 working tree changes preserved]

standards/v1.0.0/: UNTOUCHED (git diff is clean)
No git add, commit, or push performed.
```

---

## 9. Conclusion

All authorized Phase 005-B corrections have been **successfully implemented, rigorously tested, and verified** without schema modifications, API breaks, or standards regressions.

Atlas Gastronomic is ready for Product Owner review and closure of Phase 005-B.
