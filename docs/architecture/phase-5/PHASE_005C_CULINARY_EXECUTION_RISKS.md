# ATLAS GASTRONOMIC — PHASE 005-C
## WORKSTREAM C & D: TIMING, EQUIPMENT & CULINARY EXECUTION RISKS

**Protocol:** Atlas AOS  
**Phase:** 005-C — Culinary Scaling & Cook Mode Execution Validation  
**Authority:** Product Owner  
**Repository:** `Atlas-gastronomic-repo`  
**Branch:** `chore/integrate-agent-skills`  
**Scope:** Timing Decomposition, Equipment Constraints, and Failure-Point Prevention across the 5 Representative Recipes.

---

## 1. Timing Decomposition Matrix

In classical gastronomy, failing to distinguish between hands-on preparation time, active stove attention, and autonomous oven braising is the leading cause of home kitchen failure.

| Recipe ID | Recipe Title | Preparation Time | Active Cooking Time | Passive Cooking Time | Resting / Lead Time | Total Elapsed Time |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `rec_tagliatelle_ragu_001` | Tagliatelle al Ragù alla Bolognese | 35 min (mirepoix, kneading, rolling) | 45 min (searing, sautéeing, pasta boiling) | 120 min (bare simmer ragù) | 30 min (dough autolyse/rest) | **230 min** (3h 50m) |
| `rec_risotto_milanese_002` | Risotto alla Milanese Tradizionale | 15 min (onion fine dice, marrow prep) | 25 min (tostatura, gradual stock, mantecatura) | 0 min (demands continuous attention) | 2 min (rest before serving) | **42 min** |
| `rec_boeuf_bourguignon_003` | Boeuf Bourguignon Tradițional | 25 min (trimming, lardon blanching) | 65 min (searing batches, sauce reduction) | 150 min (oven braisage 150°C) | 24 hours (optional cold maturation) | **240 min** (4h 00m) |
| `rec_souffle_fromage_004` | Soufflé Chaud au Fromage | 15 min (chemisage, cheese grating, egg separating) | 15 min (roux blanc, béchamel, egg foam folding) | 20 min (static radiant oven 190°C) | 0 min (immediate 180s service) | **55 min** |
| `rec_sarmale_traditionale_012` | Sarmale Tradiționale în Foi de Varză Murată | 40 min (leaf deribbing, desalting, filling, rolling) | 25 min (onion/rice sauté, clay pot arrangement) | 180 min (slow braise 150°C) | 15 min (cooling/settling) | **245 min** (4h 05m) |

---

## 2. Equipment-Dependent Physical Constraints

Cooking times and thermal kinetics are governed by vessel geometry and heat transfer physics:

```
                      ┌────────────────────────────────────────┐
                      │          HEAT SOURCE / FLAME           │
                      └──────────────────┬─────────────────────┘
                                         ▼
                             ┌───────────────────────┐
                             │    VESSEL MATERIAL    │
                             │ (Cast Iron / Copper / │
                             │   Enameled / Clay)    │
                             └───────────┬───────────┘
                                         ▼
                     ┌───────────────────┴───────────────────┐
                     ▼                                       ▼
        ┌─────────────────────────┐             ┌─────────────────────────┐
        │  SURFACE AREA (π r²)    │             │   LIQUID DEPTH (h)      │
        │ - Maillard Reactions    │             │ - Collagen Hydrolysis   │
        │ - Steam Dissipation     │             │ - Hydrostatic Pressure  │
        │ - Evaporation Rate      │             │ - Bare Simmer Stability │
        └─────────────────────────┘             └─────────────────────────┘
```

### 1. Pot / Pan Geometry Constraints
- **Cocotte / Dutch Oven (`rec_boeuf_bourguignon_003` & `rec_tagliatelle_ragu_001`):**
  - Minimum vessel volume: 5.0–6.0 L with heavy enameled cast-iron lid.
  - Surface requirement: 24–26 cm interior diameter. A pot narrower than 22 cm forces meat to pile in layers, creating excessive hydrostatic pressure that inhibits surface Maillard caramelization.
  - Braising liquid level: The liquid must submerge the beef cubes to $2/3$ or $3/4$ of their height.
- **Rondeau / Skillet (`rec_risotto_milanese_002`):**
  - Pan requirement: Wide stainless steel or copper-lined skillet (28–30 cm) with straight or flared walls (5–7 cm high).
  - Physical constraint: Rice depth during *tostatura* must not exceed 1.0–1.5 cm (single to double grain layer) to permit radiant and conductive heat absorption across every grain.
- **Clay Pot (*Oală de Lut Ars*) (`rec_sarmale_traditionale_012`):**
  - Porous, unglazed or interior-glazed clay creates slow, gentle, uniform thermal radiation without hot spots.
  - Volume requirement: 5.0–6.0 L. Cabbage rolls must be packed in tight concentric circles to prevent unraveling under convective thermal bubbling.
- **Soufflé Ramekins (`rec_souffle_fromage_004`):**
  - Glazed ceramic ramekins with vertical, un-tapered $90^\circ$ walls (volume 180–200 ml, diameter 9 cm). Tapered or fluted molds create frictional resistance against the ascending egg foam.

---

## 3. Recipe-Specific Failure Points & Prevention Efficacy

### Recipe 001: Tagliatelle al Ragù alla Bolognese
| Failure Point | Physical / Chemical Mechanism | Current Instruction Mitigation | Status |
| :--- | :--- | :--- | :---: |
| **Boiling Meat in Juice** | Overcrowding cold meat causes pan temperature to drop $<100^\circ\text{C}$, releasing water. | Step 3: Enforces high heat ($140-165^\circ\text{C}$) and stirring until juices evaporate completely before wine. | **PREVENTED** |
| **Milk Curdling** | Adding cold milk directly to acidic, wine-heavy simmering liquid causes casein coagulation into unsightly white flecks. | Step 4 & 5: Wine is evaporated completely first; milk is added and simmered until absorbed before long tomato reduction. | **PREVENTED** |
| **Pasta Dough Tearing** | Insufficient resting (hydration latency) leaves gluten matrix stiff and brittle during rolling. | Step 6: Explicitly mandates minimum 30-minute plastic-wrapped dough autolyse/rest at room temperature. | **PREVENTED** |
| **Starch-Fat Separation** | Draining pasta dry and dumping ragù on top prevents emulsion. | Step 8: Mandates transferring al dente pasta directly into the ragù pan with 2–3 tbsp starchy pasta water (*salto in padella*). | **PREVENTED** |

---

### Recipe 002: Risotto alla Milanese Tradizionale
| Failure Point | Physical / Chemical Mechanism | Current Instruction Mitigation | Status |
| :--- | :--- | :--- | :---: |
| **Thermal Shock of Stock** | Pouring cold or lukewarm stock stops the simmer, chilling starch granules and resulting in a chalky grain core. | Step 5: Enforces keeping beef stock at a continuous gentle simmer ($85-95^\circ\text{C}$) in an adjacent burner. | **PREVENTED** |
| **Grain Rupture (Over-stirring)** | Violent, continuous whisking shears delicate starch branches off the rice kernel, causing mushy wallpaper-paste texture. | Step 5: Instructs gentle stirring with a flat wooden spatula only when adding a new ladle of stock. | **PREVENTED** |
| **Greasy, Broken Mantecatura** | Adding warm or melted butter over high flame separates milk fat from water phase into an oily slick. | Step 6: Mandates removing pan completely from heat, waiting 60s, and incorporating **ice-cold butter cubes** with Parmigiano (*all'onda*). | **PREVENTED** |

---

### Recipe 003: Boeuf Bourguignon Tradițional
| Failure Point | Physical / Chemical Mechanism | Current Instruction Mitigation | Status |
| :--- | :--- | :--- | :---: |
| **Toughened Meat (Rapid Boiling)** | Simmering liquid $>95^\circ\text{C}$ tightens actin/myosin fibers irreversibly before collagen can hydrolyze into gelatin. | Step 4: Restricts oven temperature to 150°C and core liquid to bare simmer ($88-92^\circ\text{C}$) with an `irreversible_risk` warning. | **PREVENTED** |
| **Lumpy Sauce (*Singer* Failure)** | Pouring liquid into dry raw flour forms insoluble clumps. | Step 3: Prescribes cooking flour on the seared meat for 2 minutes to toast and coat with fat before pouring warm wine and broth. | **PREVENTED** |
| **Greasy, Muddy Stew** | Failure to degrease (*dégraissage*) leaves rendered lardon/beef fat emulsified in the sauce. | Step 7: Instructs straining sauce through a chinois, skimming surface fat, and reducing separately to a glossy *nappe*. | **PREVENTED** |

---

### Recipe 004: Soufflé Chaud au Fromage
| Failure Point | Physical / Chemical Mechanism | Current Instruction Mitigation | Status |
| :--- | :--- | :--- | :---: |
| **Scrambled Egg Yolks** | Incorporating yolks into hot béchamel ($>65^\circ\text{C}$) denatures yolk proteins into grainy yellow scrambled egg bits. | Step 3: Thermal constraint enforces cooling béchamel to $\le 55^\circ\text{C}$ before adding yolks (`quality_threshold`). | **PREVENTED** |
| **Foam Collapse by Fat** | Trace amounts of fat ($>0.03\%$) from yolk or greasy utensils destabilize protein film around air bubbles. | Step 4: Mandates degreased stainless steel bowl, pinch of cream of tartar, and spotless egg separation with `culinary_quality` warning. | **PREVENTED** |
| **Asymmetrical Rising (Stuck Edge)** | Horizontal buttering or rough edges catch the batter, causing tilted or burst soufflés. | Step 1: Enforces vertical brushing (chemisage de bas en haut) with cold butter and Comté, plus running a thumb around the top rim. | **PREVENTED** |
| **Mid-Bake Collapse** | Opening the oven door introduces cold air, causing rapid contraction of expanding trapped steam. | Step 7: Strict warning never to open the oven door during the first 18 minutes of radiant baking at 190°C. | **PREVENTED** |

---

### Recipe 012: Sarmale Tradiționale în Foi de Varză Murată
| Failure Point | Physical / Chemical Mechanism | Current Instruction Mitigation | Status |
| :--- | :--- | :--- | :---: |
| **Unpalatable Salinity / Sourness** | Commercial pickled sauerkraut salinity varies between 2% and 5% NaCl; un-soaked cabbage overwhelms meat. | Step 2 (Added in 005-B): Mandates tasting raw leaf and soaking in warm water for 15–30 min if excessively sour or salty. | **PREVENTED** |
| **Burnt Bottom Layer** | Prolonged 3-hour bottom contact with direct heat scorches meat rolls. | Step 5: Instructs laying a protective bed of finely shredded cabbage leaves at the bottom of the clay pot. | **PREVENTED** |
| **Desiccation of Top Rolls** | Liquid evaporating below cabbage level leaves top rolls tough, dry, and blackened. | Step 6: 550 ml liquid covers top layer; pot is sealed with lid and slow-cooked in oven at 150°C. | **PREVENTED** |

---

## 4. Conclusion for Workstreams C & D

1. The technical instructions, thermal constraints, and warning taxonomies implemented in Recipe Core V2 successfully identify and mitigate the authentic failure points across all 5 canonical recipes.
2. Vessel and equipment dimensions are critical factors in recipe success and are thoroughly addressed in the equipment declarations and step cues.
