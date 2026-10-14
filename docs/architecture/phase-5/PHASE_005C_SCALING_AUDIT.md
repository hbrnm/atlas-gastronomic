# ATLAS GASTRONOMIC — PHASE 005-C
## WORKSTREAM A: CULINARY SCALING AUDIT

**Protocol:** Atlas AOS  
**Phase:** 005-C — Culinary Scaling & Cook Mode Execution Validation  
**Authority:** Product Owner  
**Repository:** `Atlas-gastronomic-repo`  
**Branch:** `chore/integrate-agent-skills`  
**Evaluation Scope:** 5 Representative Recipes at $0.5\times$, $1\times$, and $2\times$ yield multipliers.

---

## 1. Executive Summary & Scaling Principles

In commercial and home kitchens, scaling recipes is **non-linear**. While the mathematical scaling model ($Q_{\text{scaled}} = Q_{\text{base}} \times \frac{S_{\text{target}}}{S_{\text{base}}}$) correctly scales raw ingredient purchasing quantities for shopping lists, it frequently produces critical culinary errors if applied naively to cooking execution:

1. **Indivisible Ingredients:** Whole eggs, egg whites, egg yolks, and bouquet garni produce impractical decimal values (e.g. 1.33 eggs, 2.5 egg whites) at small serving counts.
2. **Surface Area vs. Liquid Evaporation:** Evaporation is a function of vessel surface area ($A = \pi r^2$) and thermal exposure, **not** batch size. Scaling braising liquid linearly to $0.5\times$ in a standard pot leaves meat dry and fond burnt.
3. **Thermal Mass & Kinetic Latency:** A double batch ($2\times$) of stew or sarmale contains four to five kilograms of matter, tripling the time required to achieve a simmer, while individual pan-searing must be split into numerous sequential batches to prevent temperature drops below the Maillard threshold ($140^\circ\text{C}$).
4. **Seasoning & Salt Concentration:** Salt does not evaporate. In recipes with heavy liquid reduction (such as ragù or braising sauces), linear salt scaling combined with high surface-area evaporation in smaller batches can produce oversalted sauces.

Per Product Owner instructions:
> *"Keep the mathematical scaling model unchanged. Where linear scaling is not culinarily sufficient, identify the issue and propose a contextual advisory. Do not silently alter calculated quantities."*

---

## 2. Recipe 001: Tagliatelle al Ragù alla Bolognese (`rec_tagliatelle_ragu_001`)

- **Base Yield:** 6 porții ($1\times$) $\rightarrow$ ~1100 g ragù + ~600 g tagliatelle proaspete = ~1700 g total.
- **Reference Multipliers:** $0.5\times$ (3 porții), $1\times$ (6 porții), $2\times$ (12 porții), plus intermediate test at $0.333\times$ (2 porții).

### A. Mathematical Scaling Matrix
| Ingredient | Base ($1\times$, 6 porții) | $0.5\times$ (3 porții) | $0.333\times$ (2 porții) | $2\times$ (12 porții) | Unit | Culinary Notes / Physical Behavior |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| Carne tocată vită | 400 | 200 | 133.3 | 800 | g | Scales linearly. At $2\times$, requires 2 separate searing batches. |
| Pancetta proaspătă | 150 | 75 | 50 | 300 | g | Linear. |
| Mirepoix (Morcov, Țelină, Ceapă) | 60 / 60 / 60 | 30 / 30 / 30 | 20 / 20 / 20 | 120 / 120 / 120 | g | Linear. |
| Vin alb sec | 100 | 50 | 33.3 | 200 | ml | Rapid flash-evaporation in large pan at $0.5\times$. |
| Passata de roșii | 200 | 100 | 66.7 | 400 | g | Linear. |
| Lapte integral | 100 | 50 | 33.3 | 200 | ml | Added at end of ragù braise; scales well. |
| Fond de vită / supă | 200 | 100 | 66.7 | 400 | ml | **Non-linear risk:** 100 ml dries out prematurely in a 24 cm pot. |
| Ulei de măsline | 15 | 7.5 | 5 | 30 | ml | Linear. |
| Făină 00 (paste) | 400 | 200 | 133.3 | 800 | g | Standard Italian pasta ratio (100 g flour per 1 egg). |
| Ouă mari proaspete | **4 buc** | **2 buc** | **1.33 buc** | **8 buc** | buc | **Indivisible failure at 2 portions:** 1.33 eggs is unworkable without liquid egg weighing (~73 g). |
| Sare fină | 10 | 5 | 3.3 | 20 | g | Linear. |
| Sare grunjoasă (apă paste) | 30 | 15 | 10 | 60 | g | Dependent on water volume, not portions (10 g per 1 L water). |
| Parmigiano Reggiano 24 luni | 60 | 30 | 20 | 120 | g | Linear table grating. |

### B. Identified Scaling Defects & Contextual Advisories
1. **Fractional Egg Advisory (2 portions):** At 2 servings, 1.33 eggs cannot be cracked directly.
   - *Advisory:* *"La 2 porții de paste proaspete, folosiți 1 ou întreg mare plus 1 gălbenuș (total ~70–75 g lichid) sau bateți 2 ouă într-un bol și cântăriți 73 g de ou omogenizat."*
2. **Liquid Evaporation Advisory (3 portions / $0.5\times$):** 100 ml broth boils away in under 45 minutes in a wide Dutch oven.
   - *Advisory:* *"La prepararea a 3 porții de ragù, folosiți o cratiță cu diametru redus (16–18 cm) și mențineți capacul bine etanșat; completați cu 50–75 ml supă dacă sosul scade prea devreme."*
3. **Pasta Water Pot Capacity ($2\times$):** Cooking 1.2 kg fresh pasta requires at least 8–10 L boiling water. Cooking in a standard 4 L pot drops water temperature, washing off surface starch into a gummy paste.

---

## 3. Recipe 002: Risotto alla Milanese Tradizionale (`rec_risotto_milanese_002`)

- **Base Yield:** 4 porții ($1\times$) $\rightarrow$ ~900 g masă finală.
- **Reference Multipliers:** $0.5\times$ (2 porții), $1\times$ (4 porții), $2\times$ (8 porții).

### A. Mathematical Scaling Matrix
| Ingredient | Base ($1\times$, 4 porții) | $0.5\times$ (2 porții) | $2\times$ (8 porții) | Unit | Culinary Notes / Physical Behavior |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Orez Carnaroli / Vialone | 320 | 160 | 640 | g | 80 g per serving is canonical Italian standard. |
| Măduvă proaspătă de vită | 25 | 12.5 | 50 | g | Linear. |
| Ceapă albă tocată fin | 40 | 20 | 80 | g | Linear. |
| Vin alb sec | 60 | 30 | 120 | ml | Linear *sfumatura*. |
| Șofran veritabil (pistiluri) | **0.15** | **0.075** | **0.30** | g | **Micro-quantity problem:** 0.075 g cannot be weighed by standard kitchen scales. |
| Fond de vită fierbinte | 1200 | 600 | 2400 | ml | **Non-linear absorption:** Surface evaporation rate is constant. |
| Unt rece 82% | 60 | 30 | 120 | g | 20g sofregit / 40g mantecatura (at $1\times$). |
| Grana Padano / Parmigiano | 60 | 30 | 120 | g | Linear. |
| Sare fină | 4 | 2 | 8 | g | Must account for salinity of simmering broth. |

### B. Identified Scaling Defects & Contextual Advisories
1. **Saffron Measurement ($0.5\times$):** Home scales resolution is 1 g (rarely 0.1 g).
   - *Advisory:* *"La 2 porții, utilizați aproximativ 30–40 stamine de șofran (jumătate dintr-un pliculeț standard de 0.15 g) infuzate în 50 ml fond călduț."*
2. **Pan Geometry & Tostatura ($2\times$, 8 portions):** 640 g rice creates a layer 3–4 cm deep in a standard 28 cm pan. The lower layer scorches while upper grains remain un-toasted.
   - *Advisory:* *"Pentru 8 porții de risotto, folosiți un rondeau profesional de 36–40 cm sau gătiți orezul în două tigăi paralele de 28 cm. Emulsionarea (mantecatura all'onda) pentru peste 2 kg de risotto depășește manevrabilitatea casnică într-o singură tigaie."*

---

## 4. Recipe 003: Boeuf Bourguignon Tradițional (`rec_boeuf_bourguignon_003`)

- **Base Yield:** 6 porții ($1\times$) $\rightarrow$ ~2300 g masă finală.
- **Reference Multipliers:** $0.5\times$ (3 porții), $1\times$ (6 porții), $2\times$ (12 porții).

### A. Mathematical Scaling Matrix
| Ingredient | Base ($1\times$, 6 porții) | $0.5\times$ (3 porții) | $2\times$ (12 porții) | Unit | Culinary Notes / Physical Behavior |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Carne vită paleron | 1200 | 600 | 2400 | g | Cuburi regulate de 4–5 cm (~50 g). |
| Lardons blanșați | 200 | 100 | 400 | g | Linear. |
| Mirepoix (Morcov, Ceapă) | 150 / 150 | 75 / 75 | 300 / 300 | g | Linear. |
| Usturoi zdrobit | 15 | 7.5 | 30 | g | ~3 căței mari la $1\times$. |
| Făină albă T55 | 35 | 17.5 | 70 | g | Tehnica *singer*. |
| Vin roșu Pinot Noir | 750 | 375 | 1500 | ml | 1 sticlă întreagă la $1\times$. 375 ml = jumătate de sticlă. |
| Fond brun de vită | 500 | 250 | 1000 | ml | Linear ratio. |
| Pastă de tomate | 30 | 15 | 60 | g | Linear. |
| Bouquet garni | **1 buc** | **1 buc** | **2 buc** | buc | **Indivisible unit:** Do not split a herb bundle in half. |
| Cepe perlate grelots | 300 | 150 | 600 | g | Linear. |
| Unt 82% garnituri | 60 | 30 | 120 | g | 20g cepe / 25g ciuperci / 15g sauce finish ($1\times$). |
| Ciuperci Paris | 350 | 175 | 700 | g | Sautéed in batches at $2\times$ to avoid boiling. |
| Ulei neutru | 20 | 10 | 40 | ml | Linear. |
| Sare / piper | 10 | 5 | 20 | g | Linear. |

### B. Identified Scaling Defects & Contextual Advisories
1. **Critical Braising Depth ($0.5\times$):** In a standard 26 cm Dutch oven, 375 ml wine + 250 ml stock creates a bath only ~1.5 cm deep. The 50 g beef cubes will protrude above the liquid and dry out during 2.5 hours in the oven.
   - *Advisory:* *"La 3 porții de Boeuf Bourguignon, folosiți o cocotte mică de 18–20 cm pentru a asigura imersia cărnii până la 2/3 din înălțime. Într-un vas larg, mențineți un volum minim de lichid de 500 ml pentru a preveni evaporarea completă."*
2. **Searing Batch Proliferation ($2\times$):** Searing 2.4 kg beef without overcrowding requires 6–8 distinct batches, extending active stovetop time by 30+ minutes.
   - *Advisory:* *"La 12 porții, rumenirea celor 2.4 kg de carne se realizează în 6 tranșe succesive (câte 400 g) sau în două cratițe grele simultan. Timpul de înăbușire la cuptor (2.5 ore) rămâne identic odată ce vasul atinge 88–92°C."*

---

## 5. Recipe 004: Soufflé Chaud au Fromage (`rec_souffle_fromage_004`)

- **Base Yield:** 4 ramekin-uri ($1\times$) $\rightarrow$ ~670 g masă finală.
- **Reference Multipliers:** $0.5\times$ (2 porții), $1\times$ (4 porții), $2\times$ (8 porții).

### A. Mathematical Scaling Matrix
| Ingredient | Base ($1\times$, 4 ramekins) | $0.5\times$ (2 ramekins) | $2\times$ (8 ramekins) | Unit | Culinary Notes / Physical Behavior |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Unt roux | 45 | 22.5 | 90 | g | Small volumes scorch easily in large saucepans. |
| Unt chemisage | 20 | 10 | 40 | g | Linear. |
| Făină albă T55 | 45 | 22.5 | 90 | g | Linear roux blanc. |
| Lapte integral | 300 | 150 | 600 | ml | Linear. |
| Gălbenușuri mari | **4 buc** | **2 buc** | **8 buc** | buc | Linear. |
| Albușuri mari | **5 buc** | **2.5 buc** | **10 buc** | buc | **Critical $N+1$ egg white rule violation at $0.5\times$!** |
| Comté AOP 18 luni | 120 | 60 | 240 | g | 100g compoziție / 20g chemisage ($1\times$). |
| Nucșoară / Piper alb | 1 / 1 | 0.5 / 0.5 | 2 / 2 | g | Pinch scaling. |
| Cremă de tartru | 1 | 0.5 | 2 | g | Stabilizes albumin foam. |

### B. Identified Scaling Defects & Contextual Advisories
1. **Asymmetric Egg Whites Rule ($0.5\times$):** 2.5 egg whites is physically impossible without discarding half an egg white. Classical culinary pastry rules mandate **3 egg whites** for 2 individual soufflés ($N+1$ rule: $2\text{ yolks} + 3\text{ whites}$).
   - *Advisory:* *"La 2 ramekin-uri individuale, folosiți 2 gălbenușuri și 3 albușuri întregi (rotunjire superioară conform regulii clasice N+1). Reducerea la 2 albușuri compromite ascensiunea verticală a sufleului."*
2. **Oven Geometry & Serving Immediacy ($2\times$, 8 ramekins):**
   - *Advisory:* *"8 forme de soufflé trebuie așezate pe un singur grătar la nivelul central al cuptorului. Nu coaceți pe două niveluri diferite (căldura radiantă inegală va arde sufleurile superioare). Pregătiți din timp servirea: fereastra optimă de degustare este de maximum 180 de secunde de la deschiderea cuptorului."*

---

## 6. Recipe 012: Sarmale Tradiționale în Foi de Varză Murată (`rec_sarmale_traditionale_012`)

- **Base Yield:** 8 porții ($1\times$) $\rightarrow$ ~2400 g masă finală (~35–40 sarmale medii).
- **Reference Multipliers:** $0.5\times$ (4 porții), $1\times$ (8 porții), $2\times$ (16 porții).

### A. Mathematical Scaling Matrix
| Ingredient | Base ($1\times$, 8 porții) | $0.5\times$ (4 porții) | $2\times$ (16 porții) | Unit | Culinary Notes / Physical Behavior |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Carne tocată amestec | 800 | 400 | 1600 | g | Linear. |
| Varză murată căpățână | 1500 | 750 | 3000 | g | ~1 căpățână mică la $0.5\times$, 2 căpățâni mari la $2\times$. |
| Orez bob rotund | 100 | 50 | 200 | g | Linear. |
| Ceapă galbenă | 200 | 100 | 400 | g | Linear. |
| Costiță afumată | 200 | 100 | 400 | g | Linear. |
| Pastă de tomate | 70 | 35 | 140 | g | 30g umplutură / 40g lichid la $1\times$ $\rightarrow$ 15g/20g la $0.5\times$. |
| Cimbru și mărar uscat | 10 | 5 | 20 | g | Linear. |
| Ulei de floarea-soarelui | 40 | 20 | 80 | ml | Linear. |
| Sare / piper | 5 | 2.5 | 10 | g | Linear. |
| Apă călduță / supă oase | 550 | 275 | 1100 | ml | **Pot capacity constraint at $0.5\times$ and $2\times$.** |

### B. Identified Scaling Defects & Contextual Advisories
1. **Pot Diameter & Liquid Coverage ($0.5\times$, ~18 sarmale):** In a standard 5–6 L clay pot, 18 sarmale only cover the bottom in a single sparse layer. 275 ml liquid will not submerge them.
   - *Advisory:* *"La 4 porții (circa 18 sarmale), alegeți o oală de lut ars sau fontă mai mică (2.5–3 litri) pentru ca sarmalele să stea strânse în două straturi, iar lichidul să le acopere complet."*
2. **Thermal Inertia & Rolling Labor ($2\times$, ~75 sarmale):**
   - *Advisory:* *"Rularea a 75 de sarmale necesită circa 50–60 de minute de lucru activ. Oala de 10–12 litri plină cu 5 kg de sarmale și lichid necesită 45 de minute suplimentare la cuptor pentru a atinge temperatura internă de fierbere lentă (bare simmer 90–95°C)."*

---

## 7. Comparative Scaling Synthesis Table

| Recipe ID | Critical Indivisible Ingredient | Small Batch ($0.5\times$) Vulnerability | Large Batch ($2\times$) Vulnerability | Cooking Time Multiplier ($2\times$) |
| :--- | :--- | :--- | :--- | :---: |
| `rec_tagliatelle_ragu_001` | Ouă proaspete (4 buc) | Ragù dries out in wide pot; 1.33 eggs at 2 port. | Kneading 800g dough; 8-10 L pasta water pot | $1.0\times$ (Ragù braise time unchanged) |
| `rec_risotto_milanese_002` | Șofran pistiluri (0.15 g) | Micro-quantity ($0.075\text{ g}$) unweighable | Overcrowding pan disrupts tostatura & wave-mantecatura | $1.0\times$ (Rice starch gelatinization is 16-18 min) |
| `rec_boeuf_bourguignon_003` | Bouquet Garni (1 buc) | Liquid depth $<2\text{ cm}$ leads to scorched fond | 6-8 searing batches; 10 L Dutch oven required | $1.0\times$ (Collagen hydrolysis requires 2.5h) |
| `rec_souffle_fromage_004` | Albușuri ou ($N+1$ rule) | 2.5 egg whites fails; requires 3 whites | Two-tier oven baking ruins rise; 180s serving rush | $1.0\times$ (Radiant baking is 20-22 min) |
| `rec_sarmale_traditionale_012` | Varză murată căpățână | 18 sarmale cannot submerge in 6 L pot | 60 min rolling time; thermal mass delay (+45 min) | $1.25\times$ (Extra thermal ramp-up time) |

---

## 8. Conclusion for Workstream A

1. The mathematical scaling engine in `RecipeDetail.tsx` is mathematically sound and must remain untouched.
2. The identified defects can be completely resolved by injecting **Contextual Scaling Advisories** in the editorial notes and UI when users deviate from the canonical $1\times$ base yield.
