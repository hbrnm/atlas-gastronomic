# ATLAS RECIPE CORE STRESS TEST 003: COMPATIBILITY AUDIT REPORT

**Subiect:** Evaluarea Compatibilității Arhitecturale a Recipe Core V1 cu Rețeta Canonică de *Boeuf Bourguignon*  
**Etapă:** Phase 002-B — Domain Generalization & Recipe Core V1 Compatibility Audit  
**Data:** 2026-10-14  
**Autoritate:** Product Owner Mandate  
**Repository:** `hbrnm/atlas-gastronomic`  
**Git Working Tree:** `Atlas-gastronomic-repo`  
**Branch:** `chore/integrate-agent-skills`  
**Baseline HEAD Commit:** `dc8dd75395049a9599ecbde83fa5015a6f07190e`  
**Canonical Standards:** `standards/v1.0.0/` — **FROZEN / IMMUTABLE**  

---

## 1. Rezumat Executiv și Clasificare Generală

Stress Test 003 supune arhitectura Recipe Core V1 unui test de efort pe domeniul **preparatelor de lungă durată din categoria înăbușirii lente (*long-duration braising*), caracterizate prin transformări fizico-chimice complexe, piste paralele de gătire a garniturilor, gestionarea separării/reducerii/reasamblării sosului și cicluri temporale multi-sesiune (J+1)**.

Spre deosebire de Risotto alla Milanese (TEST 002), care este un proces concentrat pe durata a 40 de minute într-o singură cratiță, Boeuf Bourguignon implică:
* Gestionarea mai multor vase simultane (*cocotte* pentru carne, cratiță mică pentru glacarea cepelor, tigaie încinsă pentru ciuperci);
* Piste procedurale paralele și asincrone;
* Sub-rețete / garnituri clasice independente (*Garniture Bourguignonne*);
* Separarea fizică a sosului de carne, degresarea lui, filtrarea mecanică și reducerea termică urmată de reasamblare;
* Un orizont temporal de 4 ore pe calea critică în Ziua 1, plus o etapă recomandată de maturare la rece de 24 de ore (Ziua 2).

### Clasificare Generală a Compatibilității: **PARTIALLY SUPPORTED (CU LIMITĂRI STRUCTURALE MAJORE)**

```
================================================================================
STRESS TEST 003 EVALUATION MATRIX & EVIDENTIARY STATUS
================================================================================
1. Multi-Session / Multi-Day Lifecycle:  NOT SUPPORTED       [Documented code inspection]
2. Independent Preparation Tracks:       PARTIALLY SUPPORTED [Documented code inspection]
3. Sequential Dependencies & Artifacts:  PARTIALLY SUPPORTED [Documented code inspection]
4. Parallel Garnish Execution (DAG):     NOT SUPPORTED       [Documented code inspection]
5. Ingredient State Transformations:     NOT SUPPORTED       [Documented code inspection]
6. Multi-Stage Ingredient Allocation:    PARTIALLY SUPPORTED [Documented code inspection]
7. Long-Term Liquid & Mass Balance:      PARTIALLY SUPPORTED [Documented code inspection]
8. Sauce Separation / Recombination:     NOT SUPPORTED       [Documented code inspection]
9. Temporal Modeling (Active vs Passive): PARTIALLY SUPPORTED [Documented code inspection]
10. Deterministic Validation Engine:     PASS                [Demonstrated by automated tests]
11. Persistence Layer (SQLite):          PASS                [Demonstrated by automated tests]
12. Cooking UX & Workstation Guidance:   NOT SUPPORTED       [Documented code inspection]
================================================================================
```

---

## 2. Răspunsul la Cele 10 Întrebări de Compatibilitate Recipe Core V1

### Întrebarea 1: Poate V1 reprezenta o preparare care începe cu multe ore sau o zi înainte de gătire (multi-sesiune)?
* **Verdict:** **NOT SUPPORTED**
* **Analiză în cod:** Schema `RecipeTiming` din `src/shared/types.ts` conține doar două numere întregi scalare: `active_minutes: number | null` și `total_minutes: number | null`. Nu există conceptul de `session_id`, `calendar_days`, `overnight_rest_minutes`, `preparation_stage` sau `lead_time_hours`.
* **Consecință culinară:** Dacă se include maturarea la rece (24 ore = 1.440 min), `total_minutes` ar deveni 1.680 min (28 de ore), sugerând fals utilizatorului sau motorului de căutare că rețeta cere 28 de ore de gătire continuă. Dacă se omit cele 24 de ore, se pierde instrucțiunea tehnică esențială de maturare și degresare la rece.
* **Workaround actual:** Menționarea exclusiv textuală în `editorial_notes` sau în corpul pasului final.

### Întrebarea 2: Poate V1 reprezenta sarcini multiple de pregătire independente?
* **Verdict:** **PARTIALLY SUPPORTED**
* **Analiză în cod:** Ingredientele pot fi grupate prin câmpul `group: string | null` (ex: `group: "Garnitură ciuperci"`, `group: "Bază carne"`). Totuși, pașii `RecipeStep` sunt stocați într-o listă strict liniară (`step_number: 1..N`).
* **Consecință culinară:** Sarcinile independente (ex: blanșarea lardonilor, curățarea cepelor perlate, fasonarea cărnii) trebuie forțate într-o secvență liniară arbitrară, deși bucătarul le poate executa în orice ordine sau le poate delega unui comisioner.

### Întrebarea 3: Poate V1 reprezenta operațiuni secvențiale cu dependențe stricte?
* **Verdict:** **PARTIALLY SUPPORTED**
* **Analiză în cod:** Liniaritatea `1..N` impune o succesiune ordinală, dar nu există un graf de dependențe explicite (`depends_on: step_id[]`).
* **Consecință culinară:** Modelul nu poate distinge între o dependență fizică strictă (deplasarea cărnii este imposibilă fără rumenirea prealabilă) și o simplă succesiune editorială convenabilă.

### Întrebarea 4: Poate V1 reprezenta operațiuni paralele (prepararea garniturilor în timpul înăbușirii cărnii)?
* **Verdict:** **NOT SUPPORTED**
* **Analiză în cod:** În `src/shared/types.ts`, `steps` este un array plat. În `src/shared/validation.ts`, se verifică strict `step.step_number === index + 1`. Nu există suport pentru piste paralele concurente (*swimlanes* sau sub-pași paraleli).
* **Consecință culinară:** În timp ce carnea este în cuptor timp de 150 de minute, bucătarul trebuie să prepare cepele glacate și ciupercile sotate. În V1, aceste etape trebuie plasate fie înainte de băgarea la cuptor (ceea ce prelungește artificial timpul activ inițial), fie după scoaterea cărnii (ceea ce răcește carnea și prelungește inutil timpul total), fie înghesuite confuz într-un pas-mamut narativ.

### Întrebarea 5: Poate V1 reprezenta ingrediente care își schimbă starea fizică sau compoziția chimică prin proces?
* **Verdict:** **NOT SUPPORTED**
* **Analiză în cod:** Un ingredient este declarat o singură dată ca entitate statică în `RecipeIngredient` (cu `name`, `quantity`, `unit`).
* **Consecință culinară:** Carnea de vită crudă (bogată în colagen insolubil) devine carne rumenită (cu crustă Maillard), apoi carne înăbușită fondantă (cu colagen hidrolizat în gelatină). Vinul roșu lichid devine deglasare acidă, apoi componentă de sos redus. În V1, aceeași entitate `carne-vita` este referită identic la început și la sfârșit, fără ca sistemul să înțeleagă generarea unui nou intermediar.

### Întrebarea 6: Poate V1 reprezenta ingrediente introduse în etape diferite?
* **Verdict:** **PARTIALLY SUPPORTED**
* **Analiză în cod:** Câmpul `step.ingredient_refs: string[]` permite asocierea unui `ingredient_id` cu un anumit pas.
* **Limitare confirmată:** Dacă un ingredient este folosit în tranșe (ex: 60 g unt împărțit în: 20 g glacare cepe, 25 g sotare ciuperci, 15 g *monter au beurre*), schema V1 nu permite alocarea cantităților pe pași (`quantity_used_in_step`).
* **Workaround actual:** Se declară fie 3 ingrediente separate cu slug-uri artificiale (`unt-cepe`, `unt-ciuperci`, `unt-finisare`), fie se specifică fracționarea doar în textul instrucțiunii.

### Întrebarea 7: Poate V1 gestiona adăugările și pierderile de lichid pe o perioadă lungă (evaporare, degresare)?
* **Verdict:** **PARTIALLY SUPPORTED**
* **Analiză în cod:** `RecipeYield` are doar `approx_final_weight_g: number | null`. Nu există bilanț dinamic de lichide, rată de evaporare per oră sau deducere a grăsimilor eliminate prin *dégraissage*.
* **Consecință culinară:** Se pierd ~500–600 g apă prin evaporare și ~150 g grăsime eliminată manual. Modelul V1 nu poate calcula sau valida randamentul intermediar al sosului.

### Întrebarea 8: Poate V1 reprezenta un sos separat, redus și recombinat?
* **Verdict:** **NOT SUPPORTED**
* **Analiză în cod:** Nu există entitatea de **rezultat intermediar / produs de proces (*Intermediate Artifact / Composite Output*)**.
* **Consecință culinară:** La Pasul 6, carnea se scoate, legumele uzate din mirepoix se aruncă prin sită, iar sosul lichid brut devine un element de sine stătător care se reduce pe foc și se finisează cu unt. În V1, acest sos nu are o identitate modelabilă; el poate fi descris doar narativ în textul instrucțiunii.

### Întrebarea 9: Poate V1 calcula timpul activ, pasiv și cel nesupravegheat fără dublă numărare?
* **Verdict:** **PARTIALLY SUPPORTED**
* **Analiză în cod:** Modelul permite setarea `active_minutes: 90` și `total_minutes: 240`.
* **Limitare confirmată:** Suma duratelor pas cu pas (`step.duration_minutes`) devine ambiguă când există pași paraleli. Dacă pasul de glacare a cepelor (25 min) și cel de sotare a ciupercilor (15 min) au durate setate în pași separați, o sumare naivă a pașilor ar genera $150 + 25 + 15 + \dots = 280\text{ min}$, depășind timpul total de 240 de minute pe calea critică.

### Întrebarea 10: Poate V1 reprezenta o rețetă cu desfășurare pe mai multe zile calendaristice?
* **Verdict:** **NOT SUPPORTED**
* **Analiză în cod:** Același blocaj structural ca la Întrebarea 1: schema este complet ignorantă la conceptul de pauze de proces peste noapte (*overnight rest / multi-day workflows*).

---

## 3. Auditul Detaliat al Cerințelor și Trasabilitatea Structurilor V1

Pentru fiecare dimensiune evaluată, tabelul de mai jos leagă direct cerința culinară de structura tehnică inspectată în codul V1 (`src/shared/types.ts`, `src/shared/validation.ts`, `standards/v1.0.0/schemas/recipe.schema.json`):

| Cerință Culinară | Exemplu Concret în Boeuf Bourguignon | Structură Tehnică V1 Inspectată | Clasificare V1 | Comportament Suportat vs. Limitare Semantică |
| :--- | :--- | :--- | :---: | :--- |
| **Piste Paralele de Execuție (DAG)** | Glacarea cepelor (25m) și sotarea ciupercilor (15m) în paralel cu braisage-ul (150m). | `Recipe.steps: RecipeStep[]` (array plat indexat `1..N`) | **NOT SUPPORTED** | **Limitare:** Modelul impune un singur fir secvențial. Nu există suport pentru grafuri aciclice dirijate (DAG) sau piste concurente (*swimlanes*). Forțează compactarea confuză a pistelor paralele într-un singur flux liniar. |
| **Dependențe de Proces și Condiții de Stare** | Filtrarea și degresarea sosului sunt posibile doar după finalizarea braisage-ului. | `RecipeStep.step_number` | **NOT SUPPORTED** | **Limitare:** Nu există câmp de tip `depends_on: step_id[]`. Relația de dependență cauzală este exprimată exclusiv informal în textul instrucțiunii. |
| **Model Temporal (Activ vs. Pasiv)** | 90 min activ hands-on, 150 min braisage pasiv în cuptor; total 240 min pe calea critică. | `RecipeTiming.active_minutes`, `RecipeTiming.total_minutes` | **PARTIALLY SUPPORTED** | **Suportat:** Stocarea manuală a două valori scalare agregate.<br>**Limitare:** Modelul nu poate deduce sau valida calea critică din duratele pașilor (`duration_minutes`) în prezența pistelor paralele; însumarea naivă generează 280 min în loc de 240 min. |
| **Cicluri Multi-Sesiune (Zile Calendaristice)** | Maturare la rece la 4°C timp de 24h pentru degresare optimă și difuzie aromatică (J+1). | `RecipeTiming` (fără `session_id` sau `lead_time`) | **NOT SUPPORTED** | **Limitare:** Schema nu cunoaște pauzele de proces peste noapte. Includerea celor 24h denaturează `total_minutes` la 28 de ore de gătire continuă, iar omiterea lor pierde instrucțiunea tehnică de maturare. |
| **Transformări de Stare ale Ingredientelor** | Colagenul insolubil din spată se hidrolizează termic în gelatină solubilă; vinul devine concentrat acid. | `RecipeIngredient` (entitate statică) | **NOT SUPPORTED** | **Limitare:** Ingredientele sunt entități statice de inventar. Nu există conceptul de schimbare de fază sau evoluție fizico-chimică pe parcursul etapelor de gătire. |
| **Fracționarea Ingredientelor pe Pași** | Untul (60g) împărțit în: 20g glacare cepe, 25g sotare ciuperci, 15g *monter au beurre*. | `RecipeIngredient`, `RecipeStep.ingredient_refs` | **PARTIALLY SUPPORTED** | **Suportat:** Asocierea referinței de ingredient la pas.<br>**Limitare:** Nu se poate specifica cantitatea parțială consumată în pas (`quantity_used_in_step`), forțând multiplicarea artificială a slug-urilor în inventar. |
| **Toleranțe Cantitative și Intervale** | Adaos de lichid calibrat în funcție de evaporare; variații de greutate la carne ($\pm 5\%$). | `RecipeIngredient.quantity: number \| null` | **NOT SUPPORTED** | **Limitare:** Modelul suportă doar valori scalare exacte punctuale (ex: `1200`). Nu există suport nativ în schemă pentru toleranțe, intervale acceptabile (`min`/`max`) sau incertitudini de măsurare. |
| **Bariere și Constrângeri de Temperatură** | Menținerea lichidului la bare simmer (88–92°C) într-un cuptor la 150°C. | `RecipeStep.temperature_c: number \| null` | **PARTIALLY SUPPORTED** | **Suportat:** Înregistrarea valorii numerice a temperaturii ambientale/cuptorului.<br>**Limitare:** Câmpul este o proprietate pasivă a pasului, nu o barieră verificabilă pe temperatura internă a lichidului. |
| **Artefacte Intermediare de Proces** | Sosul brut strecurat și degresat devine o entitate distinctă ce este redusă la nappage. | Text nestructurat în `instruction` | **NOT SUPPORTED** | **Limitare:** Nu există conceptul de sub-produs sau artefact intermediar compozit (`produces: IntermediateArtifact`) care să poată fi referit ulterior ca input. |
| **Puncte Critice de Control (CCP)** | Evitarea fierberii clocotite ($>95^\circ\text{C}$) care usucă fibrele musculare și tulbură sosul. | Text nestructurat în `instruction` | **NOT SUPPORTED** | **Limitare:** Toți pașii au aceeași pondere; nu există un mecanism de semnalizare a riscului culinar sau a consecințelor nerespectării parametrilor termici. |
| **Criterii de Doneness (Senzorial vs. Mașină)** | Testul furculiței pe cubul de carne: pătrundere fără rezistență (*fondante*). | `RecipeStep.success_cue: string \| null` | **PARTIALLY SUPPORTED** | **Suportat:** Descriptor calitativ senzorial foarte util pentru bucătar.<br>**Limitare:** Fiind un șir de caractere liber, nu constituie o condiție măsurabilă sau validabilă automat de un sistem software. |
| **Fereastră de Servire la Masă** | Servire la cald la 65–70°C; toleranță mare la așteptare (30–60 min). | Nespecificat în `RecipeTiming` | **NOT SUPPORTED** | **Limitare:** Modelul nu dispune de o structură formală pentru ferestre de servire ancorate la un eveniment de referință (ex: retragerea de pe foc). |
| **Proveniență Editorială și Trasabilitate** | Escoffier (1903/1921), Child (1961), Bocuse (1976), McGee (2004). | `Recipe.sources: string[]`, `Recipe.claims` | **SUPPORTED** | **Suportat:** Verificat în `standards/v1.0.0/schemas/recipe.schema.json`; câmpurile `sources` și array-ul `claims` (cu `confidence` pe 4 niveluri) asigură o trasabilitate editorială curată. |
| **Persistență Relațională și Validare** | Integritate referențială, constrângeri NOT NULL, tranzacții SQLite. | `node:sqlite`, `src/shared/validation.ts` | **SUPPORTED** | **Suportat:** Verificat prin teste automate executate (`tests/repository.test.ts`, `tests/validation.test.ts` — 14 teste trecute); motorul relațional este stabil și deterministic. |

---

## 4. Concluzie Tehnică pentru TEST 003

Rețeta de *Boeuf Bourguignon* demonstrează fără echivoc că **Recipe Core V1 a fost optimizat pentru o reprezentare secvențială liniară, monovoltină (o singură sesiune continuă, un singur vas principal, ingrediente statice)**.

Deși rețeta poate fi stocată și validată în V1 prin **workaround-uri editoriale** (compactarea garniturilor în pași narativi lungi, omiterea celor 24 de ore de maturare din `timing.total_minutes`, duplicarea untului în lista de ingrediente), aceste soluții produc o **pierdere substanțială de semantică procesuală**. Un asistent digital de gătit sau o interfață interactivă (*Cooking UX*) nu ar putea ghida execuția sincronizată a garniturilor sau managementul degresării sosului exclusiv pe baza modelului de date V1.
